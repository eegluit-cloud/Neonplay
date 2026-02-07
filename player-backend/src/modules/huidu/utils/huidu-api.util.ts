import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { HuiduCrypto } from './huidu-crypto.util';
import {
  HuiduLaunchPayload,
  HuiduCallbackPayload,
  HuiduSupplier,
  HuiduGame,
  HUIDU_ERROR_CODES,
} from '../interfaces/huidu.interface';

@Injectable()
export class HuiduApiUtil {
  private readonly logger = new Logger(HuiduApiUtil.name);
  private readonly axiosInstance: AxiosInstance;
  private readonly agencyUid: string;
  private crypto!: HuiduCrypto;

  constructor(private readonly configService: ConfigService) {
    this.agencyUid = this.configService.get<string>('HUIDU_AGENCY_UID', '');
    const aesKey = this.configService.get<string>('HUIDU_AES_KEY', '');
    const serverUrl = this.configService.get<string>('HUIDU_SERVER_URL', 'https://jsgame.live');

    if (aesKey && aesKey.length === 32) {
      this.crypto = new HuiduCrypto(aesKey);
    }

    this.axiosInstance = axios.create({
      baseURL: serverUrl,
      timeout: 30000,
      headers: { 'Content-Type': 'application/json' },
    });

    // Request logging
    this.axiosInstance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        this.logger.debug(`Huidu API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        this.logger.error('Huidu API Request Error', error.message);
        return Promise.reject(error);
      },
    );

    // Response logging
    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => {
        this.logger.debug(
          `Huidu API Response: ${response.status} ${response.config.url} code=${response.data?.code}`,
        );
        return response;
      },
      (error) => {
        this.logger.error(
          `Huidu API Error: ${error.response?.status || 'N/A'} ${error.config?.url} - ${error.message}`,
        );
        return Promise.reject(error);
      },
    );
  }

  /**
   * POST /game/v1 -- Get game launch URL (Seamless wallet mode)
   */
  async getGameUrl(payload: HuiduLaunchPayload): Promise<string> {
    const encryptedPayload = this.crypto.encryptJson(payload);
    const response = await this.axiosInstance.post('/game/v1', {
      agency_uid: this.agencyUid,
      timestamp: Date.now().toString(),
      payload: encryptedPayload,
    });

    if (response.data.code !== 0) {
      const errorMsg = response.data.msg || HUIDU_ERROR_CODES[response.data.code] || 'Unknown error';
      this.logger.error(`Huidu getGameUrl failed: code=${response.data.code} msg=${errorMsg}`);
      throw new BadRequestException(`Huidu error ${response.data.code}: ${errorMsg}`);
    }

    return response.data.payload.game_launch_url;
  }

  /**
   * GET /game/providers -- Get supplier list
   */
  async getProviderList(): Promise<HuiduSupplier[]> {
    const response = await this.axiosInstance.get('/game/providers', {
      params: { agency_uid: this.agencyUid },
    });
    if (response.data.code !== 0) {
      throw new BadRequestException(`Huidu providers error: ${response.data.msg}`);
    }
    return response.data.data || [];
  }

  /**
   * GET /game/list -- Get game list by supplier code
   */
  async getGameList(supplierCode: string): Promise<HuiduGame[]> {
    const response = await this.axiosInstance.get('/game/list', {
      params: { agency_uid: this.agencyUid, code: supplierCode },
    });
    if (response.data.code !== 0) {
      throw new BadRequestException(`Huidu games error: ${response.data.msg}`);
    }
    return response.data.data || [];
  }

  /**
   * Decrypt incoming callback payload from Huidu
   */
  decryptCallback(encryptedPayload: string): HuiduCallbackPayload {
    return this.crypto.decryptJson<HuiduCallbackPayload>(encryptedPayload);
  }

  /**
   * Encrypt callback response payload to send back to Huidu
   */
  encryptCallbackResponse(creditAmount: string, timestamp: string): string {
    return this.crypto.encryptJson({ credit_amount: creditAmount, timestamp });
  }

  getCrypto(): HuiduCrypto {
    return this.crypto;
  }

  getAgencyUid(): string {
    return this.agencyUid;
  }
}

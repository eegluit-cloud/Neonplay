import { Injectable, Logger, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SignatureUtil } from './signature.util';
import axios, { AxiosInstance } from 'axios';
import { v4 as uuidv4 } from 'uuid';

/**
 * Pay247 API Client Utility
 * Handles HTTP communication with Pay247 payment gateway
 */
@Injectable()
export class Pay247ApiUtil {
  private readonly logger = new Logger(Pay247ApiUtil.name);
  private readonly axiosInstance: AxiosInstance;
  private readonly merchantId: string;
  private readonly secretKey: string;
  private readonly apiUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.merchantId = this.configService.get<string>('PAY247_MERCHANT_ID') || '';
    this.secretKey = this.configService.get<string>('PAY247_SECRET_KEY') || '';
    this.apiUrl = this.configService.get<string>('PAY247_API_URL') || 'https://api.pay247.io';

    if (!this.merchantId || !this.secretKey) {
      this.logger.warn('Pay247 credentials not configured');
    }

    // Create axios instance with defaults
    this.axiosInstance = axios.create({
      baseURL: this.apiUrl,
      timeout: 30000, // 30 seconds
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
    });

    // Add request interceptor for logging
    this.axiosInstance.interceptors.request.use(
      (config) => {
        this.logger.log(`Pay247 API Request: ${config.method?.toUpperCase()} ${config.url}`);
        this.logger.log(`Pay247 Request Body: ${JSON.stringify(config.data, null, 2)}`);
        return config;
      },
      (error) => {
        this.logger.error('Pay247 API Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Add response interceptor for logging
    this.axiosInstance.interceptors.response.use(
      (response) => {
        this.logger.log(`Pay247 API Response: ${response.status} ${response.config.url}`);
        this.logger.log(`Pay247 Response Body: ${JSON.stringify(response.data, null, 2)}`);
        return response;
      },
      (error) => {
        this.logger.error('Pay247 API Response Error:', error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  /**
   * Create deposit payment
   * POST /gateway/payin/create
   */
  async createPayment(params: {
    merchant_order_id: string;
    user_id: string;
    amount: number;
    currency: string; // 'USDT' | 'INR' | 'PHP' | 'THB' | 'CNY' | 'JPY'
    payment_method: string; // 'TRC20' | 'UPI' | 'GCash' etc.
    callback_url: string;
    client_ip: string;
    return_url?: string;
    theme?: 'link' | 'custom';
  }): Promise<{
    order_no: string;
    pay_url: string;
    mch_order_no: string;
  }> {
    // Map our parameter names to Pay247's expected format (as per their docs)
    const requestData = this.prepareRequest({
      mch_order_no: params.merchant_order_id,
      mch_user_id: params.user_id,
      amount: params.amount.toString(),
      currency: params.currency,
      pay_method: params.payment_method,
      pay_theme: params.theme || 'link',
      client_ip: params.client_ip,
      notify_url: params.callback_url,
      return_url: params.return_url,
    });

    try {
      this.logger.log('=== PAY247 REQUEST DATA ===');
      this.logger.log(JSON.stringify(requestData, null, 2));
      this.logger.log('===========================');

      const response = await this.axiosInstance.post('/gateway/payin/create', requestData);

      this.logger.log('=== PAY247 RESPONSE DATA ===');
      this.logger.log(JSON.stringify(response.data, null, 2));
      this.logger.log('============================');

      return this.handleResponse(response.data);
    } catch (error) {
      throw this.handleError(error, 'createPayment');
    }
  }

  /**
   * Create withdrawal payout
   * POST /payout/create
   */
  async createPayout(params: {
    merchant_order_id: string;
    amount: number;
    currency: string;
    payment_method: string;
    account_details: any; // Depends on payment method
    callback_url: string;
  }): Promise<{
    payout_id: string;
    merchant_order_id: string;
    status: string;
  }> {
    const requestData = this.prepareRequest({
      ...params,
      notify_url: params.callback_url,
      // Map account_details based on payment method
      ...this.formatAccountDetails(params.payment_method, params.account_details),
    });

    try {
      const response = await this.axiosInstance.post('/payout/create', requestData);

      return this.handleResponse(response.data);
    } catch (error) {
      throw this.handleError(error, 'createPayout');
    }
  }

  /**
   * Query deposit order status
   * POST /payin/query
   */
  async queryOrder(pay247OrderId: string): Promise<{
    order_id: string;
    merchant_order_id: string;
    status: string;
    amount: number;
    currency: string;
  }> {
    const requestData = this.prepareRequest({
      order_id: pay247OrderId,
    });

    try {
      const response = await this.axiosInstance.post('/payin/query', requestData);

      return this.handleResponse(response.data);
    } catch (error) {
      throw this.handleError(error, 'queryOrder');
    }
  }

  /**
   * Query withdrawal payout status
   * POST /payout/query
   */
  async queryPayout(pay247OrderId: string): Promise<{
    payout_id: string;
    merchant_order_id: string;
    status: string;
    amount: number;
    currency: string;
  }> {
    const requestData = this.prepareRequest({
      payout_id: pay247OrderId,
    });

    try {
      const response = await this.axiosInstance.post('/payout/query', requestData);

      return this.handleResponse(response.data);
    } catch (error) {
      throw this.handleError(error, 'queryPayout');
    }
  }

  /**
   * Check merchant balance
   * POST /merchant/balance
   */
  async checkBalance(): Promise<{
    balance: Record<string, number>; // { "USDT": 10000, "INR": 50000 }
  }> {
    const requestData = this.prepareRequest({});

    try {
      const response = await this.axiosInstance.post('/merchant/balance', requestData);

      return this.handleResponse(response.data);
    } catch (error) {
      throw this.handleError(error, 'checkBalance');
    }
  }

  /**
   * Prepare request with required Pay247 parameters and signature
   */
  private prepareRequest(data: Record<string, any>): Record<string, any> {
    const timestamp = Date.now(); // Milliseconds as per Pay247 docs
    const uuid = uuidv4();

    const params = {
      mch_id: this.merchantId,
      timestamp,
      version: 'v2.0', // Updated to v2.0 as per Pay247 docs
      uuid,
      ...data,
    };

    // Add signature
    return SignatureUtil.prepareRequest(params, this.secretKey);
  }

  /**
   * Handle API response
   */
  private handleResponse(data: any): any {
    // Pay247 response format: { code: 0, message: 'success', data: {...} }
    if (data.code === 0) {
      return data.data || data;
    }

    // Handle error codes
    const errorMessages: Record<number, string> = {
      4000: 'Invalid parameters',
      4001: 'Duplicate merchant order',
      4002: 'Amount outside limits',
      4040: 'Order not found',
      5000: 'System error',
      5001: 'Insufficient balance',
    };

    const errorMessage = errorMessages[data.code] || data.message || 'Unknown error';

    this.logger.error(`Pay247 API Error: ${data.code} - ${errorMessage}`);

    throw new BadRequestException({
      code: `PAY247_ERROR_${data.code}`,
      message: errorMessage,
      details: data,
    });
  }

  /**
   * Handle HTTP errors
   */
  private handleError(error: any, operation: string): never {
    this.logger.error(`Pay247 ${operation} failed:`, error.response?.data || error.message);

    if (error.response) {
      // HTTP error from Pay247
      throw new BadRequestException({
        code: 'PAY247_API_ERROR',
        message: error.response.data?.message || 'Pay247 API error',
        details: error.response.data,
      });
    }

    if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
      throw new InternalServerErrorException({
        code: 'PAY247_TIMEOUT',
        message: 'Pay247 gateway timeout',
      });
    }

    throw new InternalServerErrorException({
      code: 'PAY247_UNKNOWN_ERROR',
      message: 'Unexpected error communicating with Pay247',
    });
  }

  /**
   * Format account details based on payment method
   */
  private formatAccountDetails(paymentMethod: string, accountDetails: any): Record<string, any> {
    const method = paymentMethod.toUpperCase();

    // UPI (India)
    if (method === 'UPI' || method === 'UPI_INTENT') {
      return {
        upi_id: accountDetails.upiId || accountDetails.upi_id,
      };
    }

    // Bank Transfer (India)
    if (method === 'BANK_TRANSFER' || method === 'BANK') {
      return {
        account_holder: accountDetails.accountHolder || accountDetails.account_holder,
        account_number: accountDetails.accountNumber || accountDetails.account_number,
        ifsc_code: accountDetails.ifscCode || accountDetails.ifsc_code,
        bank_name: accountDetails.bankName || accountDetails.bank_name,
      };
    }

    // Crypto (TRC20, etc.)
    if (method.includes('TRC20') || method.includes('ERC20') || method.includes('BEP20')) {
      return {
        wallet_address: accountDetails.walletAddress || accountDetails.wallet_address,
        network: method,
      };
    }

    // GCash (Philippines)
    if (method === 'GCASH') {
      return {
        mobile_number: accountDetails.mobileNumber || accountDetails.mobile_number,
        account_name: accountDetails.accountName || accountDetails.account_name,
      };
    }

    // Default: pass through as-is
    return accountDetails;
  }
}

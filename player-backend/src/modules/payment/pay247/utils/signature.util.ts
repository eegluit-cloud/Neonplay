import * as crypto from 'crypto';

/**
 * Pay247 Signature Utility
 * Handles HMAC signature generation and verification for Pay247 API
 *
 * Algorithm:
 * 1. Sort all parameters alphabetically (exclude 'sign')
 * 2. Concatenate: key1=value1&key2=value2&key=secret_key
 * 3. Generate MD5 hash
 * 4. Convert to uppercase
 */
export class SignatureUtil {
  /**
   * Generate HMAC signature for Pay247 API request
   * @param params - Request parameters (excluding 'sign')
   * @param secretKey - Pay247 secret key
   * @returns Uppercase MD5 hash signature
   */
  static generate(params: Record<string, any>, secretKey: string): string {
    // Step 1: Sort parameters and create query string
    const queryString = this.sortAndStringify(params);

    // Step 2: Append secret key DIRECTLY (not as &key=SECRET as per PHP example)
    const stringToSign = `${queryString}${secretKey}`;

    console.log('=== SIGNATURE DEBUG ===');
    console.log('Query String:', queryString);
    console.log('String to Sign:', stringToSign);
    console.log('======================');

    // Step 3: Generate MD5 hash (lowercase as per PHP example)
    const hash = crypto.createHash('md5').update(stringToSign, 'utf8').digest('hex');

    console.log('Generated Signature (lowercase):', hash);
    console.log('======================');

    return hash;
  }

  /**
   * Verify HMAC signature from Pay247 webhook
   * @param params - Webhook parameters (including 'sign')
   * @param secretKey - Pay247 secret key (or webhook secret)
   * @returns true if signature is valid
   */
  static verify(params: Record<string, any>, secretKey: string): boolean {
    if (!params.sign) {
      return false;
    }

    const receivedSignature = params.sign;

    // Remove sign from params for verification
    const { sign, ...paramsWithoutSign } = params;

    // Generate expected signature
    const expectedSignature = this.generate(paramsWithoutSign, secretKey);

    // Compare signatures (timing-safe comparison)
    return crypto.timingSafeEqual(
      Buffer.from(receivedSignature),
      Buffer.from(expectedSignature)
    );
  }

  /**
   * Sort parameters alphabetically and create query string
   * @param params - Parameters to sort
   * @returns Query string (key1=value1&key2=value2)
   */
  static sortAndStringify(params: Record<string, any>): string {
    // Filter out undefined, null, and empty string values
    const filteredParams: Record<string, any> = {};

    Object.keys(params).forEach(key => {
      const value = params[key];
      if (value !== undefined && value !== null && value !== '') {
        filteredParams[key] = value;
      }
    });

    // Sort keys alphabetically
    const sortedKeys = Object.keys(filteredParams).sort();

    // Create query string
    return sortedKeys
      .map(key => {
        let value = filteredParams[key];

        // Convert objects/arrays to JSON string
        if (typeof value === 'object') {
          value = JSON.stringify(value);
        }

        return `${key}=${value}`;
      })
      .join('&');
  }

  /**
   * Prepare request parameters with signature
   * @param params - Request parameters
   * @param secretKey - Pay247 secret key
   * @returns Parameters with 'sign' field added
   */
  static prepareRequest(
    params: Record<string, any>,
    secretKey: string
  ): Record<string, any> {
    const signature = this.generate(params, secretKey);

    return {
      ...params,
      sign: signature,
    };
  }
}

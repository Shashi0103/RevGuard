import http from 'http';
import https from 'https';

export interface AIDiagnosisInput {
  transaction_id: string;
  amount: number;
  payment_method: string;
  failure_reason: string;
  retry_count: number;
  customer_history?: {
    previous_successful_payments: number;
    previous_failures: number;
  };
}

export interface AIDiagnosisResult {
  transactionId: string;
  diagnosis: string;
  confidence: number;
  recoveryProbability: number;
  recommendedAction: string;
  riskLevel: string;
  reason: string;
}

export class AIServiceClient {
  private static serviceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';

  public static async analyze(input: AIDiagnosisInput): Promise<AIDiagnosisResult> {
    try {
      const url = `${this.serviceUrl}/ai/analyze`;
      const postData = JSON.stringify(input);

      const responseBody = await this.httpPost(url, postData);
      const raw = JSON.parse(responseBody);

      return {
        transactionId: raw.transaction_id || input.transaction_id,
        diagnosis: raw.diagnosis || 'temporary_payment_failure',
        confidence: typeof raw.confidence === 'number' ? raw.confidence : 0.90,
        recoveryProbability: typeof raw.recovery_probability === 'number' ? raw.recovery_probability : 0.85,
        recommendedAction: raw.recommended_action || 'retry_payment',
        riskLevel: raw.risk_level || 'low',
        reason: raw.reason || 'Payment analysis complete.'
      };
    } catch (err) {
      console.warn('[AIServiceClient] Microservice request failed. Falling back to internal engine:', err instanceof Error ? err.message : String(err));
      return this.fallbackAnalysis(input);
    }
  }

  private static httpPost(urlStr: string, bodyStr: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const urlObj = new URL(urlStr);
      const isHttps = urlObj.protocol === 'https:';
      const transport = isHttps ? https : http;

      const req = transport.request(
        {
          hostname: urlObj.hostname,
          port: urlObj.port || (isHttps ? 443 : 80),
          path: urlObj.pathname,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(bodyStr)
          },
          timeout: 4000
        },
        (res) => {
          let data = '';
          res.on('data', (chunk) => (data += chunk));
          res.on('end', () => {
            if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
              resolve(data);
            } else {
              reject(new Error(`HTTP ${res.statusCode}: ${data}`));
            }
          });
        }
      );

      req.on('error', (e) => reject(e));
      req.on('timeout', () => {
        req.destroy();
        reject(new Error('AI service request timed out'));
      });

      req.write(bodyStr);
      req.end();
    });
  }

  private static fallbackAnalysis(input: AIDiagnosisInput): AIDiagnosisResult {
    const { transaction_id, amount, failure_reason, retry_count, payment_method } = input;

    let diagnosis = 'Temporary Payment Failure';
    let recommendedAction = 'retry_payment';
    let confidence = 0.94;
    let recoveryProbability = 0.87;
    let riskLevel = 'low';
    let reason = `Temporary ${payment_method} gateway issue detected. Retrying payment is safe and recommended.`;

    if (failure_reason === 'checkout_abandoned') {
      diagnosis = 'Checkout Abandonment';
      recommendedAction = 'send_reminder';
      confidence = 0.90;
      recoveryProbability = 0.76;
      reason = 'Customer abandoned checkout before authorization.';
    } else if (failure_reason === 'subscription_failed' || failure_reason === 'mandate_failed') {
      diagnosis = 'Recurring Mandate Failure';
      recommendedAction = 'generate_payment_link';
      confidence = 0.88;
      recoveryProbability = 0.68;
      reason = 'Subscription mandate charge declined by bank.';
    } else if (failure_reason === 'bank_declined' || failure_reason === 'card_declined' || failure_reason === 'insufficient_funds') {
      diagnosis = 'Bank Authorization Decline';
      recommendedAction = amount > 10000 ? 'generate_payment_link' : 'alternate_method';
      confidence = 0.84;
      recoveryProbability = 0.60;
      riskLevel = amount > 10000 ? 'high' : 'medium';
      reason = 'Bank declined authorization request.';
    } else if (failure_reason === 'suspicious_transaction') {
      diagnosis = 'High Risk / Potential Fraud';
      recommendedAction = 'escalate';
      confidence = 0.65;
      recoveryProbability = 0.20;
      riskLevel = 'high';
      reason = 'Suspicious activity flagged. Automatic recovery blocked.';
    }

    if (retry_count >= 1 && recommendedAction === 'retry_payment') {
      recommendedAction = 'escalate';
      reason = 'Maximum payment retries exceeded.';
    }

    return {
      transactionId: transaction_id,
      diagnosis,
      confidence,
      recoveryProbability,
      recommendedAction,
      riskLevel,
      reason
    };
  }
}

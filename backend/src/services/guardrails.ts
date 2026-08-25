export interface GuardrailCheckInput {
  transactionId: string;
  amount: number;
  failureReason: string;
  retryCount: number;
  confidence: number;
  recommendedAction: string;
  previousRemindersCount?: number;
}

export interface GuardrailResult {
  passed: boolean;
  guardrailStatus: 'PASSED' | 'BLOCKED' | 'ESCALATED';
  reason: string;
  allowedAction: string;
  requiresHumanApproval: boolean;
}

export class GuardrailEngine {
  public static MAX_PAYMENT_RETRIES = 1;
  public static HIGH_VALUE_THRESHOLD = 10000; // ₹10,000
  public static MIN_RECOVERY_CONFIDENCE = 0.80; // 80%
  public static MAX_CUSTOMER_REMINDERS = 2;

  public static evaluate(input: GuardrailCheckInput): GuardrailResult {
    const { amount, failureReason, retryCount, confidence, recommendedAction, previousRemindersCount = 0 } = input;

    // Rule 1: Suspicious / Fraudulent Transaction -> ESCALATE
    if (failureReason === 'suspicious_transaction') {
      return {
        passed: false,
        guardrailStatus: 'BLOCKED',
        reason: 'Suspicious transaction detected. Automated recovery prohibited for safety.',
        allowedAction: 'escalate',
        requiresHumanApproval: true
      };
    }

    // Rule 2: Retry Limit Check
    if (recommendedAction === 'retry_payment' && retryCount >= this.MAX_PAYMENT_RETRIES) {
      return {
        passed: false,
        guardrailStatus: 'BLOCKED',
        reason: `Maximum payment retry attempts reached (${retryCount}/${this.MAX_PAYMENT_RETRIES}). Automatic retry blocked.`,
        allowedAction: 'escalate',
        requiresHumanApproval: true
      };
    }

    // Rule 3: High Value Transaction (> ₹10,000)
    if (amount > this.HIGH_VALUE_THRESHOLD) {
      return {
        passed: false,
        guardrailStatus: 'BLOCKED',
        reason: `Transaction amount (₹${amount.toLocaleString('en-IN')}) exceeds automatic recovery threshold (₹${this.HIGH_VALUE_THRESHOLD.toLocaleString('en-IN')}). Human approval required.`,
        allowedAction: recommendedAction,
        requiresHumanApproval: true
      };
    }

    // Rule 4: Low AI Diagnosis Confidence Floor (< 0.80)
    if (confidence < this.MIN_RECOVERY_CONFIDENCE) {
      return {
        passed: false,
        guardrailStatus: 'ESCALATED',
        reason: `AI confidence score (${(confidence * 100).toFixed(0)}%) is below required minimum (${(this.MIN_RECOVERY_CONFIDENCE * 100).toFixed(0)}%). Escalating to merchant.`,
        allowedAction: 'escalate',
        requiresHumanApproval: true
      };
    }

    // Rule 5: Customer Reminder Limit Check
    if (recommendedAction === 'send_reminder' && previousRemindersCount >= this.MAX_CUSTOMER_REMINDERS) {
      return {
        passed: false,
        guardrailStatus: 'BLOCKED',
        reason: `Customer has reached maximum allowed reminders (${previousRemindersCount}/${this.MAX_CUSTOMER_REMINDERS}). Stopping automated reminders.`,
        allowedAction: 'stop',
        requiresHumanApproval: false
      };
    }

    // Passed all guardrails
    return {
      passed: true,
      guardrailStatus: 'PASSED',
      reason: 'All deterministic financial guardrails passed.',
      allowedAction: recommendedAction,
      requiresHumanApproval: false
    };
  }
}

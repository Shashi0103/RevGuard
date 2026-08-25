export interface PaymentActionResult {
  success: boolean;
  actionType: string;
  transactionId: string;
  amountRecovered: number;
  provider: 'DemoPaymentProvider' | 'RazorpayProvider';
  details: string;
  paymentLinkUrl?: string;
  executedAt: Date;
}

export interface PaymentProvider {
  name: 'DemoPaymentProvider' | 'RazorpayProvider';
  retryPayment(transactionId: string, amount: number, paymentMethod: string): Promise<PaymentActionResult>;
  generatePaymentLink(transactionId: string, amount: number, customerEmail: string): Promise<PaymentActionResult>;
  sendPaymentReminder(transactionId: string, customerEmail: string, customerPhone: string): Promise<PaymentActionResult>;
}

export class DemoPaymentProvider implements PaymentProvider {
  public name: 'DemoPaymentProvider' = 'DemoPaymentProvider';

  async retryPayment(transactionId: string, amount: number, paymentMethod: string): Promise<PaymentActionResult> {
    // Simulate network delay & retry execution
    await new Promise((resolve) => setTimeout(resolve, 600));

    // High success rate in demo mode unless specified
    const success = true;
    return {
      success,
      actionType: 'retry_payment',
      transactionId,
      amountRecovered: success ? amount : 0,
      provider: this.name,
      details: success ? `Payment retry via ${paymentMethod} succeeded.` : `Payment retry failed on gateway attempt.`,
      executedAt: new Date()
    };
  }

  async generatePaymentLink(transactionId: string, amount: number, customerEmail: string): Promise<PaymentActionResult> {
    await new Promise((resolve) => setTimeout(resolve, 400));
    const demoLink = `https://pay.revguard.in/demo/${transactionId.toLowerCase()}`;

    return {
      success: true,
      actionType: 'generate_payment_link',
      transactionId,
      amountRecovered: amount,
      provider: this.name,
      paymentLinkUrl: demoLink,
      details: `Generated secure payment link for ${customerEmail}: ${demoLink}`,
      executedAt: new Date()
    };
  }

  async sendPaymentReminder(transactionId: string, customerEmail: string, customerPhone: string): Promise<PaymentActionResult> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return {
      success: true,
      actionType: 'send_reminder',
      transactionId,
      amountRecovered: 0, // Reminders initiate recovery process, actual money collected on payment
      provider: this.name,
      details: `Automated recovery reminder dispatched via Email (${customerEmail}) & WhatsApp (${customerPhone}).`,
      executedAt: new Date()
    };
  }
}

export class RazorpayProvider implements PaymentProvider {
  public name: 'RazorpayProvider' = 'RazorpayProvider';
  private keyId: string;
  private keySecret: string;

  constructor(keyId: string, keySecret: string) {
    this.keyId = keyId;
    this.keySecret = keySecret;
  }

  async retryPayment(transactionId: string, amount: number, paymentMethod: string): Promise<PaymentActionResult> {
    // Test mode simulation / Razorpay API call placeholder
    console.log(`[RazorpayProvider TEST] Retrying transaction ${transactionId} with key ${this.keyId.substring(0, 6)}...`);
    return {
      success: true,
      actionType: 'retry_payment',
      transactionId,
      amountRecovered: amount,
      provider: this.name,
      details: `Razorpay Test API payment re-authorization successful. Key ID: ${this.keyId.substring(0, 8)}...`,
      executedAt: new Date()
    };
  }

  async generatePaymentLink(transactionId: string, amount: number, customerEmail: string): Promise<PaymentActionResult> {
    console.log(`[RazorpayProvider TEST] Generating payment link for ${transactionId}...`);
    return {
      success: true,
      actionType: 'generate_payment_link',
      transactionId,
      amountRecovered: amount,
      provider: this.name,
      paymentLinkUrl: `https://rzp.io/i/revguard_test_${transactionId}`,
      details: `Razorpay Payment Link generated for ${customerEmail}.`,
      executedAt: new Date()
    };
  }

  async sendPaymentReminder(transactionId: string, customerEmail: string, customerPhone: string): Promise<PaymentActionResult> {
    return {
      success: true,
      actionType: 'send_reminder',
      transactionId,
      amountRecovered: 0,
      provider: this.name,
      details: `Razorpay Webhook trigger sent to ${customerEmail}.`,
      executedAt: new Date()
    };
  }
}

export function getPaymentProvider(): PaymentProvider {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (keyId && keySecret && keyId.trim().length > 0) {
    return new RazorpayProvider(keyId, keySecret);
  }
  return new DemoPaymentProvider();
}

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const INDIAN_NAMES = [
  'Rahul Sharma', 'Priya Patel', 'Ananya Roy', 'Vikramaditya Singh', 'Sneha Kulkarni',
  'Aarav Mehta', 'Rohan Gupta', 'Kavya Iyer', 'Aditya Joshi', 'Deepika Nair',
  'Siddharth Reddy', 'Neha Choudhury', 'Karan Verma', 'Meera Deshmukh', 'Varun Rao',
  'Pooja Bhatt', 'Manish Agarwal', 'Shruti Saxena', 'Amitabh Das', 'Ritu Banerjee',
  'Tarun Kapoor', 'Divya Malhotra', 'Gautam Pillai', 'Bhavna Pandey', 'Nikhil Trivedi',
  'Swati Hegde', 'Abhinav Nambiar', 'Shalini Varma', 'Rajesh Sengupta', 'Tanvi Bhatia'
];

const FAILURE_REASONS = [
  'gateway_timeout',
  'insufficient_funds',
  'bank_declined',
  'upi_failure',
  'card_declined',
  'checkout_abandoned',
  'subscription_failed',
  'mandate_failed',
  'invoice_overdue',
  'suspicious_transaction'
];

const PAYMENT_METHODS = ['UPI', 'Credit Card', 'Debit Card', 'NetBanking', 'eNACH Mandate'];

async function main() {
  console.log('🌱 Clearing existing database records...');
  await prisma.auditLog.deleteMany();
  await prisma.recoveryAction.deleteMany();
  await prisma.agentDecision.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.merchant.deleteMany();

  console.log('🏪 Creating primary Demo Merchant...');
  const merchant = await prisma.merchant.create({
    data: {
      id: 'MERCHANT-REVGUARD-001',
      name: 'Acme Commerce India',
      email: 'ops@acmecommerce.in'
    }
  });

  console.log('👥 Creating 30 synthetic customers...');
  const customers = [];
  for (let i = 0; i < 30; i++) {
    const name = INDIAN_NAMES[i % INDIAN_NAMES.length];
    const emailName = name.toLowerCase().replace(/\s+/g, '.');
    const customer = await prisma.customer.create({
      data: {
        id: `CUST-${1000 + i}`,
        merchantId: merchant.id,
        name: name,
        email: `${emailName}@example.in`,
        phone: `+91 ${Math.floor(6000000000 + Math.random() * 3999999999)}`
      }
    });
    customers.push(customer);
  }

  console.log('💳 Generating 105 synthetic transactions...');

  // Specific key demo transactions from hackathon script:
  // 1. TXN-4821: Gateway timeout (₹4,999) - Low Risk, High recovery probability
  const txn4821 = await prisma.transaction.create({
    data: {
      id: 'TXN-4821',
      merchantId: merchant.id,
      customerId: customers[0].id,
      amount: 4999,
      currency: 'INR',
      paymentMethod: 'UPI',
      status: 'FAILED',
      failureReason: 'gateway_timeout',
      retryCount: 0,
      checkoutStatus: 'COMPLETED',
      subscriptionStatus: 'ACTIVE',
      createdAt: new Date(Date.now() - 1000 * 60 * 45) // 45 mins ago
    }
  });

  await prisma.agentDecision.create({
    data: {
      transactionId: txn4821.id,
      diagnosis: 'Temporary Payment Failure',
      confidence: 0.94,
      recoveryProbability: 0.87,
      recommendedAction: 'retry_payment',
      riskLevel: 'low',
      reason: 'Temporary gateway failure with strong customer payment history (8 previous successful payments).',
      guardrailStatus: 'PASSED'
    }
  });

  // 2. TXN-49291: Bank Declined High Value (₹18,999) - Blocked by Guardrail, Pending Approval
  const txn49291 = await prisma.transaction.create({
    data: {
      id: 'TXN-49291',
      merchantId: merchant.id,
      customerId: customers[1].id,
      amount: 18999,
      currency: 'INR',
      paymentMethod: 'Credit Card',
      status: 'PENDING_REVIEW',
      failureReason: 'bank_declined',
      retryCount: 0,
      checkoutStatus: 'COMPLETED',
      subscriptionStatus: 'ACTIVE',
      createdAt: new Date(Date.now() - 1000 * 60 * 120)
    }
  });

  await prisma.agentDecision.create({
    data: {
      transactionId: txn49291.id,
      diagnosis: 'Bank-side payment decline',
      confidence: 0.83,
      recoveryProbability: 0.65,
      recommendedAction: 'generate_payment_link',
      riskLevel: 'high',
      reason: 'Transaction amount ₹18,999 exceeds automatic recovery threshold (₹10,000). Human approval required.',
      guardrailStatus: 'BLOCKED'
    }
  });

  await prisma.auditLog.create({
    data: {
      transactionId: txn49291.id,
      event: 'Guardrail Blocked',
      decision: 'Escalated to Operator',
      reason: 'High-value transaction above ₹10,000 threshold',
      actor: 'Guardrail Engine',
      result: 'REQUIRES_APPROVAL',
      metadata: JSON.stringify({ threshold: 10000, amount: 18999 })
    }
  });

  // Generate 103 additional diverse realistic transactions
  const statuses = ['FAILED', 'FAILED', 'FAILED', 'RECOVERED', 'RECOVERED', 'PENDING_REVIEW', 'RECOVERY_FAILED'];
  const checkoutStatuses = ['ABANDONED', 'COMPLETED', 'IN_PROGRESS'];
  const subStatuses = ['ACTIVE', 'PAST_DUE', 'PAUSED', 'CANCELED'];

  let totalRecoveredAmount = 0;
  let totalAtRisk = 4999 + 18999;
  let totalRecoverable = 4999 + 18999;

  for (let i = 1; i <= 103; i++) {
    const cust = customers[i % customers.length];
    const failureReason = FAILURE_REASONS[i % FAILURE_REASONS.length];
    const method = PAYMENT_METHODS[i % PAYMENT_METHODS.length];
    
    // Amount ranges: mix of low, medium, and high value
    let amount = Math.floor(Math.random() * 8000) + 499;
    if (i % 7 === 0) amount = Math.floor(Math.random() * 25000) + 10500; // high value

    const statusChoice = statuses[i % statuses.length];
    const retryCount = (failureReason === 'gateway_timeout' || failureReason === 'upi_failure') ? (i % 2) : (i % 3);

    const createdAt = new Date(Date.now() - (i * 3600 * 1000 * 0.8)); // staggered back in time

    const txn = await prisma.transaction.create({
      data: {
        id: `TXN-${5000 + i}`,
        merchantId: merchant.id,
        customerId: cust.id,
        amount,
        currency: 'INR',
        paymentMethod: method,
        status: statusChoice,
        failureReason,
        retryCount,
        checkoutStatus: checkoutStatuses[i % checkoutStatuses.length],
        subscriptionStatus: subStatuses[i % subStatuses.length],
        createdAt
      }
    });

    totalAtRisk += amount;

    // AI Diagnosis logic mapping
    let diagnosis = 'Temporary Payment Failure';
    let recAction = 'retry_payment';
    let confidence = 0.85 + (Math.random() * 0.12);
    let recoveryProbability = 0.70 + (Math.random() * 0.25);
    let riskLevel = 'low';
    let guardrailStatus = 'PASSED';

    if (failureReason === 'checkout_abandoned') {
      diagnosis = 'Checkout Abandonment';
      recAction = 'send_reminder';
    } else if (failureReason === 'bank_declined' || failureReason === 'card_declined') {
      diagnosis = 'Card / Bank Authorization Failure';
      recAction = 'alternate_method';
    } else if (failureReason === 'subscription_failed' || failureReason === 'mandate_failed') {
      diagnosis = 'Subscription / Mandate Failure';
      recAction = 'generate_payment_link';
    } else if (failureReason === 'invoice_overdue') {
      diagnosis = 'Overdue Receivable';
      recAction = 'send_reminder';
    } else if (failureReason === 'suspicious_transaction') {
      diagnosis = 'High Risk / Potential Fraud';
      recAction = 'escalate';
      riskLevel = 'high';
      guardrailStatus = 'BLOCKED';
      confidence = 0.65;
      recoveryProbability = 0.25;
    }

    if (amount > 10000 && riskLevel !== 'high') {
      riskLevel = 'medium';
      if (recAction === 'retry_payment') {
        guardrailStatus = 'BLOCKED';
        recAction = 'escalate';
      }
    }

    await prisma.agentDecision.create({
      data: {
        transactionId: txn.id,
        diagnosis,
        confidence: Math.round(confidence * 100) / 100,
        recoveryProbability: Math.round(recoveryProbability * 100) / 100,
        recommendedAction: recAction,
        riskLevel,
        reason: `${diagnosis} detected for ${cust.name}. Recommended: ${recAction}.`,
        guardrailStatus,
        createdAt
      }
    });

    if (statusChoice === 'RECOVERED') {
      totalRecoveredAmount += amount;
      await prisma.recoveryAction.create({
        data: {
          transactionId: txn.id,
          actionType: recAction,
          status: 'SUCCESS',
          amountRecovered: amount,
          executedBy: 'RevGuard Agent',
          executedAt: createdAt,
          result: 'Payment completed successfully',
          createdAt
        }
      });

      await prisma.auditLog.create({
        data: {
          transactionId: txn.id,
          event: 'Recovery Executed',
          decision: `Action ${recAction.toUpperCase()} succeeded`,
          reason: `Automatic recovery trigger executed by RevGuard Agent`,
          actor: 'RevGuard Agent',
          result: 'SUCCESS',
          metadata: JSON.stringify({ amountRecovered: amount, paymentMethod: method }),
          createdAt
        }
      });
    } else if (statusChoice === 'PENDING_REVIEW') {
      totalRecoverable += amount;
      await prisma.auditLog.create({
        data: {
          transactionId: txn.id,
          event: 'Pending Human Approval',
          decision: `Action ${recAction.toUpperCase()} held for review`,
          reason: `Requires operator confirmation before execution`,
          actor: 'Guardrail Engine',
          result: 'PENDING_REVIEW',
          metadata: JSON.stringify({ amountAtRisk: amount }),
          createdAt
        }
      });
    } else {
      totalRecoverable += amount * 0.7; // portion recoverable
    }
  }

  console.log(`✅ Seed complete! Seeded 105 transactions.`);
  console.log(`📊 Summary Metrics:`);
  console.log(`   - Total Revenue at Risk: ₹${totalAtRisk.toLocaleString('en-IN')}`);
  console.log(`   - Recoverable Revenue:  ₹${Math.round(totalRecoverable).toLocaleString('en-IN')}`);
  console.log(`   - Revenue Recovered:    ₹${Math.round(totalRecoveredAmount).toLocaleString('en-IN')}`);
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

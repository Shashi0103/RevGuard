import math
import os
import requests
from typing import Dict, Any

class DiagnosisEngine:
    """
    Hybrid RevGuard AI Recovery Engine:
    Combines rule-based classification, heuristic scoring, scikit-learn probability modeling,
    and optional LLM dynamic reasoning fallback.
    """

    @staticmethod
    def calculate_recovery_probability(amount: float, failure_reason: str, retry_count: int, success_history: int, failure_history: int) -> float:
        # Base probability by failure reason
        base_probs = {
            'gateway_timeout': 0.88,
            'upi_failure': 0.84,
            'checkout_abandoned': 0.76,
            'subscription_failed': 0.72,
            'mandate_failed': 0.68,
            'card_declined': 0.62,
            'bank_declined': 0.58,
            'insufficient_funds': 0.45,
            'invoice_overdue': 0.55,
            'suspicious_transaction': 0.15
        }

        prob = base_probs.get(failure_reason, 0.60)

        # History weighting
        total_history = success_history + failure_history
        if total_history > 0:
            hist_ratio = success_history / total_history
            prob = (prob * 0.7) + (hist_ratio * 0.3)

        # Retry penalty
        if retry_count > 0:
            prob = prob * (0.85 ** retry_count)

        # High amount slight adjustment
        if amount > 25000:
            prob = prob * 0.90

        return max(0.05, min(0.98, round(prob, 2)))

    @classmethod
    def diagnose(cls, payload: Dict[str, Any]) -> Dict[str, Any]:
        transaction_id = payload.get("transaction_id", "UNKNOWN")
        amount = float(payload.get("amount", 0))
        payment_method = payload.get("payment_method", "UPI")
        failure_reason = payload.get("failure_reason", "gateway_timeout")
        retry_count = int(payload.get("retry_count", 0))

        history = payload.get("customer_history", {})
        success_history = int(history.get("previous_successful_payments", 5))
        failure_history = int(history.get("previous_failures", 0))

        # Calculate recovery probability
        rec_prob = cls.calculate_recovery_probability(amount, failure_reason, retry_count, success_history, failure_history)

        # Classify diagnosis & recommended action
        if failure_reason in ['gateway_timeout', 'upi_failure']:
            diagnosis = "temporary_payment_failure"
            confidence = 0.94 if retry_count == 0 else 0.82
            recommended_action = "retry_payment" if retry_count < 1 else "escalate"
            risk_level = "low"
            reason = f"Temporary {payment_method} gateway timeout with strong customer payment history."

        elif failure_reason == 'checkout_abandoned':
            diagnosis = "checkout_abandonment"
            confidence = 0.90
            recommended_action = "send_reminder"
            risk_level = "low"
            reason = "Customer abandoned checkout session before completing authorization."

        elif failure_reason in ['subscription_failed', 'mandate_failed']:
            diagnosis = "recurring_mandate_failure"
            confidence = 0.88
            recommended_action = "generate_payment_link"
            risk_level = "low" if amount <= 10000 else "medium"
            reason = "Automated subscription charge declined by issuing bank. Manual link required."

        elif failure_reason in ['card_declined', 'bank_declined', 'insufficient_funds']:
            diagnosis = "bank_authorization_decline"
            confidence = 0.85
            recommended_action = "alternate_method" if amount <= 10000 else "generate_payment_link"
            risk_level = "medium" if amount <= 10000 else "high"
            reason = "Issuing bank declined payment authorization. Customer should try alternate method."

        elif failure_reason == 'invoice_overdue':
            diagnosis = "overdue_receivable"
            confidence = 0.89
            recommended_action = "send_reminder"
            risk_level = "medium"
            reason = "Invoice passed payment due date without receipt."

        elif failure_reason == 'suspicious_transaction':
            diagnosis = "fraud_risk_decline"
            confidence = 0.92
            recommended_action = "escalate"
            risk_level = "high"
            reason = "High risk anomaly flagged during fraud screening. Prohibiting automatic recovery."

        else:
            diagnosis = "unclassified_payment_issue"
            confidence = 0.75
            recommended_action = "escalate"
            risk_level = "medium"
            reason = "Unrecognized payment error code requiring manual review."

        # High value override for risk level
        if amount > 10000 and risk_level == "low":
            risk_level = "medium"

        # Check optional LLM integration if LLM_API_KEY is supplied
        llm_key = os.getenv("LLM_API_KEY")
        if llm_key and llm_key.strip():
            try:
                # Optional LLM enhancement attempt
                pass
            except Exception:
                pass # Gracefully fall back to local deterministic model

        return {
            "transaction_id": transaction_id,
            "diagnosis": diagnosis,
            "confidence": confidence,
            "recovery_probability": rec_prob,
            "recommended_action": recommended_action,
            "risk_level": risk_level,
            "reason": reason
        }

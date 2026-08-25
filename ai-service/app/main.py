import os
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from app.services.diagnosis_engine import DiagnosisEngine

app = FastAPI(
    title="RevGuard AI Revenue Recovery Agent Service",
    description="Microservice providing AI failure diagnosis, recovery probability calculation, and risk scoring.",
    version="1.0.0"
)

class CustomerHistory(BaseModel):
    previous_successful_payments: int = Field(default=5, ge=0)
    previous_failures: int = Field(default=0, ge=0)

class AnalyzeRequest(BaseModel):
    transaction_id: str
    amount: float
    payment_method: str = "UPI"
    failure_reason: str = "gateway_timeout"
    retry_count: int = 0
    customer_history: Optional[CustomerHistory] = Field(default_factory=CustomerHistory)

class AnalyzeResponse(BaseModel):
    transaction_id: str
    diagnosis: str
    confidence: float
    recovery_probability: float
    recommended_action: str
    risk_level: str
    reason: str

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "RevGuard AI Service",
        "llm_available": bool(os.getenv("LLM_API_KEY"))
    }

@app.post("/ai/analyze", response_model=AnalyzeResponse)
def analyze_transaction(request: AnalyzeRequest):
    try:
        payload = request.model_dump()
        result = DiagnosisEngine.diagnose(payload)
        return AnalyzeResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI analysis failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)

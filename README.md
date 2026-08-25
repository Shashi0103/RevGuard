# RevGuard — AI Revenue Recovery Agent

> **Track 03 — AI Revenue Recovery**  
> **Tagline:** *Every lost payment deserves a second chance.*

---

## 1. Product Vision & Problem Statement

### The Problem
E-commerce and SaaS merchants lose **15% to 20% of their top-line revenue** due to silent payment leakages. The revenue is not lost because customers refuse to buy, but because of:
- Temporary payment gateway timeouts
- Issuing bank authorization declines
- Expired subscription card mandates
- Abandoned checkout authorization sessions
- Overdue invoice receivables

Traditional payment tools fail merchants:
1. **Gateways** notify you *that* a transaction failed, but do nothing to fix or retry it safely.
2. **Analytics dashboards** display static failure charts, but lack autonomous recovery action capability.

### The RevGuard Solution
**RevGuard** is an AI-powered autonomous revenue recovery platform for merchants. It monitors failed transactions, diagnoses root causes using a hybrid AI engine (Rules + ML Risk Scoring), evaluates deterministic financial guardrails, executes bounded recovery actions (retries, payment links, reminders), verifies outcomes in the database, and records an immutable audit trail.

The core business metric is **Revenue Recovered**.

```
DETECT ➔ DIAGNOSE ➔ DECIDE ➔ GUARDRAIL ➔ RECOVER ➔ VERIFY ➔ AUDIT
```

---

## 2. Core Architecture

```mermaid
graph TD
    A[React + Vite Frontend] -->|REST API| B[Node.js + Express Backend]
    B -->|AI Analysis Request| C[Python FastAPI AI Microservice]
    C -->|Diagnosis & Recovery Probability| B
    B -->|Evaluate Safety Rules| D[Deterministic Guardrail Engine]
    D -->|Passed| E[PaymentProvider: Demo / Razorpay]
    D -->|Blocked / High Value > ₹10k| F[Human-in-the-Loop Operator Queue]
    E -->|Write Outcome & Update Metrics| G[(Prisma Database: SQLite / Neon PG)]
    F -->|Operator Approval| E
    B -->|Log Immutable Event| H[Cryptographic Audit Trail System]
```

---

## 3. Quickstart & Local Setup

### Prerequisites
- **Node.js:** v18+
- **Python:** 3.10+

### Step 1: Install Dependencies
```bash
# Install backend dependencies
npm --prefix backend install

# Install frontend dependencies
npm --prefix frontend install

# Install Python AI microservice dependencies
pip install -r ai-service/requirements.txt
```

### Step 2: Seed Database
Populate the database with **105 realistic synthetic Indian merchant transactions** (including gateway timeouts, bank declines, abandoned checkouts, subscription failures, and high-value guardrail examples):
```bash
npm run db:seed
```

### Step 3: Run All Services
```bash
# Terminal 1: Backend Express API (Port 5000)
npm run dev:backend

# Terminal 2: Python FastAPI AI Service (Port 8000)
npm run dev:ai

# Terminal 3: React Vite Frontend (Port 5173)
npm run dev:frontend
```

Open `http://localhost:5173` in your browser.

---

## 4. Tech Stack

- **Frontend:** React 18, Vite, TypeScript, Tailwind CSS, Lucide React, Recharts
- **Backend API:** Node.js, Express, TypeScript, Prisma ORM
- **AI Microservice:** Python 3.13, FastAPI, Uvicorn, scikit-learn, Pydantic
- **Database:** Prisma ORM supporting SQLite (default local zero-config) and Neon PostgreSQL (cloud hosted)
- **Payment Abstraction:** `PaymentProvider` (`DemoPaymentProvider` + `RazorpayProvider` Test Mode)

---

## 5. Deterministic Guardrail Safety Engine

RevGuard NEVER allows an AI or LLM model to directly move money without deterministic safety boundary checks:

1. **High-Value Threshold Rule (> ₹10,000):** Transactions above ₹10,000 are **BLOCKED** from automatic execution and held for Human Operator review.
2. **Payment Retry Limit Rule (≤ 1 attempt):** Automatic retries are capped at 1 attempt (`retryCount >= 1` ➔ BLOCKED) to prevent gateway rate-limiting or double-charging.
3. **AI Confidence Floor (< 80%):** Transactions with AI confidence below 80% automatically escalate to human operators.
4. **Fraud / Suspicious Activity Check:** Transactions flagged with suspicious risk halt automated recovery immediately.
5. **Customer Reminder Cap (≤ 2 attempts):** Automated customer reminders stop after 2 attempts to avoid spamming customers.

---

## 6. Cloud Database & Payment Provider Configuration (Optional)

### Neon PostgreSQL Setup
To connect a hosted Neon PostgreSQL database:
1. Create a project at [Neon.tech](https://neon.tech).
2. Copy your PostgreSQL connection string into `.env`:
   ```env
   DATABASE_URL="postgresql://neondb_owner:password@ep-cool-shield.aws.neon.tech/neondb?sslmode=require"
   ```
3. Run schema push and seed:
   ```bash
   npm run db:push
   npm run db:seed
   ```

### Razorpay Test Mode Setup
To integrate Razorpay Test Mode API credentials:
1. Open `.env` (or Settings page `/settings`).
2. Add your Razorpay key pair:
   ```env
   RAZORPAY_KEY_ID="rzp_test_..."
   RAZORPAY_KEY_SECRET="..."
   ```

---

## 7. REST API Documentation

- `GET /api/dashboard`: Fetch live KPI metrics, failure distributions, recent decisions
- `GET /api/transactions`: Transaction queue list with search and filters
- `GET /api/transactions/:id`: Single transaction details & AI diagnosis breakdown
- `GET /api/recovery`: Filterable recovery queue data
- `POST /api/agent/run`: Run batch recovery pipeline across pending transactions
- `POST /api/agent/analyze/:id`: Analyze and attempt single transaction recovery
- `POST /api/recovery/:id/approve`: Human operator approval for held high-value recovery
- `POST /api/recovery/:id/reject`: Human operator rejection for held recovery
- `GET /api/analytics`: Channel conversion rates and action performance
- `GET /api/audit`: Immutable event audit log trail
- `GET /api/health`: Microservice health check status

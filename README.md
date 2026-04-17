# 💳 Credit Score Intelligence Platform

A full-stack, AI-powered credit score simulator that analyzes financial behavior, predicts approval likelihood, and provides personalized improvement strategies using Generative AI.

---

## 🚀 Live Demo

* 🌐 **Frontend (Vercel):** https://credit-score-simulator-xi.vercel.app
* ⚙️ **Backend API (Render):** https://credit-score-simulator-d6yh.onrender.com

---

## 🧠 Overview

This project simulates a real-world fintech decision engine by combining:

* A **rule-based credit scoring model**
* **AI-generated financial insights**
* A **chat-based assistant with memory**
* Scenario-based simulations to understand credit behavior

It is designed to mirror how modern fintech platforms (like Navi, CRED, etc.) evaluate and guide users toward better financial health.

---

## ✨ Key Features

### 📊 1. Real-Time Credit Score Calculation

* Computes a dynamic credit score based on:

  * Income vs expenses
  * Credit utilization
  * Payment history
  * Credit mix & inquiries
* Provides **approval likelihood classification**

---

### 🤖 2. AI-Powered Credit Advisor

* Uses LLMs to generate:

  * Personalized explanations
  * Actionable improvement strategies
* Responses vary dynamically (non-repetitive insights)

---

### 💬 3. Conversational Chat Assistant

* Maintains **context-aware conversation memory**
* Allows users to:

  * Ask follow-up questions
  * Dive deeper into financial decisions

---

### 🔁 4. Scenario Simulation Engine

* Compare “what-if” cases:

  * Reduce utilization
  * Increase income
  * Improve payment behavior
* Helps users understand **impact of each variable**

---

### ⚡ 5. Fully Deployed System

* Frontend: **Vercel (React + Vite)**
* Backend: **Render (FastAPI)**
* Real-world production architecture:

```
User → Vercel → FastAPI → AI Service → Response
```

---

## 🏗️ Tech Stack

### Frontend

* React + TypeScript
* Vite
* Tailwind CSS
* Framer Motion

### Backend

* FastAPI (Python)
* Pydantic
* REST APIs

### AI Layer

* LLM-based explanation engine (Groq API)

### Deployment

* Vercel (Frontend)
* Render (Backend)

---

## ⚙️ System Architecture

```
Frontend (React)
    ↓
API Layer (Fetch via VITE_API_URL)
    ↓
Backend (FastAPI)
    ↓
AI Service (LLM)
    ↓
Response → UI
```

---

## 🧩 Key Engineering Decisions

### 1. Environment-Based API Routing

* Avoided hardcoded URLs
* Used:

```ts
import.meta.env.VITE_API_URL
```

→ Enables seamless dev vs production switching

---

### 2. Modular API Layer

* Separated API calls:

  * `credit.ts`
  * `ai.ts`
* Improves scalability and maintainability

---

### 3. Stateful AI Conversations

* Injected conversation history into prompts
* Enables context-aware responses

---

### 4. Debounced Score Calculation

* Prevents excessive API calls
* Improves performance & UX

---

## 🔐 Security & Production Considerations

* Environment variables for API keys
* CORS configuration for frontend-backend communication
* Error handling for API failures

---

## 📈 Potential Enhancements

* User authentication & saved profiles
* Credit report PDF export
* Advanced ML-based scoring (instead of rule-based)
* Banking data integrations (Plaid-like systems)

---

## 💡 Why This Project Matters (Fintech Lens)

This project demonstrates:

* Understanding of **credit risk modeling fundamentals**
* Ability to build **AI-powered financial products**
* Strong grasp of **full-stack deployment & debugging**
* Product thinking around **user financial behavior**

---

## 🧪 How to Run Locally

### 1. Clone repo

```
git clone <your-repo-link>
cd credit-score-simulator
```

### 2. Backend

```
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### 3. Frontend

```
cd frontend
npm install
npm run dev
```

### 4. Add Environment Variables

Frontend (`.env`):

```
VITE_API_URL=http://localhost:8000
```

Backend:

```
GROQ_API_KEY=your_key
```

---

## 🙌 Author

**Het Domadia**

---

## 📌 Closing Note

This project goes beyond a static ML model by integrating:

* Real-time simulation
* AI explainability
* Interactive UX

It reflects how modern fintech products are evolving from **score providers → intelligent financial assistants**.

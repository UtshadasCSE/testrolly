# Testrolly — AI University Admission & Credibility Practice

A modern, production-quality AI-powered interview practice platform tailored for university admission, credibility, and CAS-style interviews.

---

## Features

- **Sequential Practice Flow**: Structured progression through interview questions (12 Beginner questions).
- **Exam Simulation**: 10-second preparation countdown followed by automatic recording start.
- **In-Browser Video Recording**: Real-time camera and microphone recording using native browser `MediaDevices` and `MediaRecorder` APIs.
- **Cloudflare Workers AI Pipeline**:
  - **Speech-to-Text**: Whisper model converts candidate spoken response to accurate transcript.
  - **Text Evaluation**: Llama 3.1 8B Instruct model evaluates semantic accuracy, completeness, relevance, naturalness, fluency, grammar, clarity, and memorization risk.
- **Privacy First**: Video recordings stay local to browser memory — no permanent video cloud storage.
- **Secure Server Architecture**: Zero API token exposure to frontend code or client bundles.

---

## 1. Installation

Install all required dependencies:

```bash
npm install
```

---

## 2. Cloudflare Workers AI Setup

To enable AI evaluation:

1. Create a `.env` or `.env.local` file in the project root directory:

```bash
cp .env.example .env
```

2. Open `.env` and paste your Cloudflare Workers AI credentials:

```env
CLOUDFLARE_ACCOUNT_ID=YOUR_CLOUDFLARE_ACCOUNT_ID
CLOUDFLARE_API_TOKEN=YOUR_CLOUDFLARE_API_TOKEN
```

> **Security Guarantee**:
> The application uses a backend server/serverless endpoint (`/api/evaluate`) to communicate with Cloudflare Workers AI. The credentials are never prefixed with `VITE_`, never bundled into client JavaScript, and never exposed in the browser network tab.

---

## 3. Starting the Application

Run the development server:

```bash
npm run dev
```

Open your browser and navigate to:
```
http://localhost:5173
```

---

## 4. Single Source of Truth for Questions

All interview questions and reference answers are located in **one single source of truth**:

```text
src/data/test.json
```

---

## 5. How AI Evaluates Answers

Cloudflare Workers AI evaluates the candidate's spoken response:

1. **Semantic Accuracy**: Understands natural paraphrasing without requiring word-for-word repetition.
2. **Completeness & Relevance**: Verifies all essential points are addressed.
3. **Naturalness & Fluency**: Detects conversational tone vs robotic recitation.
4. **Filler Words**: Deterministically identifies and counts filler words (`um`, `uh`, `like`, `you know`, `actually`, `basically`).
5. **Memorization Risk**: Calculates a 0–100 risk score based on overly scripted phrasing.
6. **No Fake Metrics**: Visual metrics (like eye-contact or facial gestures) are not fabricated.

---

## 6. Production Build & Deployment (Vercel)

To build the client bundle:

```bash
npm run build
```

### Vercel Environment Variables:
In your Vercel Project Settings → **Environment Variables**, add:
- `CLOUDFLARE_ACCOUNT_ID`: Your Cloudflare Account ID
- `CLOUDFLARE_API_TOKEN`: Your Cloudflare API Token

Then trigger a redeployment.

# Test Interview — AI University Admission & Credibility Practice

A modern, production-quality AI-powered interview practice platform tailored for university admission, credibility, and CAS-style interviews.

---

## Features

- **Sequential Practice Flow**: Structured progression through interview questions (Beginner → Intermediate → Advanced).
- **Exam Simulation**: 10-second preparation countdown followed by automatic recording start.
- **In-Browser Video Recording**: Real-time camera and microphone recording using native browser `MediaDevices` and `MediaRecorder` APIs.
- **Deep Multimodal AI Evaluation**: Google Gemini evaluates candidate's spoken response for semantic accuracy, completeness, relevance, naturalness, fluency, grammar, clarity, answer length, filler words, and memorization risk.
- **Spoken Transcript**: Generates exact transcripts of what was spoken.
- **Privacy First**: Video recordings stay local to browser memory — no permanent video cloud storage or databases.
- **Secure Server Architecture**: Zero API key exposure to frontend code or client bundles.

---

## 1. Installation

Install all required dependencies:

```bash
npm install
```

---

## 2. Gemini API Setup

To enable AI evaluation:

1. Create a `.env` or `.env.local` file in the project root directory:

```bash
cp .env.example .env
```

2. Open `.env` and paste your Google Gemini API key:

```env
GEMINI_API_KEY=YOUR_PRIVATE_API_KEY
```

> **Security Guarantee**:
> The application uses a backend Express endpoint (`/api/evaluate`) to communicate with Google Gemini. The `GEMINI_API_KEY` is never prefixed with `VITE_`, never bundled into client JavaScript, and never exposed in the browser network tab.

If you test without a key configured, the application will load normally and provide an informative setup message upon submitting an answer for analysis.

---

## 3. Starting the Application

Run the development server (starts both backend server and Vite client concurrently):

```bash
npm run dev
```

Open your browser and navigate to:
```
http://localhost:5173
```

---

## 4. Editing Interview Questions

All interview questions and reference answers are located in **one single source of truth**:

```text
src/data/test.json
```

> **To add, remove, or edit interview questions, edit only `src/data/test.json`.**

### Question Structure:

```json
{
  "title": "Test Interview",
  "description": "Practice your interview step by step and receive AI-powered feedback.",
  "questions": [
    {
      "id": 1,
      "difficulty": "Beginner",
      "question": "Please introduce yourself.",
      "expectedAnswer": "My name is Demo Student. I completed my bachelor's degree in Computer Science and I am now planning to pursue postgraduate study to improve my academic knowledge and professional skills.",
      "preparationTime": 10
    }
  ]
}
```

The application automatically calculates total question count, progress percentages, preparation timers, and difficulty badges dynamically from this file.

---

## 5. How Gemini Evaluates Answers

Gemini analyzes the candidate's spoken response against the reference ideas:

1. **Semantic Accuracy**: Understands natural paraphrasing without requiring word-for-word repetition.
2. **Completeness & Relevance**: Verifies all essential points are addressed.
3. **Naturalness & Fluency**: Detects conversational tone vs robotic recitation.
4. **Filler Words**: Identifies and counts filler words (`um`, `uh`, `like`, `you know`, `actually`, `basically`).
5. **Memorization Risk**: Calculates a 0–100 risk score based on overly scripted phrasing.
6. **No Fake Metrics**: Visual metrics (like eye-contact or facial gestures) are not fabricated.

---

## 6. Production Build & Deployment

To build the client bundle:

```bash
npm run build
```

To run the production server:

```bash
npm start
```

### Production Environment Variables:
On your hosting provider (e.g. Render, Railway, Vercel, VPS), add `GEMINI_API_KEY` to the platform's Environment Variables dashboard. Do not commit `.env` files to Git.
# testrolly

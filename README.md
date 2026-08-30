# SIH Hardware Bootcamp Feedback Form ⚡

A high-performance, single-page feedback web application designed for students attending a one-day **Smart India Hackathon (SIH) Hardware Bootcamp** covering hardware basics and tools (multimeter, soldering iron, breadboards, microcontroller kits, etc.).

Engineered for **20–30 second completion** on mobile devices with a custom, lightweight **glassmorphism** design and direct client-side **Firebase Firestore** writes.

---

## 🎨 Visual & Technical Highlights

- **Next.js 15+ (App Router)** + **TypeScript** + **Bun**
- **Glassmorphism Design**: Frosted glass card with `backdrop-filter: blur(20px)`, custom ambient gradient (`linear-gradient(135deg, #4b6cb7 0%, #182848 100%)`), and glow highlights.
- **Zero Heavy UI Libraries**: Pure CSS hand-rolled in `globals.css` for instant loading and minimal bundle size.
- **No Emojis**: Crisp outline icons from `@tabler/icons-react` (`IconMoodSad`, `IconMoodNeutral`, `IconMoodSmile`, `IconBolt`, `IconCpu`, `IconArrowRight`, `IconCheck`).
- **Mobile First**: Optimized touch targets (min 44px height), centered max-width 400px card.
- **Firestore Integration**: Anonymous public client SDK write-only submissions with server timestamps and double-submit prevention.
- **Free Tier Ready**: Comfortably handles 400+ submissions on Vercel Hobby + Firebase Spark free tiers without incurring any costs.

---

## 📁 Project Structure

```
├── app/
│   ├── layout.tsx         # Loads Google Inter font, sets metadata & viewport
│   ├── page.tsx           # Interactive feedback form (Client Component)
│   └── globals.css        # Glassmorphism, animations, responsive styling
├── lib/
│   └── firebase.ts        # Firebase app & Firestore initialization
├── firestore.rules        # Security rules for write-only feedback collection
├── firebase.json          # Firebase configuration for rules deployment
├── .env.local.example     # Required environment variables template
├── tsconfig.json          # TypeScript configuration
├── package.json           # Dependencies and scripts
└── README.md              # Setup & deployment guide
```

---

## 🚀 Quick Start (Local Development)

### 1. Install Dependencies
```bash
bun install
```
*(Or `npm install` / `pnpm install` / `yarn`)*

### 2. Configure Environment Variables
Copy `.env.local.example` to `.env.local`:
```bash
cp .env.local.example .env.local
```
Fill in your Firebase credentials in `.env.local` (see Firebase Setup below).

### 3. Start Development Server
```bash
bun run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔥 Firebase Setup Guide

### 1. Create a Firebase Project
1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Click **Add project**, name it (e.g. `sih-bootcamp-feedback`), and finish creation.

### 2. Enable Firestore in Native Mode
1. In the left sidebar, navigate to **Build > Firestore Database**.
2. Click **Create database**.
3. Choose **Native mode** and select a location close to your users (e.g., `asia-south1` for India / SIH).
4. Start in **Test mode** or **Production mode** (we will configure secure rules in the next step).

### 3. Apply Firestore Security Rules
Go to the **Rules** tab in Firestore Database (or deploy with `firebase deploy --only firestore:rules`):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /feedback/{docId} {
      // Allow anonymous public write-only submissions
      allow create: if true;
      // Prevent public read, update, or deletion of feedback
      allow read, update, delete: if false;
    }
  }
}
```

> **Why this rule?**
> Students can submit their feedback without creating an account or logging in, while unauthorized third parties cannot read, modify, or delete previously submitted feedback from the client.

### 4. Obtain Web App Credentials
1. In Firebase Console, go to **Project Settings** (gear icon) > **General**.
2. Scroll to **Your apps**, click the **Web icon (`</>`)**, and register the app (e.g. `sih-bootcamp-web`).
3. Copy the `firebaseConfig` keys into `.env.local`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=sih-bootcamp-feedback.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=sih-bootcamp-feedback
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=sih-bootcamp-feedback.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
```

---

## 📊 Document Data Schema

Submitted documents are written directly to the `/feedback` collection with this schema:

```typescript
{
  rating: "sad" | "neutral" | "happy" | "excited", // Required
  confidence: 75,                                   // Number (0-100)
  highlights: ["Soldering session", "Loved the demo"], // String array
  comment: "Great hands-on multimeter practice!",   // Optional string
  createdAt: Timestamp                              // Server timestamp
}
```

---

## 🚢 Deployment Guide

### Deploying to GitHub (`gh` CLI)

```bash
# 1. Initialize git
git init -b main
git add .
git commit -m "Initial commit: SIH Bootcamp Feedback Form"

# 2. Create remote repo and push using GitHub CLI
gh repo create sih-bootcamp-feedback --public --source=. --remote=origin --push
```

---

### Deploying to Vercel (`vercel` CLI)

```bash
# 1. Link project with Vercel
vercel link

# 2. Add Environment Variables to Vercel
vercel env add NEXT_PUBLIC_FIREBASE_API_KEY production
vercel env add NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN production
vercel env add NEXT_PUBLIC_FIREBASE_PROJECT_ID production
vercel env add NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET production
vercel env add NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID production
vercel env add NEXT_PUBLIC_FIREBASE_APP_ID production

# 3. Deploy to Production
vercel --prod
```

Alternatively, push to GitHub and import the repository on the [Vercel Dashboard](https://vercel.com/new), adding the 6 `NEXT_PUBLIC_FIREBASE_*` environment variables in the project settings.

---

## ⚡ Capacity & Free Tier Economics

This application is built on serverless edge architecture:
- **Vercel Hobby Tier**: 100 GB bandwidth, unlimited serverless edge executions.
- **Firebase Spark (Free Tier)**:
  - 20,000 Firestore writes per day.
  - 50,000 Firestore reads per day.
  - 1 GiB total storage.
- A 400+ student bootcamp requires only ~400 write operations (< 2% of the daily free limit), comfortably costing **$0.00**.

---

## 📄 License
MIT License. Built for the Smart India Hackathon community.

# Overlay.io

Create personalized greeting cards with your name and photo, then preview and share them. Built with Next.js and Firebase Authentication.

**Live demo:** [https://overlay-io.vercel.app](https://overlay-io.vercel.app)

---

## Features

- **Guest mode** — try the app without signing in (uses a default avatar)
- **Google & email sign-in** — via Firebase Authentication
- **Profile setup** — name and photo on every card (signed-in users can upload a photo)
- **Template gallery** — categories: All, Birthday, Anniversary, Festivals, Love
- **Premium templates** — demo unlock flow for locked designs
- **Card preview** — full-size preview before sharing
- **Share** — native share on mobile; download / copy image on desktop

---

## Tech stack

| Layer | Technology |
|-------|------------|
| Framework | [Next.js 16](https://nextjs.org) (App Router) |
| UI | React 19, Tailwind CSS 4 |
| Auth | Firebase Authentication (Google, Email/Password, Anonymous) |
| Export | modern-screenshot (card → PNG) |
| Hosting | [Vercel](https://vercel.com) (recommended) |

---

## Prerequisites

- **Node.js** 20+ and npm
- A **Firebase** project ([Firebase Console](https://console.firebase.google.com))
- (Optional) A **Vercel** account for deployment

---

## Local setup

### 1. Clone and install

```bash
git clone <your-repo-url>
cd Greeting
npm install
```

### 2. Environment variables

Copy the example file and fill in your Firebase web app config:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef
```

**Where to find these values:** Firebase Console → Project settings → General → **Your apps** → Web app → SDK setup and configuration.

### 3. Configure Firebase Authentication

1. Open [Firebase Console](https://console.firebase.google.com) → your project.
2. Go to **Build** → **Authentication** → **Sign-in method**.
3. Enable:
   - **Google**
   - **Email/Password**
   - **Anonymous** (for guest mode with Firebase)
4. Under **Settings** → **Authorized domains**, ensure **`localhost`** is listed (it is by default).

### 4. Create email users (optional)

For email/password login, create users manually:

**Authentication** → **Users** → **Add user** (email + password).

### 5. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 6. Build for production (optional)

```bash
npm run build
npm start
```

---

## Firebase: Google sign-in on Vercel

If you see **`Firebase: Error (auth/unauthorized-domain)`** after deploying, Firebase is blocking your production domain.

### Authorized domains (required)

1. Firebase Console → **Authentication** → **Settings** → **Authorized domains**.
2. Click **Add domain** and add:
   - `overlay-io.vercel.app` (or your Vercel URL)
   - Any custom domain you use (e.g. `overlay.io`)

`localhost` and `your-project-id.firebaseapp.com` are usually already present; **Vercel URLs are not** until you add them.

### Vercel environment variables

In the Vercel dashboard → your project → **Settings** → **Environment Variables**, add the same `NEXT_PUBLIC_FIREBASE_*` variables as in `.env.local` for **Production** (and **Preview** if you test auth on preview URLs).

Redeploy after saving env vars.

### Google Cloud OAuth (if sign-in still fails)

1. [Google Cloud Console](https://console.cloud.google.com) → select the project linked to Firebase.
2. **APIs & Services** → **Credentials** → **Web client** (auto-created by Firebase).
3. **Authorized JavaScript origins** — add:
   - `https://overlay-io.vercel.app`
   - Your custom domain, if any
4. **Authorized redirect URIs** — ensure this exists:
   - `https://YOUR_PROJECT_ID.firebaseapp.com/__/auth/handler`

### Preview deployments

Firebase does **not** support wildcards like `*.vercel.app`. Each preview URL must be added separately under **Authorized domains**, or test Google sign-in only on your production domain.

---

## Deploy to Vercel

1. Push the repo to GitHub/GitLab/Bitbucket.
2. Import the project in [Vercel](https://vercel.com/new).
3. Add all `NEXT_PUBLIC_FIREBASE_*` environment variables.
4. Deploy.
5. Add the generated `*.vercel.app` hostname to Firebase **Authorized domains** (see above).

No extra `vercel.json` is required for a standard Next.js app.

---

## Project structure

```
src/
├── app/
│   ├── page.tsx              # Home — template grid
│   ├── login/page.tsx        # Sign-in
│   ├── profile-setup/page.tsx
│   └── preview/[id]/page.tsx # Card preview & share
├── components/
│   ├── GreetingCard.tsx      # Card layout
│   ├── TemplateGrid.tsx
│   ├── ProfileMenu.tsx
│   ├── ShareSheet.tsx
│   └── ...
├── context/
│   └── AuthContext.tsx       # Auth + profile state
├── data/
│   └── templates.ts          # Template definitions
└── lib/
    ├── firebase.ts
    ├── storage.ts            # localStorage + IndexedDB for photos
    ├── exportCard.ts         # Capture & share
    └── profilePhoto.ts       # Guest avatar helpers

public/
└── guest-avatar.png          # Default guest profile image
```

---

## How it works

### Authentication

| Method | Behavior |
|--------|----------|
| **Guest** | Works without Firebase env vars (local-only session). With Firebase configured, uses anonymous auth. |
| **Google** | Firebase popup; profile name/photo from Google when available. |
| **Email** | Firebase email/password; users must exist in Firebase Console. |

### Profile storage

- Profile (name, photo, premium flag) is stored in **localStorage**.
- Large uploaded photos are compressed and, if needed, stored in **IndexedDB** to avoid quota errors.
- Guests always use `/guest-avatar.png`, not a real user photo.

### Sharing

1. User taps **Share** on the preview page.
2. The card DOM is captured as a PNG (supports Tailwind v4 / modern CSS colors).
3. On supported devices, the **Web Share API** opens the native share sheet.
4. Otherwise, a sheet offers **Download**, **Copy image**, or **Share via apps** when available.

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server (Turbopack) |
| `npm run build` | Production build |
| `npm start` | Run production server locally |
| `npm run lint` | Run ESLint |

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `auth/unauthorized-domain` on Vercel | Add your Vercel domain under Firebase → Authentication → Authorized domains |
| Google sign-in works locally but not online | Check Vercel env vars and Google OAuth origins (see above) |
| `QuotaExceededError` for profile | Upload a smaller image or clear site data; app compresses images automatically |
| Card images not loading in export | Ensure template URLs are allowed in `next.config.ts` `images.remotePatterns` |
| Firebase not configured banner on login | Add `.env.local` with all `NEXT_PUBLIC_FIREBASE_*` variables |

---



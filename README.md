# Khadija's Portfolio — Vercel Deployment

## Project Structure
```
khadija-portfolio/
├── index.html          ← your portfolio site (frontend)
├── vercel.json         ← Vercel configuration
├── package.json        ← dependencies (mongodb + nodemailer)
├── .env.example        ← environment variable template
└── api/
    ├── contact.js      ← POST /api/contact  (contact form)
    ├── health.js       ← GET  /api/health   (health check)
    └── messages.js     ← GET  /api/messages (view saved messages)
```

---

## Step 1 — Set up MongoDB Atlas (free)

1. Go to https://www.mongodb.com/atlas and create a free account
2. Create a **free M0 cluster**
3. Create a **database user** (username + password — save these)
4. Under **Network Access**, click "Add IP Address" → "Allow Access from Anywhere" (0.0.0.0/0)
5. Go to your cluster → **Connect** → **Drivers** → copy the connection string
   - It looks like: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/`
   - Replace `<password>` with your actual password

---

## Step 2 — Deploy to Vercel

1. Go to https://vercel.com and sign in with GitHub
2. Push this folder to a GitHub repo (or drag-drop the zip into Vercel)
3. Click **"New Project"** → import your repo
4. Vercel auto-detects the config — just click **Deploy**

---

## Step 3 — Add Environment Variables in Vercel

Go to your project → **Settings** → **Environment Variables** and add:

| Key | Value |
|-----|-------|
| `MONGODB_URI` | Your Atlas connection string |
| `EMAIL_USER` | Your Gmail address |
| `EMAIL_PASS` | Your Gmail App Password (16 chars) |
| `EMAIL_TO` | Where to receive contact emails |
| `ADMIN_KEY` | Any long random string you choose |
| `ALLOWED_ORIGIN` | Your Vercel URL (e.g. https://khadija-portfolio.vercel.app) |

After adding variables → **Redeploy** (Deployments tab → ⋯ → Redeploy)

---

## Step 4 — Get your Gmail App Password

1. Go to https://myaccount.google.com/security
2. Enable **2-Step Verification** (required)
3. Go to https://myaccount.google.com/apppasswords
4. Create an app password named "Portfolio"
5. Copy the 16-character code (no spaces) → use as `EMAIL_PASS`

---

## Viewing saved messages

Visit: `https://your-vercel-url.vercel.app/api/messages?key=YOUR_ADMIN_KEY`

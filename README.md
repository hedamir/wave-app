# wave. — Spotify music app

A minimal music app with daily playlists, weekend mixes, mood controls and artsy gauges.

---

## Deploy to Vercel in 5 steps

### Step 1 — Get your Spotify Client Secret

1. Go to https://developer.spotify.com/dashboard
2. Click your app → **Settings**
3. Copy the **Client Secret** (click "View client secret")

### Step 2 — Push to GitHub

1. Create a free account at https://github.com
2. Create a new repository called `wave-app`
3. Upload all these files (drag and drop into the repo)

### Step 3 — Deploy on Vercel

1. Go to https://vercel.com and sign up free
2. Click **Add New → Project**
3. Import your GitHub `wave-app` repository
4. Click **Deploy** — Vercel builds it automatically

### Step 4 — Add environment variables

After deploying, go to:
**Vercel Dashboard → your project → Settings → Environment Variables**

Add these three variables:

| Name | Value |
|------|-------|
| `SPOTIFY_CLIENT_ID` | `2920b2134c8741c9a0811b5e3b15b84c` |
| `SPOTIFY_CLIENT_SECRET` | your secret from Step 1 |
| `NEXTAUTH_URL` | your Vercel URL e.g. `https://wave-app.vercel.app` |

Click **Save**, then **Redeploy** (Deployments tab → three dots → Redeploy).

### Step 5 — Update Spotify redirect URI

1. Go back to https://developer.spotify.com/dashboard → your app → **Settings** → **Edit**
2. Add this redirect URI (keep the old one, add this new one):
   ```
   https://your-app.vercel.app/api/auth/callback
   ```
   (replace `your-app` with your actual Vercel URL)
3. Click **Add** → **Save**

---

## Done! 

Visit your Vercel URL. Anyone can now click "Log in with Spotify" and use the app with their own account.

---

## Local development

```bash
npm install
cp .env.example .env.local
# Edit .env.local with your credentials and set NEXTAUTH_URL=http://localhost:3000
# Also add http://localhost:3000/api/auth/callback as a redirect URI in Spotify
npm run dev
```

Open http://localhost:3000

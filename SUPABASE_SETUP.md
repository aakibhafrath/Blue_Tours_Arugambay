# 🚀 Supabase & Vercel Setup Guide — Blue Tours Arugambay Admin Dashboard

This guide walks you through setting up your **Supabase database & storage** and accessing the `/admin.html` dashboard from your phone or desktop.

---

## 1. Project Information

- **Supabase Project URL**: `https://lhcdnllntqcnzlrusmsm.supabase.co`
- **Database Table**: `gallery_items`
  - Columns: `id`, `title`, `category`, `description`, `media_url`, `media_type`, `created_at`
- **Storage Bucket**: `gallery` (Public bucket)
- **Admin Portal URL**: `/admin.html` (also routed at `/admin` on Vercel)

---

## 2. Setting Up Your Supabase Publishable Key

For security, the project never hardcodes secret keys. You only need your public `anon` / `publishable` key:

1. Open your [Supabase Project Dashboard](https://supabase.com/dashboard/project/lhcdnllntqcnzlrusmsm).
2. Click **Project Settings** (gear icon) > **API**.
3. Under **Project API keys**, copy the **`anon` `public`** key (starts with `eyJhbGciOi...`).
4. Open `/admin.html` in your browser.
5. Click **"Enter Key"** or the **Key** icon in the navbar.
6. Paste your Publishable Key and click **Save Key**.
   *(It is safely stored in your browser's `localStorage` so you only have to enter it once).*

---

## 3. How to Login

1. Go to `http://localhost:3000/admin.html` (or `https://your-site.vercel.app/admin.html`).
2. Enter your existing Supabase Admin **Email** and **Password**.
3. Click **Sign In to Dashboard**.
4. The dashboard will load with:
   - Total Photos counter
   - Total Videos counter
   - Gallery media management grid
   - Quick **+ Add Photo** and **+ Add Video** buttons

---

## 4. How to Upload a Photo from Your Phone

1. Open `/admin.html` on your phone browser.
2. Tap **+ Add Photo** — your phone file picker / camera will open.
3. Choose an existing photo from your gallery or take a new one.
4. Review the instant preview.
5. Enter a **Title**, select a **Category** (*Safari, Lagoon, Surfing, Beach, Wildlife, Other*), and optional **Description**.
6. Tap **Upload Photo**.
7. The photo uploads to the `gallery` Storage bucket and creates a row in `gallery_items`.
8. The dashboard and the public website gallery (`index.html`) update automatically!

---

## 5. How to Upload a Video

1. Tap **+ Add Video**.
2. Select an MP4 or WebM video file.
3. Review video playback preview.
4. Enter **Title**, **Category**, and **Description**.
5. Tap **Upload Video**.
6. The public website will render an embedded video player and allow full video playback in the lightbox!

---

## 6. How the Public Website Gallery Updates Automatically

- When visitors load `index.html`, `js/gallery.js` queries `gallery_items` ordered by `created_at DESC`.
- New photos and videos from Supabase are prepended to the top of the visual masonry grid with category badges and lazy loading.
- If Supabase is offline or empty, all original local photos (`images/corcodaile2.jpeg`, `images/Bear.jpeg`, etc.) continue to display smoothly as fallbacks.

---

## 7. Deploying to Vercel

1. Push your repository to GitHub:
   ```bash
   git add .
   git commit -m "Add mobile-friendly Supabase admin dashboard at /admin.html"
   git push
   ```
2. In Vercel, deploy the repository (Framework: **Other**).
3. The included `vercel.json` rewrites `/admin` and `/admin/` to `/admin.html` automatically with security headers.

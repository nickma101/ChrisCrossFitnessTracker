# Setup — Supabase database & authentication

The app now stores your training plans in **Supabase** (hosted Postgres) and
requires sign-in (Google or email/password). Follow these one-time steps.

## 1. Create a Supabase project

1. Go to <https://supabase.com>, sign in, and create a **new project**.
2. Pick a name and a database password (save it somewhere safe).
3. Wait ~1 minute for the project to finish provisioning.

## 2. Create the database tables

1. In the Supabase dashboard, open **SQL Editor → New query**.
2. Paste the contents of [`supabase/schema.sql`](supabase/schema.sql) and click **Run**.
   This creates the `plans`, `sessions`, and `logged_sets` tables with
   Row-Level Security so each user only sees their own data.

## 3. Add your API keys to the app

1. In the dashboard: **Project Settings → API**.
2. Copy the **Project URL** and the **anon public** key.
3. In the project root, copy `.env.example` to `.env` and fill them in:

   ```
   VITE_SUPABASE_URL=https://YOUR-PROJECT-ref.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-public-key
   ```

4. Restart the dev server (`npm run dev`). The login page's "Supabase isn't
   connected" notice should disappear.

> The anon key is meant to be public and shipped in the frontend — RLS is what
> protects the data. `.env` is git-ignored so your local values stay private.

## 4. Enable email/password sign-in

Email auth is on by default. For quick local testing you may want to disable
the confirmation email: **Authentication → Providers → Email → turn off
"Confirm email"**. (Leave it on for production.)

## 5. Enable Google sign-in (optional)

1. In **Google Cloud Console** → *APIs & Services → Credentials*, create an
   **OAuth client ID** of type **Web application**.
2. Under **Authorized redirect URIs**, add the callback shown in Supabase at
   **Authentication → Providers → Google** (looks like
   `https://YOUR-PROJECT-ref.supabase.co/auth/v1/callback`).
3. Copy the generated **Client ID** and **Client secret** into that Supabase
   Google provider screen and **enable** it.
4. Under **Authentication → URL Configuration**, set the **Site URL** to where
   the app runs (e.g. `http://localhost:5173` for dev, your deployed URL for
   prod) so the OAuth redirect returns to the right place.

## 6. When you deploy

- Add the same two `VITE_SUPABASE_*` env vars in your host (Netlify/Vercel/etc.).
- Add the deployed URL to Supabase **URL Configuration → Redirect URLs** and,
  for Google, to the OAuth client's authorized redirect URIs.

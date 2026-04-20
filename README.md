# FitCheck

## Description

**FitCheck** is a cross-platform mobile app built with **Expo** and **React Native** (TypeScript) for **CSCI 380**. It supports multiple user roles (**members** and **trainers**) behind a shared authentication layer.

- **Members**: log food (manual + photo→AI), see daily calories vs goal, weekly history, edit profile (age/weight/height/activity/goal).
- **Trainers**: view assigned members, view member food logs + calorie trends, set a per-member daily calorie goal + note (auto-suggested via BMR/TDEE).

The app uses **Supabase Auth** for real registration/login (set `SUPABASE_URL` + `SUPABASE_ANON_KEY` in `app.json`).

### Tech stack

- Expo ~54, React Native, TypeScript  
- React Navigation, Async Storage, gesture handler & safe area  

### Run locally

```bash
npm install
npm start
```

Then open the project in the Expo dev tools and run on iOS, Android, or web as needed.

### Backend

The app supports:

- **Supabase (recommended)**: set `app.json` → `expo.extra.SUPABASE_URL` and `SUPABASE_ANON_KEY`
- **Optional Express server (AI calories)**: run `server/` and point `API_BASE_URL` at it if you want the `/ai/*` endpoints

#### Configure Supabase

In `app.json`:

```json
{
  "expo": {
    "extra": {
      "SUPABASE_URL": "https://<your-ref>.supabase.co",
      "SUPABASE_ANON_KEY": "sb_publishable_...",
      "API_BASE_URL": ""
    }
  }
}
```

#### Run the backend locally (Express)

```bash
cd server
npm install
npm run dev
```

By default it listens on port `8787`.

Test it:

```bash
curl http://localhost:8787/health
```

#### Connect a teammate (same Wi‑Fi / local network)

If your teammate is running the app on a phone, they **cannot** use `localhost` to reach your machine.

On macOS, get your LAN IP:

```bash
ipconfig getifaddr en0
```

Then set `API_BASE_URL` in `app.json`:

```json
{
  "expo": {
    "extra": {
      "API_BASE_URL": "http://192.168.x.x:8787"
    }
  }
}
```

Your teammate can hit:

- `GET /health` → `http://192.168.x.x:8787/health`

#### Connect a remote teammate (ngrok)

Start the backend (`npm run dev` in `server/`), then in another terminal:

```bash
ngrok http 8787
```

ngrok will print a public URL like `https://abc123.ngrok-free.app`. Set:

- `API_BASE_URL` = `https://abc123.ngrok-free.app`


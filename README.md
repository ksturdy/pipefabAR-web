# PipeFabAR Web

React web frontend for PipeFabAR. Access your projects from Windows/Mac.

## Local Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Create `.env.local` file:**
   ```bash
   cp .env.example .env.local
   ```
   Update `VITE_API_URL` if your backend URL is different.

3. **Start dev server:**
   ```bash
   npm run dev
   ```
   Visit `http://localhost:3000`

## Building for Production

```bash
npm run build
npm start
```

## Deployment to Render

1. **Create GitHub repo:**
   ```bash
   git add .
   git commit -m "Initial web app"
   git push origin main
   ```

2. **Create Web Service on Render:**
   - Connect to `ksturdy/pipefabAR-web` repo
   - **Build Command:** `npm run build`
   - **Start Command:** `npm start`
   - **Environment Variables:**
     ```
     VITE_API_URL=https://pipefabar-backend-dq7l.onrender.com/api
     ```

3. **Deploy:**
   Render will automatically build and deploy when you push to main.

## Features

- User registration and login
- Create, edit, delete projects
- Manage work packages per project
- Track spools per work package
- Real-time sync with backend API

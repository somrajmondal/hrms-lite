# 🚀 HRMS Lite — Step-by-Step Deployment Guide

---

## 📁 Folder Structure

```
hrms-lite/
├── backend/          ← FastAPI (Python)
│   ├── main.py
│   ├── models.py
│   ├── schemas.py
│   ├── database.py
│   ├── requirements.txt
│   └── render.yaml
│
├── frontend/         ← React + Vite
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── services/api.js
│   │   └── styles.css
│   ├── index.html
│   ├── package.json
│   └── .env
│
└── README.md
```

---

## PART 1 — Run Locally (Test First)

### Step 1: Run the Backend

Open a terminal and run:

```bash
cd backend

# Create a Python virtual environment
python -m venv venv

# Activate it:
# On Mac/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the server
uvicorn main:app --reload --port 8000
```

✅ Backend running at: http://localhost:8000
✅ API docs (Swagger): http://localhost:8000/docs

---

### Step 2: Run the Frontend

Open a SECOND terminal window and run:

```bash
cd frontend

# Install Node packages
npm install

# Make sure .env has this line:
# VITE_API_URL=http://localhost:8000

# Start the dev server
npm run dev
```

✅ Frontend running at: http://localhost:3000

---

## PART 2 — Deploy Backend to Render (Free)

### Step 1: Push to GitHub

```bash
# From the root hrms-lite/ folder:
git init
git add .
git commit -m "Initial commit - HRMS Lite"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/hrms-lite.git
git push -u origin main
```

---

### Step 2: Create a Free PostgreSQL Database on Render

1. Go to https://render.com → Sign up / Log in
2. Click **"New +"** → **"PostgreSQL"**
3. Fill in:
   - Name: `hrms-db`
   - Region: Choose closest to you
   - Plan: **Free**
4. Click **"Create Database"**
5. Wait ~1 min, then copy the **"Internal Database URL"** — you'll need it next

---

### Step 3: Deploy the Backend API on Render

1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repo
3. Fill in the settings:
   - **Name**: `hrms-lite-api`
   - **Root Directory**: `backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Plan**: Free
4. Under **"Environment Variables"**, add:
   - Key: `DATABASE_URL`
   - Value: *(paste the Internal Database URL from Step 2)*
5. Click **"Create Web Service"**

⏳ Wait 2-3 minutes for it to build and deploy.

✅ Your backend URL will look like: `https://hrms-lite-api.onrender.com`

Test it: Open `https://hrms-lite-api.onrender.com/docs` in your browser — you should see the Swagger API docs.

---

## PART 3 — Deploy Frontend to Vercel (Free)

### Step 1: Go to Vercel

1. Go to https://vercel.com → Sign up with GitHub
2. Click **"Add New Project"**
3. Import your `hrms-lite` GitHub repository

### Step 2: Configure the Project

In the configuration screen:
- **Framework Preset**: Vite
- **Root Directory**: `frontend`
- **Build Command**: `npm run build` *(auto-detected)*
- **Output Directory**: `dist` *(auto-detected)*

### Step 3: Add Environment Variable

Under **"Environment Variables"**, add:
- Key: `VITE_API_URL`
- Value: `https://hrms-lite-api.onrender.com`
  *(replace with YOUR actual Render backend URL from Part 2)*

### Step 4: Deploy

Click **"Deploy"** and wait ~1 minute.

✅ Your frontend URL will look like: `https://hrms-lite.vercel.app`

---

## PART 4 — Connect Frontend to Backend (Final Check)

After both are deployed:

1. Open your Vercel frontend URL
2. Go to Employees page → try adding an employee
3. Go to Attendance → mark attendance
4. Check the Dashboard

If you see data loading correctly — **you're done! 🎉**

---

## ⚠️ Common Issues & Fixes

### "CORS error" in browser console
- Make sure your backend is running and the `VITE_API_URL` is set correctly in Vercel

### Backend "Application failed to respond"
- On Render free tier, the backend sleeps after 15 mins of inactivity
- First request after sleep takes ~30 seconds — this is normal
- Just wait and refresh

### "DATABASE_URL" error on Render
- Make sure you copied the **Internal** URL (not External) from the PostgreSQL dashboard
- Re-deploy after adding the env variable

### Frontend shows blank page
- Check Vercel build logs for errors
- Make sure Root Directory is set to `frontend` (not the repo root)

---

## 📡 API Endpoints Reference

| Method | URL | What it does |
|--------|-----|-------------|
| GET | `/` | Health check |
| GET | `/dashboard` | Stats summary |
| GET | `/employees` | List all employees |
| POST | `/employees` | Add new employee |
| GET | `/employees/{id}` | Get one employee |
| DELETE | `/employees/{id}` | Delete employee |
| POST | `/attendance` | Mark attendance |
| GET | `/attendance` | All records (+ date filter) |
| GET | `/attendance/employee/{id}` | One employee's records |

Full interactive docs: `https://YOUR-BACKEND.onrender.com/docs`

---

## 🧰 Tech Stack Summary

| Part | Technology |
|------|-----------|
| Frontend | React 18, React Router, Vite |
| Backend | Python 3.11, FastAPI |
| Database | SQLite (local) / PostgreSQL (production) |
| ORM | SQLAlchemy |
| Validation | Pydantic |
| Frontend Host | Vercel (free) |
| Backend Host | Render (free) |
| DB Host | Render PostgreSQL (free) |

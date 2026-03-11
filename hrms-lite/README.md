# HRMS Lite — Human Resource Management System

A lightweight, production-ready Human Resource Management System built for managing employee records and tracking daily attendance.

![HRMS Lite](https://img.shields.io/badge/HRMS-Lite-gold?style=flat-square) ![FastAPI](https://img.shields.io/badge/FastAPI-0.104-009688?style=flat-square&logo=fastapi) ![React](https://img.shields.io/badge/React-18-61dafb?style=flat-square&logo=react)

---

## 🚀 Live Demo

- **Frontend**: *(deploy to Vercel and add URL here)*
- **Backend API**: *(deploy to Render and add URL here)*
- **API Docs**: `{backend-url}/docs` *(FastAPI auto-generated Swagger)*

---

## ✨ Features

### Core
- **Employee Management** — Add, view, search, and delete employees
- **Attendance Tracking** — Mark daily Present/Absent per employee; update if re-marked
- **Dashboard** — Real-time stats: total employees, today's attendance, department breakdown
- **Employee Detail** — Per-employee attendance history with rate calculation

### Bonus
- Filter attendance by date
- Total present days per employee
- Dashboard summary with department breakdown
- Attendance rate percentage

---

## 🛠 Tech Stack

| Layer      | Technology                    |
|------------|-------------------------------|
| Frontend   | React 18, Vite, React Router  |
| Styling    | Custom CSS (no UI framework)  |
| Backend    | Python, FastAPI               |
| Database   | SQLite (dev) / PostgreSQL (prod) |
| ORM        | SQLAlchemy 2.0                |
| Validation | Pydantic v1                   |
| Deployment | Vercel (FE) + Render (BE)     |

---

## 📁 Project Structure

```
hrms/
├── backend/
│   ├── main.py          # FastAPI app, all routes
│   ├── models.py        # SQLAlchemy ORM models
│   ├── schemas.py       # Pydantic request/response schemas
│   ├── database.py      # DB connection & session management
│   ├── requirements.txt
│   └── render.yaml      # Render deployment config
│
└── frontend/
    ├── src/
    │   ├── pages/
    │   │   ├── Dashboard.jsx      # Overview stats
    │   │   ├── Employees.jsx      # Employee CRUD
    │   │   ├── EmployeeDetail.jsx # Per-employee detail
    │   │   └── Attendance.jsx     # Attendance management
    │   ├── components/
    │   │   └── Layout.jsx         # Sidebar + navigation
    │   ├── services/
    │   │   └── api.js             # Axios API client
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── styles.css
    ├── index.html
    ├── vite.config.js
    └── package.json
```

---

## 🏃 Running Locally

### Prerequisites
- Node.js 18+
- Python 3.10+

### Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the server
uvicorn main:app --reload --port 8000
```

API will be available at `http://localhost:8000`  
Swagger docs: `http://localhost:8000/docs`

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
# Edit .env: VITE_API_URL=http://localhost:8000

# Start dev server
npm run dev
```

Frontend will be available at `http://localhost:3000`

---

## 🌐 Deployment

### Backend → Render

1. Push code to GitHub
2. Create new **Web Service** on [Render](https://render.com)
3. Connect your repository, set root directory to `backend/`
4. Build command: `pip install -r requirements.txt`
5. Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
6. Add a **PostgreSQL** database on Render, link it via `DATABASE_URL` env var

### Frontend → Vercel

1. Push code to GitHub
2. Import project on [Vercel](https://vercel.com)
3. Set root directory to `frontend/`
4. Add env variable: `VITE_API_URL=https://your-render-backend.onrender.com`
5. Deploy

---

## 📡 API Endpoints

| Method | Endpoint                          | Description                     |
|--------|-----------------------------------|---------------------------------|
| GET    | `/`                               | Health check                    |
| POST   | `/employees`                      | Create employee                 |
| GET    | `/employees`                      | List all employees (with stats) |
| GET    | `/employees/{id}`                 | Get single employee             |
| DELETE | `/employees/{id}`                 | Delete employee                 |
| POST   | `/attendance`                     | Mark/update attendance          |
| GET    | `/attendance`                     | All attendance (optional filter)|
| GET    | `/attendance/employee/{id}`       | Employee's attendance history   |
| GET    | `/dashboard`                      | Dashboard summary stats         |

---

## ⚠️ Assumptions & Limitations

- **Single admin user** — no authentication or roles implemented
- **SQLite** used for local development; PostgreSQL recommended for production
- **Attendance upsert** — marking attendance for the same employee+date updates the existing record
- Leave management, payroll, and multi-user support are out of scope
- No file upload or bulk import functionality

---

## 📝 License

MIT — free to use for assignment evaluation purposes.

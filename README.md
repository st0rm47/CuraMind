<div align="center">

# CuraMind

### AI-Powered Clinical Decision Support System

<br/>

![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Scikit-Learn](https://img.shields.io/badge/Scikit--Learn-F7931E?style=for-the-badge&logo=scikit-learn&logoColor=white)

<br/>

> CuraMind is an intelligent Clinical Decision Support System (CDSS) that combines machine learning with a modern web platform to assist patients and physicians in early disease risk prediction, clinical assessment, and follow-up management.

</div>

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [System Architecture](#system-architecture)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
  - [1. Clone the Repository](#1-clone-the-repository)
  - [2. Backend Setup](#2-backend-setup)
  - [3. Database Setup](#3-database-setup)
  - [4. Frontend Setup](#4-frontend-setup)
- [Running the Application](#running-the-application)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Machine Learning Module](#machine-learning-module)
- [Security](#security)
- [Contributors](#contributors)
- [License](#license)

---

## Overview

CuraMind bridges the gap between patients and physicians by providing an end-to-end platform for AI-assisted health assessment. Patients submit their clinical parameters and instantly receive machine-learning-generated risk predictions across multiple disease categories. Physicians can then review those predictions, issue corrections, write diagnoses, and track patient progress over time.

**Who is this for?**

| Role | What they can do |
|---|---|
| **Patient** | Submit health parameters, view AI risk predictions, read doctor notes, track follow-ups |
| **Doctor** | Review pending cases, override AI risk scores, write diagnoses and recommendations, monitor patient progress |

---

## Features

- **Multi-disease risk prediction** — AI models assess risk across diabetes, hypertension, heart disease, kidney disease, liver disease, and anaemia simultaneously
- **Explainable AI** — SHAP values show patients and doctors exactly which clinical factors are driving each prediction
- **Doctor review workflow** — Physicians can accept, override, or correct AI predictions and attach a written clinical assessment
- **Real-time notifications** — Doctors are notified of new submissions; patients are notified when their review is complete
- **Follow-up tracking** — Patients can submit follow-up readings; doctors are notified of updates
- **Role-based access control** — Separate, fully isolated patient and doctor interfaces with JWT authentication

---

## System Architecture

```
┌─────────────────────────┐
│      React Frontend     │
│  TypeScript · Tailwind  │
└────────────┬────────────┘
             │  HTTPS / REST
             ▼
┌─────────────────────────┐
│     FastAPI Backend     │
│  Python · SQLAlchemy    │
└──────────┬──────────────┘
           │
     ┌─────┴──────┐
     ▼            ▼
┌─────────┐  ┌──────────────┐
│Postgres │  │  ML Engine   │
│Database │  │ Scikit-Learn │
└─────────┘  └──────────────┘
```

The frontend communicates with the backend exclusively through a versioned REST API. The backend handles authentication, business logic, and database operations, and delegates prediction requests to the ML engine, which returns structured risk scores and SHAP explanations.

---

## Project Structure

### Backend

```
backend/
├── api/
│   ├── auth.py                # Authentication endpoints (register, login, me)
│   ├── patient.py             # Patient endpoints (assess, history, dashboard, doctor-notes)
│   ├── doctor.py              # Doctor endpoints (queue, review, dashboard, analytics)
│   ├── notifications.py       # Notification endpoints (list, mark read, count)
│   └── deps.py                # Dependency injection (require_patient, require_doctor, get_db)
│
├── core/
│   ├── config.py              # App-wide configuration loaded from .env
│   └── security.py            # Password hashing (bcrypt) and JWT creation/verification
│
├── models/
│   ├── user.py                # User SQLAlchemy model (patients and doctors share this table)
│   ├── reports.py             # Report model — stores health params, ML predictions, status
│   ├── doctor_review.py       # DoctorReview model — diagnosis, recommendations, risk overrides
│   ├── notifications.py       # Notification model
│   └── followup.py            # FollowUp model — patient-submitted follow-up readings
│
├── schemas/
│   ├── auth.py                # Pydantic schemas for register/login requests and responses
│   ├── patient.py             # Pydantic schemas for health parameter submission
│   ├── doctor.py              # Pydantic schemas for review submission
│   ├── followup.py            # Pydantic schemas for follow-up data
│   └── pagination.py          # Generic paginated response schema
│
├── services/
│   └── ml_engine.py           # Loads trained models, runs predictions, computes SHAP values
│
├── db/
│   ├── base.py                # SQLAlchemy declarative base
│   └── session.py             # Async database session factory and get_db dependency
│
├── alembic/
│   ├── versions/              # Auto-generated migration scripts
│   └── env.py                 # Alembic environment — connects to your DATABASE_URL
│
├── alembic.ini                # Alembic configuration file
├── main.py                    # FastAPI app instance, router registration, CORS setup
└── .env.example               # Template for required environment variables
```

### Frontend

```
frontend/
├── src/
│   ├── components/
│   │   ├── common/            # Shared components: Timeline, Charts, EmptyState, riskUtils
│   │   ├── layout/            # AppLayout, Sidebar, Navbar, PrivateRoute
│   │   └── ui/                # Design system: Card, Button, StatCard, Badge, ProgressBar, Spinner
│   │
│   ├── contexts/              # AuthContext — stores user session and exposes useAuth hook
│   ├── hooks/                 # useAuth and other custom hooks
│   │
│   ├── pages/
│   │   ├── auth/
│   │   │   ├── Login.tsx      # Login page
│   │   │   └── Register.tsx   # Registration page
│   │   │
│   │   ├── patient/
│   │   │   ├── Dashboard.tsx  # Patient dashboard — stats, risk overview, health indicators
│   │   │   ├── HealthInput.tsx# Health parameter submission form
│   │   │   ├── Predictions.tsx# Full AI prediction results
│   │   │   ├── Risk.tsx       # SHAP-based risk factor explainability
│   │   │   ├── Progress.tsx   # Health trend tracking over time
│   │   │   ├── FollowUp.tsx   # Follow-up submission form
│   │   │   └── DoctorNotes.tsx# Doctor review notes with AI predictions and overrides
│   │   │
│   │   ├── doctor/
│   │   │   ├── Dashboard.tsx  # Doctor dashboard — queue, analytics, system activity
│   │   │   ├── Queue.tsx      # Full paginated patient queue
│   │   │   └── Review.tsx     # Case review — patient params, AI predictions, diagnosis form
│   │   │
│   │   └── NotFound.tsx       # 404 page
│   │
│   ├── routes/                # AppRoutes.tsx — PrivateRoute and RoleRoute wrappers
│   ├── services/              # Axios API functions: auth.service.ts, patient.service.ts, doctor.service.ts
│   ├── styles/                # Global CSS and Tailwind base styles
│   ├── types/                 # TypeScript interfaces: report.ts, doctor.ts, dashboard.ts, review.ts
│   ├── utils/                 # formatDate.ts, reviewHelpers.ts, and other utilities
│   │
│   ├── App.tsx                # Root component with AuthProvider and router
│   ├── main.tsx               # React DOM entry point
│   └── index.css              # Global styles import
│
├── .env.example               # Frontend environment variable template
├── index.html                 # Vite HTML template
├── package.json               # Dependencies and scripts
├── vite.config.ts             # Vite build configuration
├── tailwind.config.js         # Tailwind CSS configuration
├── postcss.config.js          # PostCSS configuration
├── eslint.config.js           # ESLint rules
├── tsconfig.json              # Root TypeScript configuration
├── tsconfig.app.json          # TypeScript config for application source
└── tsconfig.node.json         # TypeScript config for Vite/Node tooling
```

---

## Prerequisites

Make sure the following are installed on your machine before continuing. Click each link for installation instructions.

| Tool | Minimum Version | Purpose |
|---|---|---|
| [Python](https://www.python.org/downloads/) | 3.10+ | Backend runtime |
| [Node.js](https://nodejs.org/) | 18+ | Frontend tooling |
| [PostgreSQL](https://www.postgresql.org/download/) | 14+ | Database |
| [Git](https://git-scm.com/) | Any | Version control |

To verify your installations, run:

```bash
python --version
node --version
psql --version
git --version
```

---

## Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/curamind.git
cd curamind
```

---

### 2. Backend Setup

#### Step 1 — Navigate to the backend directory

```bash
cd backend
```

#### Step 2 — Create and activate a virtual environment

A virtual environment keeps the project's Python dependencies isolated from your system.

**Windows:**
```bash
python -m venv venv
venv\Scripts\activate
```

**macOS / Linux:**
```bash
python -m venv venv
source venv/bin/activate
```

You should see `(venv)` appear at the start of your terminal prompt. This means the virtual environment is active.

#### Step 3 — Install Python dependencies

```bash
pip install -r requirements.txt
```

#### Step 4 — Configure environment variables

Copy the example file and fill in your values:

```bash
cp .env.example .env
```

Open `.env` in any text editor and update the values. See the [Environment Variables](#environment-variables) section for a full description of each variable.

---

### 3. Database Setup

#### Step 1 — Create the PostgreSQL database

Open a PostgreSQL shell or use a GUI tool such as pgAdmin and run:

```sql
CREATE DATABASE curamind;
```

#### Step 2 — Run database migrations

Alembic handles all table creation and schema changes. From inside the `backend/` directory with your virtual environment active, run:

```bash
alembic upgrade head
```

This will create all required tables in your database. If you see `INFO  [alembic.runtime.migration] Running upgrade ...` lines, the migration ran successfully.

> **First time?** If no migration versions exist yet, generate the initial migration first:
> ```bash
> alembic revision --autogenerate -m "initial"
> alembic upgrade head
> ```

#### Step 3 — Start the backend server

```bash
uvicorn main:app --reload
```

The backend will be available at:

```
http://127.0.0.1:8000
```

You can explore the interactive API documentation at:

```
http://127.0.0.1:8000/docs
```

---

### 4. Frontend Setup

Open a **new terminal window** (keep the backend running in the previous one).

#### Step 1 — Navigate to the frontend directory

```bash
cd frontend
```

#### Step 2 — Install Node.js dependencies

```bash
npm install
```

#### Step 3 — Configure environment variables

```bash
cp .env.example .env
```

Set `VITE_API_URL` to point to your running backend:

```env
VITE_API_URL=http://127.0.0.1:8000
```

#### Step 4 — Start the development server

```bash
npm run dev
```

The frontend will be available at:

```
http://localhost:5173
```

---

## Running the Application

Once both servers are running, open `http://localhost:5173` in your browser.

**First run checklist:**

1. ✅ PostgreSQL is running and the `curamind` database exists
2. ✅ Alembic migrations have been applied (`alembic upgrade head`)
3. ✅ Backend is running at `http://127.0.0.1:8000`
4. ✅ Frontend is running at `http://localhost:5173`

**Getting started:**

1. Open `http://localhost:5173`
2. Click **Register** and create a **Patient** account
3. Register a second account and select the **Doctor** role
4. Log in as the patient and submit a health assessment
5. Log in as the doctor and review the pending case in the queue

---

## Environment Variables

### Backend — `backend/.env`

| Variable | Description | Example |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql+asyncpg://user:password@localhost:5432/curamind` |
| `SECRET_KEY` | Secret key for signing JWT tokens. Use a long random string. | `supersecretrandomstring123` |
| `ALGORITHM` | JWT signing algorithm | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | How long a login token stays valid (in minutes) | `60` |

To generate a secure `SECRET_KEY`, run:

```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

### Frontend — `frontend/.env`

| Variable | Description | Example |
|---|---|---|
| `VITE_API_URL` | Base URL of the running FastAPI backend | `http://127.0.0.1:8000` |

---

## API Reference

All endpoints are prefixed with their resource path. Authentication endpoints are public; all others require a valid `Authorization: Bearer <token>` header.

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/auth/register` | Register a new patient or doctor account |
| `POST` | `/auth/login` | Log in and receive a JWT access token |
| `GET` | `/auth/me` | Return the currently authenticated user's profile |

### Patient

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/patient/assess` | Submit health parameters and receive AI predictions |
| `GET` | `/patient/dashboard` | Fetch all data for the patient dashboard in one request |
| `GET` | `/patient/history` | Paginated list of past assessments |
| `GET` | `/patient/assessments/latest` | Retrieve the most recent assessment (within 30 minutes) |
| `GET` | `/patient/assessments/latest/shap` | SHAP values for the most recent assessment |
| `GET` | `/patient/doctor-notes` | All reviewed reports with doctor profile, predictions, and overrides |
| `POST` | `/patient/followup/{report_id}` | Submit a follow-up reading for an existing report |

### Doctor

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/doctor/dashboard` | Fetch all data for the doctor dashboard in one request |
| `GET` | `/doctor/queue` | Paginated list of all patient cases with optional status filter |
| `POST` | `/doctor/review` | Submit a clinical review for a patient report |
| `GET` | `/doctor/corrections` | All cases where the doctor overrode AI predictions |

### Notifications

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/notifications` | List notifications for the current user |
| `GET` | `/notifications/count` | Unread notification count |
| `PATCH` | `/notifications/{id}/read` | Mark a single notification as read |
| `PATCH` | `/notifications/read-all` | Mark all notifications as read |

---

## Machine Learning Module

The ML engine is located in `backend/services/ml_engine.py` and is called synchronously during the `POST /patient/assess` request.

### What it does

1. Accepts the patient's health parameters as input
2. Runs them through one or more trained classifiers
3. Returns probability scores for each disease category
4. Computes SHAP values to explain which features drove each prediction
5. Assigns an overall risk level and generates recommendations

### Algorithms used

| Model | Disease Target |
|---|---|
| Random Forest | Heart Disease |
| Logistic Regression | HeartDisease|

### Input features

Age, gender, BMI, blood pressure, cholesterol, glucose, hemoglobin, creatinine, WBC count, platelet count, chest pain type, resting ECG, ST slope, exercise-induced angina, fasting blood sugar, maximum heart rate, ST depression, smoking status, alcohol consumption, physical activity level, and family history.

### Model performance targets

| Metric | Target |
|---|---|
| Accuracy | ≥ 85% |
| Precision | ≥ 85% |
| Recall | ≥ 85% |
| F1-Score | ≥ 85% |

---

## Security

| Mechanism | Implementation |
|---|---|
| Password storage | bcrypt hashing — plain-text passwords are never stored |
| Authentication | JWT tokens with configurable expiry |
| Authorisation | Role-based guards (`require_patient`, `require_doctor`) on every protected route |
| Data isolation | Patients can only access their own reports; doctors see all patients |
| Environment secrets | All credentials stored in `.env` files, excluded from version control via `.gitignore` |

---

## Contributors

| Name | Role |
|---|---|
| Subodh Ghimire | Backend Development, Database Design, ML Integration |
| Priyanka Thapa | Frontend Development, UI/UX, Model Training |
| Dikchhya Karki | Frontend Development, UI/UX, Model Training |

---

## License

This project is licensed under the [MIT License](LICENSE).

---

<div align="center">
  <sub>Built with ❤️ by the CuraMind team</sub>
</div>
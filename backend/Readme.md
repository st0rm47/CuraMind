# CuraMind Backend
- This is the backend for the CuraMind application, built with FastAPI. 
- It provides RESTful APIs for user authentication, patient assessments, doctor reviews, and notifications.

## Project Structure
```
backend/
├──api
│  ├── auth.py              # Authentication endpoints
│  ├── patient.py           # Patient-related endpoints
│  ├── doctor.py            # Doctor-related endpoints
│  └── notifications.py     # Notification-related endpoints
│  └── deps.py              # Dependency injection functions
|
├── core
│  ├── config.py            # Configuration settings
│  ├── security.py          # Security utilities (password hashing, JWT)
|
├── models
│  ├── user.py              # User model
│  ├── doctor_review.py     # Doctor review model
|  ├── reports.py           # Report model
|  └── notifications.py     # Notification model
|  └── followup.py          # Follow-up model
|
├── schemas
│  ├── auth.py              # Pydantic schemas for authentication
│  ├── patient.py           # Pydantic schemas for patient data
│  ├── doctor.py            # Pydantic schemas for doctor data
|  ├── followup.py          # Pydantic schemas for follow-up data
|  └── pagination.py        # Pydantic schemas for pagination
|
├── services
│  ├── ml.py                # Machine learning model integration
|
├── db
|  ├── base.py              # Database connection and session management
|  └── sessions.py          # Database session management
|
├── alembic
│  ├── versions
|  └── env.py               # Alembic environment configuration
|
├── alembic.ini             # Alembic configuration file
├── main.py                 # FastAPI application instance and route registration
├── requirements.txt        # Python dependencies
```

# API Documentation
The API endpoints are documented using OpenAPI (Swagger) and can be accessed at `http://localhost:8000/docs` when the server is running. Each endpoint includes details about the request parameters, response format, and authentication requirements.


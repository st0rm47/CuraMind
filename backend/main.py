from fastapi import FastAPI
import uvicorn
from models import User, Report, DoctorReview, FollowUp, Notification
from db.session import engine, get_db
from db.base import Base
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import Depends
from fastapi.middleware.cors import CORSMiddleware


from api import auth, patient, doctor, notifications, admin

# Create a FastAPI instance
app = FastAPI(title = "CuraMind")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # for dev (later restrict)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)  
        
# # Run the application
# if __name__ == "__main__":
#     uvicorn.run(app, host = "127.0.0.1", port=8000)


# Include the authentication router from the auth module
app.include_router(auth.router)

# Include the patient router from the patient module
app.include_router(patient.router)

# Include the doctor router from the doctor module
app.include_router(doctor.router)

# Include the notifications router from the notifications module
app.include_router(notifications.router)

# Include the admin router from the admin module
app.include_router(admin.router)

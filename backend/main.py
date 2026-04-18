from fastapi import FastAPI
import uvicorn
from models import User, Assessment, DoctorReview, FollowUp, Notification
from db.session import engine, get_db
from db.base import Base
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import Depends


from api import auth, patient, doctor, notifications

# Create a FastAPI instance
app = FastAPI(title = "CuraMind")

# Define a simple route for 
@app.get("/")
async def read_root():
    return {"message": "Welcome to CuraMind API!"}


# # Create the database tables
@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        
# # Run the application
# if __name__ == "__main__":
#     uvicorn.run(app, host = "127.0.0.1", port=8000)

# Define a route to test the database connection
# This route uses the get_db dependency to obtain a database session and returns a success message if the connection is working.
@app.get("/db-test")
async def db_test(db: AsyncSession = Depends(get_db)):
    return {"message": "Database connection working 🚀"}

# Include the authentication router from the auth module
app.include_router(auth.router)

# Include the patient router from the patient module
app.include_router(patient.router)

# Include the doctor router from the doctor module
app.include_router(doctor.router)

# Include the notifications router from the notifications module
app.include_router(notifications.router)
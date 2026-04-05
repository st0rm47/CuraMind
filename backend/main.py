from fastapi import FastAPI
import uvicorn

# Create a FastAPI instance
app = FastAPI(title = "CuraMind")

# Define a simple route for 
@app.get("/")
async def read_root():
    return {"message": "Welcome to CuraMind API!"}


        
# Run the application
if __name__ == "__main__":
    uvicorn.run(app, host = "127.0.0.1", port=8000)
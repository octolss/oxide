from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, measurements

app = FastAPI(
    title="Sensoru Pārvaldes Sistēma API",
    version="1.0.0",
    description="API для управления датчиками с Supabase PostgreSQL"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001", 
        "http://localhost:5173",
        "http://localhost",
        "http://localhost:80",
        "https://oxide-level.id.lv",
        "http://oxide-level.id.lv",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Autentifikācija"])
app.include_router(measurements.router, prefix="/api/measurements", tags=["Mērījumi"])

@app.get("/")
async def root():
    return {"message": "Sensoru Pārvaldes Sistēma API", "status": "running"}

@app.get("/api/health")
async def health_check():
    return {"status": "ok"}


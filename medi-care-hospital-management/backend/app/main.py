from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging

from app.routers import (
    auth,
    dashboard,
    patients,
    doctors,
    departments,
    appointments,
    medical_records,
    prescriptions,
    rooms,
    admissions,
    bills,
    payments,
    staff,
    reports
)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("medicare")

app = FastAPI(
    title="MediCare – Hospital Management System API",
    description="A comprehensive, normalized relational DBMS project for Hospital Administration",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json"
)

# CORS Configuration for React Frontend
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers under /api
app.include_router(auth.router, prefix="/api")
app.include_router(dashboard.router, prefix="/api")
app.include_router(patients.router, prefix="/api")
app.include_router(doctors.router, prefix="/api")
app.include_router(departments.router, prefix="/api")
app.include_router(appointments.router, prefix="/api")
app.include_router(medical_records.router, prefix="/api")
app.include_router(prescriptions.router, prefix="/api")
app.include_router(rooms.router, prefix="/api")
app.include_router(admissions.router, prefix="/api")
app.include_router(bills.router, prefix="/api")
app.include_router(payments.router, prefix="/api")
app.include_router(staff.router, prefix="/api")
app.include_router(reports.router, prefix="/api")


@app.get("/api/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "service": "MediCare Hospital Management System API",
        "version": "1.0.0",
        "database": "medicare_hospital (MySQL/MariaDB)"
    }


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled error: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An internal server error occurred. Please contact the administrator."}
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import auth, collections, customers, dashboard, loans, perkeso, repayments, short_term_loans
from app.core.config import settings
from app.core.security import get_password_hash
from app.db.session import Base, SessionLocal, engine
from app.models.user import User, UserRole

app = FastAPI(title="Loan Management System API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    if settings.auto_create_tables and not settings.testing:
        Base.metadata.create_all(bind=engine)

    if settings.seed_default_admin and not settings.testing:
        db = SessionLocal()
        try:
            admin_email = "admin@lms.com"
            admin = db.query(User).filter(User.email == admin_email).first()
            if not admin:
                db.add(
                    User(
                        email=admin_email,
                        hashed_password=get_password_hash("admin123"),
                        role=UserRole.admin,
                    )
                )
                db.commit()
        finally:
            db.close()


@app.get("/")
def root():
    return {"message": "Loan Management System API"}


app.include_router(auth.router, prefix="/api")
app.include_router(customers.router, prefix="/api")
app.include_router(loans.router, prefix="/api")
app.include_router(repayments.router, prefix="/api")
app.include_router(short_term_loans.router, prefix="/api")
app.include_router(collections.router, prefix="/api")
app.include_router(dashboard.router, prefix="/api")
app.include_router(perkeso.router, prefix="/api")


import os
from collections.abc import Generator

os.environ["TESTING"] = "true"
os.environ["AUTO_CREATE_TABLES"] = "false"
os.environ["SEED_DEFAULT_ADMIN"] = "false"

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.pool import StaticPool
from sqlalchemy.orm import Session, sessionmaker

from app.api.deps import get_db
from app.core.security import get_password_hash
from app.db.session import Base
from app.main import app
from app.models.user import User, UserRole

engine = create_engine(
    "sqlite+pysqlite:///:memory:",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base.metadata.create_all(bind=engine)


def override_get_db() -> Generator[Session, None, None]:
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


def seed_admin() -> None:
    db = TestingSessionLocal()
    try:
        if not db.query(User).filter(User.email == "admin@test.com").first():
            db.add(
                User(
                    email="admin@test.com",
                    hashed_password=get_password_hash("secret123"),
                    role=UserRole.admin,
                )
            )
            db.commit()
    finally:
        db.close()


def test_login_and_get_me():
    seed_admin()
    client = TestClient(app)

    login_res = client.post(
        "/api/auth/login",
        data={"username": "admin@test.com", "password": "secret123"},
        headers={"Content-Type": "application/x-www-form-urlencoded"},
    )

    assert login_res.status_code == 200
    token = login_res.json()["access_token"]

    me_res = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_res.status_code == 200
    assert me_res.json()["email"] == "admin@test.com"


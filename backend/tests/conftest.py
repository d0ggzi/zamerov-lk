import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, StaticPool
from sqlalchemy.orm import sessionmaker
from src.main import app
from src.domain.base import BaseModel, get_session
from src.settings.config import settings

# Use a separate test database or SQLite in-memory for tests
# For a truly minimal set, we can use SQLite if the project doesn't use PG-specific features
# But since this is PG, we'll use a test-specific URL if provided or fallback to a local test db
TEST_DATABASE_URL = f"{settings.DATABASE_URL_psycopg.replace(settings.POSTGRES_DB, 'default_db')}"

engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in TEST_DATABASE_URL else {},
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

from src.domain.models.users import Role

@pytest.fixture(scope="session", autouse=True)
def setup_database():
    # Create tables
    BaseModel.metadata.create_all(bind=engine)

    # Seed roles
    session = TestingSessionLocal()
    roles = ["admin", "user", "manager"]
    for role_name in roles:
        if not session.query(Role).filter_by(name=role_name).first():
            session.add(Role(name=role_name))
    session.commit()
    session.close()
    yield
    # Drop tables
    BaseModel.metadata.drop_all(bind=engine)

@pytest.fixture
def db_session():
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()

@pytest.fixture
def client(db_session):
    def override_get_session():
        yield db_session

    app.dependency_overrides[get_session] = override_get_session
    with TestClient(app) as client:
        yield client
    app.dependency_overrides.clear()

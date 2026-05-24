import pytest
from fastapi.testclient import TestClient

def test_register_user(client):
    # Test successful registration
    payload = {
        "email": "test@example.com",
        "password": "strongpassword123",
        "name": "Test User",
        "role_name": "user"
    }
    response = client.post("/api/auth/register", json=payload)
    assert response.status_code == 200
    assert "access_token" in response.json()

def test_register_duplicate_user(client):
    # Test registration with existing email
    payload = {
        "email": "duplicate@example.com",
        "password": "password123",
        "name": "User 1",
        "role_name": "user"
    }
    client.post("/api/auth/register", json=payload)
    response = client.post("/api/auth/register", json=payload)
    assert response.status_code == 409
    assert response.json()["detail"] == "Email already in use"

def test_login_success(client):
    # Register and then login
    payload = {
        "email": "login@example.com",
        "password": "password123",
        "name": "Login User",
        "role_name": "user"
    }
    client.post("/api/auth/register", json=payload)

    # FastAPI OAuth2PasswordRequestForm expects data as form-data, not JSON
    login_data = {
        "username": "login@example.com",
        "password": "password123"
    }
    response = client.post("/api/auth/token", data=login_data)
    assert response.status_code == 200
    assert "access_token" in response.json()

def test_login_failure(client):
    # Login with wrong password
    login_data = {
        "username": "nonexistent@example.com",
        "password": "wrongpassword"
    }
    response = client.post("/api/auth/token", data=login_data)
    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid Credentials"

def test_get_me_with_token(client):
    # Register and get token
    payload = {
        "email": "me@example.com",
        "password": "password123",
        "name": "Me User",
        "role_name": "user"
    }
    reg_res = client.post("/api/auth/register", json=payload)
    token = reg_res.json()["access_token"]

    # Access /api/users/me
    response = client.get(
        "/api/users/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    assert response.json()["email"] == "me@example.com"

def test_get_me_without_token(client):
    response = client.get("/api/users/me")
    assert response.status_code == 401

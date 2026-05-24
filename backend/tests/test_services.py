import pytest

def test_create_and_list_services(client):
    # 1. Setup: Register and get token
    reg_payload = {
        "email": "service_test@example.com",
        "password": "password123",
        "name": "Service User",
        "role_name": "user"
    }
    reg_res = client.post("/api/auth/register", json=reg_payload)
    token = reg_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Create a service
    service_payload = {
        "name": "Test Service",
        "description": "Description of test service",
        "price": 100.0
    }
    res_create = client.post("/api/services/", json=service_payload, headers=headers)
    assert res_create.status_code == 200
    service_id = res_create.json()["id"]

    # 3. List services and verify it's there
    res_list = client.get("/api/services/", headers=headers)
    assert res_list.status_code == 200
    services = res_list.json()
    assert any(s["id"] == service_id for s in services)

def test_service_access_without_token(client):
    res = client.get("/api/services/")
    assert res.status_code == 401

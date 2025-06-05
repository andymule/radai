import sys
import os
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__) + "/.."))
import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Food Facility Permits API"}

def test_get_permits_no_filters():
    response = client.get("/permits")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0
    # Check required fields
    assert all(
        all(key in permit for key in ["applicant", "address", "status"])
        for permit in data
    )

def test_get_permits_with_filters():
    # Test applicant filter
    response = client.get("/permits?applicant=test")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert all("test" in permit["applicant"].lower() for permit in data)

    # Test status filter
    response = client.get("/permits?status=APPROVED")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert all(permit["status"] == "APPROVED" for permit in data)

    # Test combined filters
    response = client.get("/permits?applicant=test&status=APPROVED")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert all(
        "test" in permit["applicant"].lower() and permit["status"] == "APPROVED"
        for permit in data
    )

def test_search_by_address():
    # Test exact match (use a common address from your data, e.g. 'STREET')
    response = client.get("/permits/address?address=STREET")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert all("STREET" in permit["address"] for permit in data)

    # Test partial match (use a substring that is very likely to exist, e.g. 'ST')
    response = client.get("/permits/address?address=ST")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert all("ST" in permit["address"] for permit in data)

    # Test no matches
    response = client.get("/permits/address?address=NonExistentStreet")
    assert response.status_code == 200
    assert response.json() == []

def test_find_nearby():
    # Test with valid coordinates
    response = client.get("/permits/nearby?lat=37.7749&lon=-122.4194&radius=1")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert all(
        all(key in permit for key in ["applicant", "address", "status", "distance"])
        for permit in data
    )

    # Test with status filter
    response = client.get("/permits/nearby?lat=37.7749&lon=-122.4194&radius=1&status=APPROVED")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert all(permit["status"] == "APPROVED" for permit in data)

    # Test with invalid coordinates
    response = client.get("/permits/nearby?lat=invalid&lon=-122.4194&radius=1")
    assert response.status_code == 422  # Validation error

    # Test with missing coordinates
    response = client.get("/permits/nearby?radius=1")
    assert response.status_code == 422  # Validation error

    # Test with very large radius (should return more results)
    response_large = client.get("/permits/nearby?lat=37.7749&lon=-122.4194&radius=10000")
    assert response_large.status_code == 200
    data_large = response_large.json()
    assert isinstance(data_large, list)
    assert len(data_large) >= len(data)

    # Test with very small radius (should return few or no results)
    response_small = client.get("/permits/nearby?lat=37.7749&lon=-122.4194&radius=0.0001")
    assert response_small.status_code == 200
    data_small = response_small.json()
    assert isinstance(data_small, list)

def test_get_permits_invalid_status():
    response = client.get("/permits?status=INVALID_STATUS")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 0

def test_404_not_found():
    response = client.get("/nonexistent-endpoint")
    assert response.status_code == 404

# Edge case: empty query params

def test_empty_query_params():
    response = client.get("/permits?applicant=&status=")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list) 
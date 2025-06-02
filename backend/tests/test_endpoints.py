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
    assert response.json() == {"message": "Hello, world!"}

def test_get_permits_no_filters():
    response = client.get("/permits")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0
    # Check first permit has all required fields
    first_permit = data[0]
    assert "locationid" in first_permit
    assert "applicant" in first_permit
    assert "status" in first_permit
    assert "address" in first_permit
    assert "latitude" in first_permit
    assert "longitude" in first_permit

def test_get_permits_with_applicant_filter():
    response = client.get("/permits?applicant=HalalCart")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert all("HalalCart" in permit["applicant"] for permit in data)

def test_get_permits_with_status_filter():
    response = client.get("/permits?status=APPROVED")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert all(permit["status"] == "APPROVED" for permit in data)

def test_get_permits_with_both_filters():
    response = client.get("/permits?applicant=HalalCart&status=APPROVED")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert all(
        "HalalCart" in permit["applicant"] and permit["status"] == "APPROVED"
        for permit in data
    )

def test_search_by_address_exact():
    response = client.get("/permits/address?street=455%20MARKET")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert any(permit["address"] == "455 MARKET ST" for permit in data)

def test_search_by_address_partial():
    response = client.get("/permits/address?street=MARKET")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert all("MARKET" in permit["address"] for permit in data)

def test_find_nearby_basic():
    # Test with coordinates near Market Street
    response = client.get("/permits/nearby?lat=37.7749&lon=-122.4194&limit=3")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) <= 3
    assert all("distance_km" in permit for permit in data)
    # Verify results are sorted by distance
    distances = [permit["distance_km"] for permit in data]
    assert distances == sorted(distances)

def test_find_nearby_with_status():
    response = client.get("/permits/nearby?lat=37.7749&lon=-122.4194&status=APPROVED&limit=3")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) <= 3
    assert all(permit["status"] == "APPROVED" for permit in data)
    assert all("distance_km" in permit for permit in data)

def test_find_nearby_include_all():
    response = client.get("/permits/nearby?lat=37.7749&lon=-122.4194&status=APPROVED&include_all=true&limit=3")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) <= 3
    # Should include non-APPROVED permits when include_all is true
    assert any(permit["status"] != "APPROVED" for permit in data)

def test_find_nearby_invalid_coordinates():
    response = client.get("/permits/nearby?lat=0&lon=0&limit=3")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    # Should filter out permits with invalid coordinates
    assert all(
        permit["latitude"] != 0 and permit["longitude"] != 0
        for permit in data
    )

def test_get_permits_invalid_status():
    response = client.get("/permits?status=INVALID_STATUS")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 0 
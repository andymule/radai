from fastapi import FastAPI
from fastapi.responses import JSONResponse
import sqlite3
import csv
from typing import List
import logging
import threading
import math

app = FastAPI()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Thread-local storage for the database connection
local = threading.local()

def get_db_conn():
    if not hasattr(local, 'conn'):
        local.conn = sqlite3.connect(':memory:')
        cursor = local.conn.cursor()
        # Schema
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS permits (
            id INTEGER PRIMARY KEY,
            locationid TEXT,
            applicant TEXT,
            facilitytype TEXT,
            cnn TEXT,
            locationdescription TEXT,
            address TEXT,
            blocklot TEXT,
            block TEXT,
            lot TEXT,
            permit TEXT,
            status TEXT,
            fooditems TEXT,
            x REAL,
            y REAL,
            latitude REAL,
            longitude REAL,
            schedule TEXT,
            dayshours TEXT,
            noisent TEXT,
            approved TEXT,
            received TEXT,
            priorpermit TEXT,
            expirationdate TEXT
        )
        ''')
        with open('Mobile_Food_Facility_Permits.csv', 'r') as file:
            csv_reader = csv.DictReader(file)
            for row in csv_reader:
                numeric_fields = ['X', 'Y', 'Latitude', 'Longitude']
                for key in numeric_fields:
                    if key in row and row[key] == '':
                        row[key] = None
                cursor.execute('''
                INSERT INTO permits (
                    locationid, applicant, facilitytype, cnn, locationdescription,
                    address, blocklot, block, lot, permit, status, fooditems,
                    x, y, latitude, longitude, schedule, dayshours, noisent,
                    approved, received, priorpermit, expirationdate
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', (
                    row.get('locationid', ''), row.get('Applicant', ''),
                    row.get('FacilityType', ''), row.get('cnn', ''),
                    row.get('LocationDescription', ''), row.get('Address', ''),
                    row.get('blocklot', ''), row.get('block', ''),
                    row.get('lot', ''), row.get('permit', ''),
                    row.get('Status', ''), row.get('FoodItems', ''),
                    row.get('X', None), row.get('Y', None),
                    row.get('Latitude', None), row.get('Longitude', None),
                    row.get('Schedule', ''), row.get('dayshours', ''),
                    row.get('NOISent', ''), row.get('Approved', ''),
                    row.get('Received', ''), row.get('PriorPermit', ''),
                    row.get('ExpirationDate', '')
                ))
        local.conn.commit()
    return local.conn

@app.on_event("startup")
def startup_event():
    get_db_conn()

@app.get("/permits")
def get_permits(applicant: str = None, status: str = None):
    try:
        conn = get_db_conn()
        cursor = conn.cursor()
        query = "SELECT * FROM permits"
        params = []
        if applicant:
            query += " WHERE applicant LIKE ?"
            params.append(f"%{applicant}%")
        if status:
            if applicant:
                query += " AND status = ?"
            else:
                query += " WHERE status = ?"
            params.append(status)
        cursor.execute(query, params)
        columns = [desc[0] for desc in cursor.description]
        results = [dict(zip(columns, row)) for row in cursor.fetchall()]
        return JSONResponse(content=results)
    except Exception as e:
        logger.error(f"Error fetching permits: {e}")
        return JSONResponse(status_code=500, content={"error": "Internal Server Error"})

@app.get("/permits/address")
def search_by_address(address: str):
    try:
        conn = get_db_conn()
        cursor = conn.cursor()
        query = "SELECT * FROM permits WHERE address LIKE ?"
        # Add wildcards for partial matching and make case-insensitive
        params = [f"%{address}%"]
        cursor.execute(query, params)
        columns = [desc[0] for desc in cursor.description]
        results = [dict(zip(columns, row)) for row in cursor.fetchall()]
        return JSONResponse(content=results)
    except Exception as e:
        logger.error(f"Error searching by address: {e}")
        return JSONResponse(status_code=500, content={"error": "Internal Server Error"})

@app.get("/")
def read_root():
    return {"message": "Food Facility Permits API"}

def haversine_distance(lat1, lon1, lat2, lon2):
    """
    Calculate the great circle distance between two points 
    on the earth (specified in decimal degrees)
    """
    # Convert decimal degrees to radians
    lat1, lon1, lat2, lon2 = map(math.radians, [lat1, lon1, lat2, lon2])
    
    # Haversine formula
    dlon = lon2 - lon1
    dlat = lat2 - lat1
    a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon/2)**2
    c = 2 * math.asin(math.sqrt(a))
    r = 6371  # Radius of earth in kilometers
    return c * r

@app.get("/permits/nearby")
def find_nearby(lat: float, lon: float, status: str = None, radius: float = 1.0):
    try:
        conn = get_db_conn()
        cursor = conn.cursor()
        
        # Base query to get all permits with valid coordinates
        query = """
        SELECT *, 
        (latitude - ?) * (latitude - ?) + (longitude - ?) * (longitude - ?) as distance_squared
        FROM permits 
        WHERE latitude IS NOT NULL 
        AND longitude IS NOT NULL
        AND latitude != 0 
        AND longitude != 0
        """
        params = [lat, lat, lon, lon]
        
        # Add status filter if provided
        if status:
            query += " AND status = ?"
            params.append(status)
            
        cursor.execute(query, params)
        columns = [desc[0] for desc in cursor.description]
        results = []
        
        for row in cursor.fetchall():
            permit = dict(zip(columns, row))
            # Calculate actual distance in kilometers
            distance = haversine_distance(
                lat, lon,
                permit['latitude'], permit['longitude']
            )
            # Only include permits within the radius
            if distance <= radius:
                permit['distance'] = distance
                # Remove the temporary distance_squared field
                del permit['distance_squared']
                results.append(permit)
            
        return JSONResponse(content=results)
    except Exception as e:
        logger.error(f"Error finding nearby permits: {e}")
        return JSONResponse(status_code=500, content={"error": "Internal Server Error"}) 
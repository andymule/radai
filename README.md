# Mobile Food Facility Permit Search Application

A FastAPI-based application for searching and filtering mobile food facility permits in San Francisco. This application provides a RESTful API to search permits by applicant name, status, and location.

## Project Overview

This application processes the [Mobile Food Facility Permit dataset](https://data.sfgov.org/Economy-and-Community/Mobile-Food-Facility-Permit/rqzj-sfat/data) from San Francisco's open data portal. It loads the data into an in-memory SQLite database and provides search capabilities through a FastAPI backend.

## Features

- Search permits by applicant name
- Filter permits by status
- In-memory SQLite database for fast queries
- RESTful API with Swagger documentation
- Thread-safe database connections

## Data Schema

The application uses the following schema for the permits table:

```sql
CREATE TABLE permits (
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
```

## Setup Instructions

### Prerequisites

- Python 3.11.4 or higher
- pip (Python package manager)
- Git (optional, for version control)

### Installation

1. Clone the repository (if using Git):
   ```bash
   git clone <repository-url>
   cd <repository-name>
   ```

2. Create and activate a virtual environment:
   ```bash
   # On macOS/Linux
   python3 -m venv venv
   source venv/bin/activate

   # On Windows
   python -m venv venv
   .\venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   # Navigate to the backend directory
   cd backend
   pip install -r requirements.txt
   ```

4. Run the project:
   ```bash
   # Start the FastAPI server
   uvicorn main:app --reload
   ```

The API will be available at http://127.0.0.1:8000

## API Documentation

### Endpoints

#### GET /permits
Returns a list of permits with optional filtering.

Query Parameters:
- `applicant` (optional): Filter permits by applicant name (partial match)
- `status` (optional): Filter permits by status (exact match)

Example requests:
```bash
# Get all permits
curl http://127.0.0.1:8000/permits

# Search by applicant name
curl http://127.0.0.1:8000/permits?applicant=John

# Filter by status
curl http://127.0.0.1:8000/permits?status=APPROVED

# Combine filters
curl http://127.0.0.1:8000/permits?applicant=John&status=APPROVED
```

Response format:
```json
[
  {
    "id": 1,
    "locationid": "...",
    "applicant": "...",
    "status": "...",
    // ... other fields
  }
]
```

#### GET /
Health check endpoint that returns a simple message.

Example request:
```bash
curl http://127.0.0.1:8000/
```

Response:
```json
{
  "message": "Hello, world!"
}
```

### Interactive API Documentation

The API includes interactive documentation powered by Swagger UI. Visit http://127.0.0.1:8000/docs to explore and test the API endpoints.

## Project Structure
- `backend/`: Contains the FastAPI backend application
  - `main.py`: FastAPI application entry point
  - `load_data.py`: Script to load permit data from CSV into SQLite
  - `requirements.txt`: Backend dependencies
  - `Mobile_Food_Facility_Permits.csv`: Source data file
  - `.venv/`: Virtual environment (do not commit this directory)

## Known Limitations

1. The application uses an in-memory SQLite database, which means:
   - Data is lost when the server restarts
   - Not suitable for concurrent write operations
   - Limited by available RAM

2. Current implementation:
   - Does not support pagination for large result sets
   - No rate limiting implemented
   - Basic error handling only

## Future Improvements

1. Add support for:
   - Pagination of results
   - Rate limiting
   - More advanced search filters
   - Geospatial queries
   - Caching layer

2. Enhance error handling and logging
3. Add comprehensive test coverage
4. Implement data persistence
5. Add authentication and authorization

## Development

To contribute to the project:

1. Follow the setup instructions above
2. Make your changes in a new branch
3. Test your changes thoroughly
4. Submit a pull request

### Running Tests

The project uses pytest for testing. To run the tests:

```bash
# Make sure you're in the backend directory and virtual environment is activated
cd backend
pytest test_main.py -v
```

The tests verify:
- Basic endpoint functionality
- Filter parameters work correctly
- Response formats are valid
- Edge cases are handled properly

## License

----BEER license----
If you use this code, have to include this license text as a raw text. And if you like it, you also should consider buying me a beer. I'm Andy Muehlhausen and my email is andymule@gmail.com
----end BEER license----
1. File & Folder Structure
project-root/
│
├── backend/                          ← Python/FastAPI "sidecar" service
│   ├── .python-version               ← pyenv-pinned Python version (e.g. "3.11.4")
│   ├── requirements.txt              ← exact Python dependencies
│   ├── main.py                       ← FastAPI application (uses in-RAM DB, loads CSV on startup)
│   ├── Mobile_Food_Facility_Permits.csv  ← source data
│   ├── tests/                        ← test suite for backend
│   │   └── test_endpoints.py         ← tests for API endpoints
│   └── .venv/                        ← virtualenv created via `python -m venv .venv`
│
├── electron-app/                     ← Electron-based frontend
│   ├── package.json
│   ├── tsconfig.json
│   ├── public/
│   │   └── index.html                ← shell HTML
│   └── src/
│       ├── main.ts                   ← Electron main (spawns Python)
│       ├── preload.ts                ← secure IPC bridge (optional)
│       └── renderer/
│           ├── index.tsx             ← React entrypoint
│           ├── App.tsx               ← top-level component
│           ├── components/           ← UI components (SearchBar, MapView, ListView…)
│           └── services/
│               └── api.ts            ← client-side fetch wrappers
│
└── README.md                         ← high-level instructions



2. Component Responsibilities

2.1 backend/
.python-version
Pins the Python interpreter via pyenv (pyenv local 3.11.4).

requirements.txt
Contains:
fastapi==0.100.0
uvicorn[standard]==0.23.1
pydantic==2.11.5
pytest==7.4.3
httpx==0.25.1

main.py
On startup, loads Mobile_Food_Facility_Permits.csv into an in-memory SQLite database.
Defines three FastAPI endpoints:
GET /permits?applicant=&status=
  - Optional applicant filter (case-insensitive partial match)
  - Optional status filter (exact match)
  - Returns all matching permits

GET /permits/address?street=
  - Required street parameter
  - Case-insensitive partial match on address field
  - Returns all matching permits

GET /permits/nearby?lat=&lon=&status=&limit=&include_all=
  - Required lat/lon coordinates
  - Optional status filter
  - Optional limit (default 10)
  - Optional include_all flag to ignore status filter
  - Returns permits sorted by distance with distance_km field
  - Filters out invalid coordinates (null or 0,0)

Uses direct SQLite queries for efficient filtering and distance calculations.
Serves Swagger UI at /docs.

In-RAM SQLite
Holds all permit records in memory for the lifetime of the process.
State lives here; no on-disk DB file.
Thread-safe connection handling via threading.local().

tests/
test_endpoints.py
Comprehensive test suite for all API endpoints:
- Tests root endpoint
- Tests /permits with various filters
- Tests /permits/address with exact and partial matches
- Tests /permits/nearby with distance, status, limit, and include_all
- Tests edge cases (invalid coordinates, sorting, field presence)

.venv/
Isolated Python environment for dependencies.
2.2 electron-app/
package.json / tsconfig.json
Manage Node/Electron dependencies and TypeScript settings.
public/index.html
Shell HTML loaded by the renderer.
src/main.ts
On app.whenReady(), spawns the Python backend:
spawn(
  path.join(__dirname, '../backend/.venv/bin/python'),
  [
    path.join(__dirname, '../backend/load_data.py'),
    '&&',
    'uvicorn', 'main:app',
    '--host', '127.0.0.1',
    '--port', '8000'
  ],
  { shell: true }
);
Creates a BrowserWindow pointed at public/index.html.
On app exit, kills the Python process.
src/preload.ts
Sets up secure IPC channels between main & renderer (if needed).
src/renderer/
App.tsx
Top-level React component holding UI state:
applicantQuery, streetQuery, statusFilter
userLocation (lat/lon from Geolocation API)
components/
SearchBar, StatusFilter, MapView, ListView, etc.
services/api.ts
Exports searchPermits(), searchAddress(), findNearby().
Internally calls fetch("http://127.0.0.1:8000/...").
3. State & Data Flow

Persistent State
None on disk: CSV is read at startup, state lives in RAM only.
Ephemeral State (Frontend)
React State (via hooks) stores UI inputs and map center.
Optionally, React Query caches recent API results.
Service Interactions
Electron Main → Python Backend
spawn() runs load_data.py, then serves FastAPI on port 8000.
Renderer → Backend
React components fetch() JSON from 127.0.0.1:8000.
JSON results drive UI updates.
4. Startup & Run

Backend Setup (once or when CSV updates):
cd backend
pyenv install           # if needed
pyenv local             # reads .python-version
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
Electron App:
cd electron-app
npm install
npm run dev             # or `npm run build`
npm start               # launches Electron (+ backend)
User Flow
Electron spawns Python → FastAPI listens on port 8000.
Renderer loads React UI and invokes API wrappers.
User types search → sees filtered list & map markers.
5. Next Steps & Scaling

FTS5: enable SQLite full-text search for faster substring or token queries.
R-Tree or SpatiaLite: add spatial indexes for O(log n) nearest-neighbor.
Startup Robustness: in main.ts, wait for FastAPI readiness before showing UI.
Migrations: convert load_data.py into a one-time migration script for future schema changes.


### CODING PROTOCOL ###
" Coding Instructions
- Write the absolute minimum code required
- No sweeping changes
- No unrelated edits - focus on just the task you're on
- Make code precise, modular, testable
- Don't break existing functionality
- If I need to do anything (e.g. Supabase/AWS config), tell me clearly "
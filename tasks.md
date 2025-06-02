# MVP Development Tasks

## Phase 1: Backend Setup
1. Create backend directory structure
   - [x] Create `backend/` directory
   - [x] Create `.python-version` with Python 3.11.4
   - [x] Create empty `requirements.txt`

2. Set up Python environment
   - [x] Create virtual environment
   - [x] Install FastAPI and dependencies
   - [x] Test environment with simple FastAPI hello world endpoint

3. Data Loading Setup
   - [x] Create basic SQLite schema for permits table from Mobile_Food_Facility_Permits.csv
   - [x] Write CSV loading function
   - [x] Test loading 1 row of data
   - [x] Test loading full dataset

4. Basic API Endpoints
   - [x] Implement GET /permits endpoint (no filters)
   - [x] Add applicant filter parameter
   - [x] Add status filter parameter
   - [x] Test each filter combination

5. Address Search
   - [x] Implement GET /permits/address endpoint
   - [x] Add basic street name matching
   - [x] Test with exact street matches
   - [x] Test with partial street matches

6. Nearby Search
   - [x] Implement GET /permits/nearby endpoint
   - [x] Add basic distance calculation
   - [x] Add status filter
   - [x] Add limit parameter
   - [x] Test with sample coordinates

## Phase 2: Frontend Setup
7. Electron App Structure
   - [ ] Create electron-app directory
   - [ ] Initialize package.json
   - [ ] Set up TypeScript configuration
   - [ ] Create basic HTML shell

8. Main Process
   - [ ] Set up Electron main process
   - [ ] Implement Python backend spawning
   - [ ] Test backend process management
   - [ ] Add error handling for backend startup

9. Basic UI Components
   - [ ] Create SearchBar component
   - [ ] Create StatusFilter component
   - [ ] Create basic ListView component
   - [ ] Test each component in isolation

10. API Integration
    - [ ] Create API service layer
    - [ ] Implement searchPermits function
    - [ ] Implement searchAddress function
    - [ ] Implement findNearby function
    - [ ] Test each API call

11. UI State Management
    - [ ] Set up React state for search queries
    - [ ] Implement search form submission
    - [ ] Add loading states
    - [ ] Add error handling

## Phase 3: Integration
12. Backend-Frontend Integration
    - [ ] Connect SearchBar to API
    - [ ] Connect StatusFilter to API
    - [ ] Display results in ListView
    - [ ] Test full search flow

13. Error Handling
    - [ ] Add backend error responses
    - [ ] Add frontend error display
    - [ ] Test error scenarios

14. Documentation
    - [ ] Add API documentation
    - [ ] Update README with setup instructions
    - [ ] Document known limitations

## Testing Strategy
Each task should be tested with:
- Unit tests for individual components
- Integration tests for API endpoints
- Manual testing of UI components
- End-to-end testing of complete features

## Notes
- Each task should be completed and tested before moving to the next
- Tasks are designed to be small and focused
- Testing should be done after each task
- Document any issues or decisions in the README 
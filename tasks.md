# MVP Development Tasks

## Phase 1: Backend Setup ✅
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

## Phase 2: VS Code Extension Development

### 1. Extension Project Setup
- [x] Create VS Code extension project
  ```bash
  cd electron-app
  npm init @vscode/extension permits-extension
  ```
- [x] Configure package.json
  - [x] Add activation event: `"activationEvents": ["onCommand:permits.openSearchUI"]`
  - [x] Add command contribution:
    ```json
    {
      "contributes": {
        "commands": [{
          "command": "permits.openSearchUI",
          "title": "Open Food Permits Search"
        }]
      }
    }
    ```
- [x] Set up TypeScript development
  ```bash
  cd permits-extension
  npm install --save-dev typescript @types/node @types/vscode
  ```
  - [x] Create minimal tsconfig.json for extension.ts → out/extension.js

### 2. Backend Process Management
- [x] Implement extension.ts
  - [x] Create activate(context) function
    - [x] Spawn Python FastAPI backend using child_process.spawn
    - [x] Log stdout/stderr to VS Code console
    - [x] Handle spawn failures with vscode.window.showErrorMessage
  - [x] Register "permits.openSearchUI" command
  - [x] Implement deactivate() to kill backend process

### 3. Webview Project Setup
- [x] Initialize React + TypeScript project
  ```bash
  cd permits-extension
  mkdir webview
  cd webview
  npm init -y
  npm install react react-dom
  npm install --save-dev typescript @types/react @types/react-dom esbuild
  ```
- [x] Configure webview
  - [x] Create tsconfig.json with React JSX support
  - [x] Set up src/index.tsx with root div
  - [x] Create src/App.tsx with component placeholders:
    - [x] SearchBar
    - [x] StatusFilter
    - [x] ListView
    - [x] LoadingSpinner
    - [x] ErrorBanner
  - [x] Add esbuild script to package.json
  - [x] Create static webview/dist/index.html with CSP

### 4. UI Components & Message Passing
- [x] Implement SearchBar.tsx
  - [x] Text input for applicant/street search
  - [x] Status dropdown (ALL/APPROVED/EXPIRED)
  - [x] Search trigger (Enter/button)
- [x] Implement ListView.tsx
  - [x] Scrollable table/list of permits
  - [x] Display: Applicant, Address, Status
- [x] Create LoadingSpinner.tsx and ErrorBanner.tsx
- [x] Implement App.tsx
  - [x] State management (query, status, results, loading, error)
  - [x] Message handling
  - [x] Tab navigation for:
    - [x] Search by Name
    - [x] Search by Address
    - [x] Find Nearby
- [x] Implement extension.ts webview handling
  - [x] Create webview panel
  - [x] Load index.html
  - [x] Handle message routing for:
    - [x] /permits endpoint
    - [x] /permits/address endpoint
    - [x] /permits/nearby endpoint

### 5. Testing & Documentation
- [ ] Test all endpoints
  - [ ] Test /permits with various filters
  - [ ] Test /permits/address with exact and partial matches
  - [ ] Test /permits/nearby with valid and invalid coordinates
- [ ] Test webview UI
  - [ ] Test search functionality
  - [ ] Test status filtering
  - [ ] Test error handling
  - [ ] Test loading states
- [ ] Update documentation
  - [ ] Add API documentation
  - [ ] Add setup instructions
  - [ ] Add usage examples

## Phase 3: Documentation & Polish
- [ ] Create comprehensive README.md
  - [ ] Problem & solution description
  - [ ] Technical decisions rationale
  - [ ] Setup instructions
  - [ ] Usage examples
- [ ] Add API documentation
  - [ ] Document all endpoints
  - [ ] Add example requests/responses
  - [ ] Include error handling
- [ ] Final testing & bug fixes
  - [ ] Cross-platform testing
  - [ ] Performance optimization
  - [ ] Security review
- [ ] Prepare for submission
  - [ ] Code cleanup
  - [ ] Documentation review
  - [ ] Final testing checklist

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
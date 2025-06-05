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
- [ ] Create VS Code extension project
  ```bash
  cd electron-app
  npm init @vscode/extension permits-extension
  ```
- [ ] Configure package.json
  - [ ] Add activation event: `"activationEvents": ["onCommand:permits.openSearchUI"]`
  - [ ] Add command contribution:
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
- [ ] Set up TypeScript development
  ```bash
  cd permits-extension
  npm install --save-dev typescript @types/node @types/vscode
  ```
  - [ ] Create minimal tsconfig.json for extension.ts → out/extension.js

### 2. Backend Process Management
- [ ] Implement extension.ts
  - [ ] Create activate(context) function
    - [ ] Spawn Python FastAPI backend using child_process.spawn
    - [ ] Log stdout/stderr to VS Code console
    - [ ] Handle spawn failures with vscode.window.showErrorMessage
  - [ ] Register "permits.openSearchUI" command
  - [ ] Implement deactivate() to kill backend process

### 3. Webview Project Setup
- [ ] Initialize React + TypeScript project
  ```bash
  cd permits-extension
  mkdir webview
  cd webview
  npm init -y
  npm install react react-dom
  npm install --save-dev typescript @types/react @types/react-dom esbuild
  ```
- [ ] Configure webview
  - [ ] Create tsconfig.json with React JSX support
  - [ ] Set up src/index.tsx with root div
  - [ ] Create src/App.tsx with component placeholders:
    - [ ] SearchBar
    - [ ] StatusFilter
    - [ ] ListView
    - [ ] LoadingSpinner
    - [ ] ErrorBanner
  - [ ] Add esbuild script to package.json
  - [ ] Create static webview/dist/index.html with CSP

### 4. UI Components & Message Passing
- [ ] Implement SearchBar.tsx
  - [ ] Text input for applicant/street search
  - [ ] Status dropdown (ALL/APPROVED/EXPIRED)
  - [ ] Search trigger (Enter/button)
- [ ] Implement ListView.tsx
  - [ ] Scrollable table/list of permits
  - [ ] Display: Applicant, Address, Status
- [ ] Create LoadingSpinner.tsx and ErrorBanner.tsx
- [ ] Implement App.tsx
  - [ ] State management (query, status, results, loading, error)
  - [ ] Message handling
  - [ ] Tab navigation for:
    - [ ] Search by Name
    - [ ] Search by Address
    - [ ] Find Nearby
- [ ] Implement extension.ts webview handling
  - [ ] Create webview panel
  - [ ] Load index.html
  - [ ] Handle message routing for:
    - [ ] /permits endpoint
    - [ ] /permits/address endpoint
    - [ ] /permits/nearby endpoint

### 5. Testing & Verification
- [ ] Set up testing environment
  ```bash
  cd permits-extension
  npm install --save-dev @vscode/test-electron mocha
  ```
- [ ] Write Mocha tests (test/suite/extension.test.ts)
  - [ ] Test activation
  - [ ] Test backend spawning
  - [ ] Test message routing
- [ ] Manual testing checklist
  - [ ] Backend process launches
  - [ ] Command appears in palette
  - [ ] Search by Name works
  - [ ] Search by Address works
  - [ ] Find Nearby works
  - [ ] Error handling works

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
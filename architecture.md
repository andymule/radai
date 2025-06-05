# Food Facilities Search - VS Code Extension Architecture

## Overview
This project implements a VS Code extension for searching and viewing Mobile Food Facility Permits in San Francisco. The extension provides a rich UI for searching permits by name, address, and location, with real-time filtering capabilities.

## System Architecture

### 1. Backend (FastAPI + SQLite)
- **Data Storage**
  - SQLite database with permits table
  - Schema matches Mobile_Food_Facility_Permits.csv structure
  - Indexes on frequently searched fields (applicant, status, address)

- **API Endpoints**
  - GET /permits
    - Query parameters: applicant, status
    - Returns filtered list of permits
  - GET /permits/address
    - Query parameter: street
    - Returns permits matching partial street name
  - GET /permits/nearby
    - Query parameters: lat, lon, status, limit
    - Returns nearest permits with optional status filter

### 2. VS Code Extension
- **Extension Structure**
  ```
  permits-extension/
  ├── src/
  │   ├── extension.ts        # Extension entry point
  │   └── webview/            # React webview application
  │       ├── src/
  │       │   ├── components/ # React components
  │       │   └── App.tsx     # Main application
  │       └── dist/           # Built webview assets
  └── package.json
  ```

- **Extension Features**
  - Command: "Open Food Permits Search"
  - Webview panel with React UI
  - Backend process management
  - Message passing between extension and webview

### 3. Webview Application (React + TypeScript)
- **Components**
  - SearchBar: Text input and status filter
  - ListView: Scrollable permit list
  - LoadingSpinner: Loading state indicator
  - ErrorBanner: Error message display

- **Features**
  - Search by applicant name
  - Search by partial street address
  - Find nearby permits
  - Status filtering
  - Real-time updates

## Data Flow
1. User activates extension via command palette
2. Extension spawns FastAPI backend process
3. Webview panel opens with React UI
4. User interactions trigger API calls:
   - Search queries → /permits endpoint
   - Address searches → /permits/address endpoint
   - Location searches → /permits/nearby endpoint
5. Results displayed in ListView component

## Documentation Requirements

### README Contents
1. **Problem & Solution**
   - Description of the Mobile Food Facility Permit search challenge
   - Overview of the VS Code extension solution
   - Key features and capabilities

2. **Technical Decisions**
   - Rationale for VS Code extension approach
   - React + TypeScript for webview UI
   - FastAPI + SQLite for backend
   - Testing strategy and tools

3. **Critique & Trade-offs**
   - Time constraints and prioritization
   - Technical trade-offs made
   - Features left for future implementation
   - Scaling considerations

4. **Setup Instructions**
   - Extension installation
   - Backend setup
   - Development environment
   - Testing procedures

## Technical Decisions Rationale

### Why VS Code Extension?
1. **IDE Integration**
   - Native development environment
   - Familiar interface for developers
   - Seamless process management

2. **Webview Technology**
   - Modern web technologies (React, TypeScript)
   - Rich UI capabilities
   - Secure execution environment

3. **Backend Management**
   - Clean process lifecycle
   - Automatic startup/shutdown
   - Error handling and recovery

### Why React + TypeScript?
1. **Type Safety**
   - Catch errors at compile time
   - Better IDE support
   - Improved maintainability

2. **Component Architecture**
   - Reusable UI components
   - Clear separation of concerns
   - Easy testing and maintenance

### Why FastAPI + SQLite?
1. **Performance**
   - Async request handling
   - Efficient data access
   - Minimal resource usage

2. **Simplicity**
   - No external database required
   - Easy deployment
   - Built-in API documentation

3. **Scalability Considerations**
   - Current: In-memory SQLite for development
   - Future: Persistent SQLite or migration to PostgreSQL
   - Potential: Add caching layer for frequent queries

## Security Considerations
1. Content Security Policy for webview
2. Input validation on API endpoints
3. Error handling and user feedback
4. Safe process management

## Testing Strategy
1. **Backend Tests**
   - Unit tests for database operations
   - API endpoint integration tests
   - Data loading validation

2. **Extension Tests**
   - Activation and deactivation
   - Backend process management
   - Message passing

3. **Webview Tests**
   - Component rendering
   - User interactions
   - State management

## Future Improvements
1. Add permit details view
2. Implement permit status updates
3. Add map visualization
4. Support multiple data sources
5. Add user preferences
6. Implement caching for performance
7. Add export functionality
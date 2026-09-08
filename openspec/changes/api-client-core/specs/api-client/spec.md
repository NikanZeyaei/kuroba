## Purpose

Provides a type-safe, standards-compliant client for interacting with the read-only 4chan JSON API across both Node.js and browser environments.

## ADDED Requirements

### Requirement: Universal HTTP Client Configuration
The API client SHALL support instantiation with configuration options for base URL, default headers, custom fetch implementation, and request timeout. If no custom base URL is supplied, it SHALL default to `https://a.4cdn.org`.

#### Scenario: Default client initialization
- **WHEN** the client is created without options
- **THEN** it targets `https://a.4cdn.org` as the base API endpoint using standard Web fetch

#### Scenario: Custom base URL and fetch injection
- **WHEN** the client is created with a custom base URL and a mock or custom fetch function
- **THEN** all subsequent requests dispatch through the provided fetch implementation targeting the custom base URL

#### Scenario: Request timeout abort
- **WHEN** a request exceeds the configured timeout duration
- **THEN** the request is aborted and an abort error is raised

### Requirement: Conditional Request Caching Support
The client SHALL support sending the `If-Modified-Since` HTTP header on requests as specified by 4chan API rules.

#### Scenario: If-Modified-Since header provided as Date
- **WHEN** a request is initiated with an `ifModifiedSince` Date object
- **THEN** the client sends an `If-Modified-Since` HTTP header with the date formatted in UTC HTTP-date format

#### Scenario: Handling 304 Not Modified response
- **WHEN** the API returns HTTP 304 Not Modified
- **THEN** the client signals that the requested resource has not changed without throwing an unhandled parsing error

### Requirement: Structured Error Classification
The client SHALL classify API request failures into explicit, domain-specific error representations detailing HTTP status code, status text, and response headers.

#### Scenario: HTTP 4xx and 5xx responses
- **WHEN** the server responds with a non-success HTTP status code (such as 404 Not Found or 500 Internal Server Error)
- **THEN** the client raises a structured HTTP error containing the status code, status text, and request URL

#### Scenario: Rate limiting detection
- **WHEN** the server responds with HTTP 429 Too Many Requests
- **THEN** the client raises a specialized rate limit error indicating that requests exceeded the permitted threshold

#### Scenario: Invalid JSON response payload
- **WHEN** the server returns a 200 OK status but the body is not valid JSON
- **THEN** the client raises a parse error preserving the raw response text and underlying error

### Requirement: Retrieve Board Index List
The client SHALL provide a method to retrieve the complete list of 4chan boards and their attributes from `/boards.json`.

#### Scenario: Successful retrieval of boards list
- **WHEN** the client requests the boards list
- **THEN** it sends a GET request to `https://a.4cdn.org/boards.json` and returns the parsed list of boards with title, worksafe status, per-page limits, cooldowns, and board flags

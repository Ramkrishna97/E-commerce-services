# Phase 2 — Infrastructure and authentication

Start the local infrastructure in dependency order: `discovery-server` (8761), `config-server` (8888), `user-service` (8081), then `api-gateway` (8080). Each application optionally imports configuration from Config Server, allowing a developer to run an individual service before the server exists.

`user-service` owns registration, credentials, access/refresh token issuance and the authenticated `/api/v1/users/me` profile query. Passwords are BCrypt hashes; access and refresh tokens carry different `token_type` claims, which prevents a refresh token from authorizing an API call.

The gateway permits only authentication endpoints, health probes, CORS preflight, and read-only catalog/category traffic without a bearer token. It validates all other requests and forwards identity headers for routing context. Each downstream service must independently authorize the JWT, as User Service does, rather than trusting forwarded headers.

Set `JWT_SECRET` and database credentials through deployment environment configuration before production; the local properties are development-only defaults. The JWT signing secret must be at least 256 bits for HS256.

# Nexa Commerce Platform

Nexa Commerce is a Java 17 / Spring Boot microservices e-commerce platform with a React TypeScript storefront. It is structured around independently deployable services, Spring Cloud infrastructure, JWT authentication, and service-owned data.

## Included modules

| Module | Local port | Responsibility |
| --- | ---: | --- |
| `discovery-server` | 8761 | Eureka service discovery |
| `config-server` | 8888 | Centralized native configuration |
| `user-service` | 8081 | Registration, login, JWT access/refresh tokens, profile access |
| `api-gateway` | 8080 | Routing, JWT validation, CORS, public-route policy |
| `e-commerce-web` | 5173 | React/Vite storefront interface |

The planned catalog, inventory, cart, order, payment, and review services are documented in [Phase 1 architecture](docs/architecture/phase-1-architecture.md).

## Prerequisites

- Java 17 or later
- Node.js 20 or later
- MySQL 8 running locally, with the `user_db` schema initialized from [01-user-db.sql](database/ddl/01-user-db.sql)

The development defaults expect MySQL at `localhost:3306` with user `root` and password `password`. Override these values and `JWT_SECRET` through environment-specific configuration before any non-local deployment.

## Start locally

On Windows, double-click [start-ecommerce.bat](start-ecommerce.bat), or run it from `cmd`. It starts each currently implemented Spring service in a separate terminal, installs UI packages when needed, starts Vite, and opens the storefront at `http://localhost:5173`.

To start components manually:

```powershell
.\gradlew.bat :discovery-server:bootRun
.\gradlew.bat :config-server:bootRun
.\gradlew.bat :user-service:bootRun
.\gradlew.bat :api-gateway:bootRun
cd e-commerce-web
npm.cmd install
npm.cmd run dev
```

## Authentication API

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/api/v1/auth/register` | Create a customer or seller account |
| `POST` | `/api/v1/auth/login` | Receive access and refresh tokens |
| `POST` | `/api/v1/auth/refresh` | Exchange a refresh token for a token pair |
| `GET` | `/api/v1/users/me` | Retrieve the authenticated user |

All APIs are exposed through the gateway at `http://localhost:8080`. The React UI calls the same gateway and stores the access token after successful sign-in.

## Validation

```powershell
.\gradlew.bat :user-service:compileJava :api-gateway:compileJava --no-daemon
cd e-commerce-web
npm.cmd run build
```

Database DDL and architecture material live in [database/ddl/](database/ddl/) and [docs/architecture/](docs/architecture/).

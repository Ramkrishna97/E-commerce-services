# Nexa Commerce Platform

Nexa Commerce is a Java 17 / Spring Boot e-commerce starter with a React TypeScript storefront. The current local setup runs the implemented user API and gateway with an embedded H2 database.

## Included modules

| Module | Local port | Responsibility |
| --- | ---: | --- |
| `user-service` | 8081 | Registration, login, JWT access/refresh tokens, profile access |
| `api-gateway` | 8080 | Routing, JWT validation, CORS, public-route policy |
| `e-commerce-web` | 5173 | React/Vite storefront interface |

The repository also contains discovery and config server modules for the planned microservices architecture. They are not needed for the current storefront. The planned catalog, inventory, cart, order, payment, and review services are documented in [Phase 1 architecture](docs/architecture/phase-1-architecture.md).

## Prerequisites

- Java 17 or later
- Node.js 20 or later

No Docker, MySQL, Redis, Eureka, or config server is required for local development. H2 stores user data in `user-service/data/` across restarts; this generated folder is ignored by Git. Set `JWT_SECRET` for any non-local deployment.

## Start locally

On Windows, double-click [start-ecommerce.bat](start-ecommerce.bat), or run it from `cmd`. It starts the user service, gateway, and UI in separate terminals, installs UI packages when needed, and opens the storefront at `http://localhost:5173`. To stop them, run [stop-ecommerce.bat](stop-ecommerce.bat).

To start components manually:

```powershell
.\gradlew.bat :user-service:bootRun
.\gradlew.bat :api-gateway:bootRun
cd e-commerce-web
npm.cmd install
npm.cmd run dev
```

For an existing MySQL database, start the user service with `SPRING_PROFILES_ACTIVE=mysql`. Set `MYSQL_URL`, `MYSQL_USER`, and `MYSQL_PASSWORD` as needed. The default URL is `jdbc:mysql://localhost:3306/user_db?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true`. This profile uses the existing MySQL driver and schema; the H2 data is separate and is not migrated automatically.

## Authentication API

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/api/v1/auth/register` | Create a customer or seller account |
| `POST` | `/api/v1/auth/login` | Receive access and refresh tokens |
| `POST` | `/api/v1/auth/refresh` | Exchange a refresh token for a token pair |
| `GET` | `/api/v1/users/me` | Retrieve the authenticated user |

All APIs are exposed through the gateway at `http://localhost:8080`. The React UI calls the same gateway and stores the access token after successful sign-in.

The storefront bag stores its items in the browser on this device. The 12 sample products cover Living, Wear, Tech, and Travel, with category filters. Checkout requires sign-in and saves an order through `POST /api/v1/orders`; `GET /api/v1/orders/{id}` returns an order for its owner. The backend calculates prices from the shared sample catalog and stores orders in the same H2 database as user accounts. Repeating a checkout ID returns the same order. Delivery details are saved to the account after checkout and reused on later orders. `GET /api/v1/orders/checkout-details` returns saved details, including details from orders placed before this feature was added. Customers can edit the address during checkout.

This is a demo checkout with cash on delivery selected. There is no inventory reservation, delivery scheduling, or payment collection. Orders are records only and do not initiate fulfillment. The planned separate catalog, cart, order, and payment services remain future work.

## Validation

```powershell
.\gradlew.bat :user-service:compileJava :api-gateway:compileJava --no-daemon
cd e-commerce-web
npm.cmd run build
```

Database DDL and architecture material live in [database/ddl/](database/ddl/) and [docs/architecture/](docs/architecture/).

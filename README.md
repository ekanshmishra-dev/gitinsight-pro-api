# GitInsight Pro API ⚡

A high-performance, production-ready REST API backend service built with Node.js, Express.js, and MySQL. It retrieves, parses, and performs deep analytical analysis on public GitHub profiles—extracting user metrics, ranking developers based on a customized scoring algorithm, caching results inside MySQL, and serving clean, documented endpoints.

It is structured using professional MVC/Clean Architecture, secure headers, strict input validation, logging, and comprehensive Swagger documentation.


## 🚀 Core Features

* **Advanced GitHub Data Engine**: Integrates with the GitHub Public API to concurrently fetch profile data and repo metrics.
* **Algorithmic Developer Scoring**: Automatically computes a custom developer rating incorporating repository volume, social reach, and project impact.
* **Smart Caching Layer**: Checks MySQL before contacting the GitHub API to preserve rate limits, with an option to bypass caching using `?force=true`.
* **Complete CRUD Capabilities**: Fully operational profile management (analyze, list, retrieve, ranks, and delete profiles).
* **Robust Security Stack**: Implements **Helmet** for secure headers, custom **CORS** configurations, and dynamic **Rate Limiters** to prevent brute force abuse.
* **Clean & Modular MVC Architecture**: Organized directory structure with strict separation of routes, controllers, middleware, and business services.
* **OpenAPI 3.0 (Swagger) Playground**: Live interactive API specifications served right on the application.
* **Unified API Responses & Custom Errors**: Uniform JSON formats for all responses accompanied by distinct Client & Server custom error wrappers.
* **Auto-Schema Database Setup**: Automatically initializes the database and creates the required schema on startup!
* **Docker & Docker Compose**: Bootstrapped containerization enabling local spin-ups of the App and MySQL with unified health checking.


## 🛠️ Technology Stack

* **Runtime**: Node.js (v20+)
* **Framework**: Express.js
* **Database**: MySQL 8.0
* **Client**: Axios (Promise-based HTTP)
* **API Documentation**: Swagger UI Express, Swagger JSDoc
* **Security & Loggers**: Helmet, CORS, Express Rate Limit, Morgan, Dotenv
* **Environment Tooling**: Docker, Docker Compose


## 📁 Directory Structure

```text
GitInsight Pro API/
 ├── src/
 │    ├── config/
 │    │    └── db.js               # MySQL Connection Pool & Auto-Migration Setup
 │    ├── controllers/
 │    │    └── githubController.js # API Route Route Handlers
 │    ├── routes/
 │    │    └── githubRoutes.js     # Unified REST Endpoints
 │    ├── services/
 │    │    ├── githubService.js    # Communicates with GitHub API & score calculations
 │    │    └── dbService.js        # Handles MySQL queries (CRUD)
 │    ├── utils/
 │    │    ├── response.js         # Standard API Response Helper
 │    │    └── errors.js           # Custom operational error classes
 │    ├── middlewares/
 │    │    ├── errorHandler.js     # Global Exception & Error Handler
 │    │    ├── rateLimiter.js      # Endpoint security limits
 │    │    └── validator.js        # Parameter & Query verification
 │    ├── models/
 │    │    └── githubProfile.js    # Data modeling constraints
 │    ├── docs/
 │    │    └── swagger.js          # Swagger docs configuration
 │    ├── app.js                  # Global application middleware & initializations
 │    └── server.js               # Server boots, connections & listeners
 ├── .env                         # Local environment configuration
 ├── .env.example                 # Example template for environment config
 ├── Dockerfile                   # Node app multi-stage docker setup
 ├── docker-compose.yml           # Local Compose workflow (App + MySQL)
 ├── schema.sql                   # SQL backup schema
 ├── package.json                 # Project properties and dependency scripts
 └── README.md                    # In-depth professional documentation
```

---

## 🧮 Developer Score Algorithm

The profile ranking is calculated dynamically using a tailored formula reflecting developer impact:

$$\text{Developer Score} = (\text{Public Repositories} \times 2) + (\text{Followers} \times 3) + (\text{Total Stars} \times 5)$$

### Score Variables:
* **Public Repositories**: Total number of user-owned public repositories.
* **Followers**: Number of GitHub accounts following the developer.
* **Total Stars**: Cumulative stargazers count across the user's top public repositories (up to 100).
* **Top Languages**: Extracted and compiled from the top 3 programming languages declared in repositories.

---

## 📦 Installation & Setup

### Option 1: Quick Spin using Docker Compose (Recommended)

Requires [Docker Desktop](https://www.docker.com/products/docker-desktop/) to be installed.

1. Clone or extract this directory.
2. In your terminal, run:
   ```bash
   docker-compose up --build
   ```
3. Docker will download MySQL, build the Express App, set up connections, run health checks, and expose the API!
4. Access the API Docs at: **`http://localhost:5000/api-docs`**

---

### Option 2: Local Manual Installation

Ensure you have **Node.js (v18+)** and a **MySQL Database** running locally.

1. Navigate to the project folder:
   ```bash
   cd "GitInsight Pro API"
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Setup environment variables:
   * Copy `.env.example` to `.env`
   * Update the credentials (`DB_USER`, `DB_PASSWORD`, `DB_NAME`, etc.) to match your local MySQL configuration.
   * *Highly Recommended*: Add a GitHub personal token (`GITHUB_TOKEN`) in your `.env` to prevent GitHub's 60-request-per-hour public limit.
4. Launch the application:
   * **Development Mode (with auto-reload)**:
     ```bash
     npm run dev
     ```
   * **Production Mode**:
     ```bash
     npm start
     ```
5. The application will auto-create the database `github_analyzer` and the table `github_profiles` on initial startup!

---

## 📡 API Endpoints & Specifications

All API endpoints returns consistent, standardized JSON payloads.

| Method | Endpoint | Description | Rate Limit |
|:---|:---|:---|:---|
| **POST** | `/api/github/analyze/:username` | Analyzes, scores, caches and saves user details. | 10 reqs / min |
| **GET** | `/api/github/profiles` | Lists all analyzed profiles. Supports page/limit & search filters. | 100 reqs / 15 mins |
| **GET** | `/api/github/profile/:username` | Retrieves a cached profile from DB without API call. | 100 reqs / 15 mins |
| **DELETE** | `/api/github/profile/:username` | Deletes the profile record from MySQL cache. | 100 reqs / 15 mins |
| **GET** | `/api/github/top-developers` | Leaderboard of users sorted by score descending. | 100 reqs / 15 mins |
| **GET** | `/health` | Technical check for DB connection & API status. | None |

### ⚡ Example Dynamic Search & Pagination:
```http
GET /api/github/profiles?page=1&limit=5&search=javascript
```

### 🔁 Force Profile Refreshes:
By default, `POST` uses MySQL cache. Pass `?force=true` to query GitHub API again and update the database:
```http
POST /api/github/analyze/torvalds?force=true
```

---

## 📖 Swagger API Playgrounds

The project exposes a complete interactive Swagger UI. Once the app is running, navigate to:

👉 **`http://localhost:5000/api-docs`**

Here, you can inspect schemas, parameters, and execute API calls directly from the browser!

---

## 🏆 Future Scaling Enhancements

To scale GitInsight Pro API to serve millions of operations, the following can be added:
1. **Redis Caching**: Offload database lookups to an in-memory Redis cache with an automated TTL expiry.
2. **Webhooks Integration**: Listen to GitHub Organization Webhooks to auto-update scores when repositories are modified.
3. **Automated Testing Suite**: Integrate Jest/Supertest to establish solid CI/CD pipelines.
>>>>>>> 2f52baf (Initial commit)
 

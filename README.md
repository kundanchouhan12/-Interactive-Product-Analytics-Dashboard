# -Interactive-Product-Analytics-Dashboard
README.md
Product Analytics Dashboard
Live Demo

Live Demo URL

(Replace this with your actual deployed frontend URL)

Project Overview

This is an Interactive Product Analytics Dashboard built with React (frontend) and Spring Boot + PostgreSQL (backend).
The dashboard allows product managers to:

Track feature usage through interactive charts.

Apply filters by date, age, and gender.

Visualize time-based trends of feature usage.

Automatically track user interactions (clicks on filters, charts, etc.) and update the dashboard accordingly.

The project demonstrates full-stack development, including authentication, backend API, database persistence, and responsive frontend charts.

Tech Stack

Frontend:

React.js

Material-UI

Recharts (charts)

Day.js & MUI Date Pickers

js-cookie (for storing filter preferences)

Backend:

Spring Boot

PostgreSQL

Hibernate / JPA

JWT Authentication

Local Setup Instructions
Backend

Clone the repository:

git clone https://github.com/yourusername/product-analytics-dashboard.git
cd product-analytics-dashboard/backend


Configure PostgreSQL in application.properties:

spring.datasource.url=jdbc:postgresql://localhost:5432/analytics_db
spring.datasource.username=your_db_username
spring.datasource.password=your_db_password
spring.jpa.hibernate.ddl-auto=update


Run the backend:

./mvnw spring-boot:run


Backend runs at: http://localhost:8080

Frontend

Open a new terminal:

cd ../frontend
npm install
npm start


Frontend runs at: http://localhost:5173

Login using seeded users or create new ones via /register.

Architectural Choices

Backend API Design:

/register & /login → JWT Authentication.

/track → Logs feature click interactions.

/analytics → Aggregates feature click data by date, age, gender.

Database Design:

User table stores user info (username, password, age, gender).

FeatureClick table stores clicks per feature with timestamp and user reference.

Frontend Design:

React + Material UI for responsive UI.

Charts built using Recharts; filters and date pickers update queries.

Cookies store last selected filters for persistence.

Data Flow:

User interacts → frontend fires POST /track → backend stores click → dashboard reflects updated analytics on refresh.

Seed Instructions (Dummy Data)

The project includes a seed script to populate the database with dummy users and clicks for demonstration:

Backend Seed (Spring Boot CommandLineRunner):

mvn spring-boot:run


Seed automatically inserts:

10 users with varied ages and genders

50–100 feature click events across different dates

This ensures charts are populated initially.

Custom Seeding:

You can modify SeedData.java to add more features, users, or dates.

Short Essay: Scaling for 1 Million Write-Events/Minute

To handle 1 million write-events per minute, the backend architecture needs to be highly scalable and resilient:

Asynchronous Event Tracking:

Instead of writing directly to the database on every click, send events to a message queue like Kafka or RabbitMQ.

Batch Writes:

Consumer services process queued events in batches to reduce DB write load.

Horizontal Scaling:

Multiple backend instances behind a load balancer.

Database sharding or partitioning to distribute load.

NoSQL / Time-Series DB:

For very high throughput analytics, consider Cassandra, DynamoDB, or TimescaleDB for feature click logs.

Caching:

Precompute aggregated data and store in Redis to serve analytics without hitting DB on every request.

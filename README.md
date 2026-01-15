# -Interactive-Product-Analytics-Dashboard
README.md
# Interactive Product Analytics Dashboard

## Live Demo
[View Live Demo](https://your-live-demo-url.com)  
*(Replace with your actual deployed frontend URL)*

---

## Project Overview
The **Interactive Product Analytics Dashboard** is a full-stack application built with **React.js** (frontend) and **Spring Boot + PostgreSQL** (backend).  
It allows product managers to:

- Track feature usage with interactive charts.
- Filter analytics by **date**, **age**, and **gender**.
- Visualize **time-based trends** of feature interactions.
- Automatically log **user interactions** (clicks on filters, charts, etc.) and update the dashboard in real-time.

The project demonstrates:

- Full-stack development.
- JWT-based authentication.
- Backend API design.
- Database persistence.
- Responsive frontend visualization.

---

## Tech Stack

### Frontend
- **React.js**  
- **Material-UI** for UI components  
- **Recharts** for interactive charts  
- **Day.js** & **MUI Date Pickers**  
- **js-cookie** for storing filter preferences  

### Backend
- **Spring Boot**  
- **PostgreSQL**  
- **Hibernate / JPA**  
- **JWT Authentication**  

---

## Local Setup Instructions

### Backend
1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/product-analytics-dashboard.git

2. Configure PostgreSQL in application.properties:
   spring.datasource.url=jdbc:postgresql://localhost:5432/analytics_db
   spring.datasource.username=your_db_username
   spring.datasource.password=your_db_password
   spring.jpa.hibernate.ddl-auto=update

3. Run the backend:
   ./mvnw spring-boot:run
Backend runs at: http://localhost:8080

Frontend : 

1. Open a new terminal and navigate to frontend:
   cd ../frontend
   npm install
   npm start

Frontend runs at: http://localhost:5173

2. Login/Register:
   Use seeded users or create new users via /register.

---

## ⚛️ Frontend

- **Responsive UI** built with `React` + `Material-UI`  
- **Charts** built using `Recharts`; filters update queries dynamically  
- **Persistence**: Last selected filters stored in cookies  

---

## 🏗 Architectural Choices

### 🔹 Backend API

- **`/register` & `/login`** → JWT authentication  
- **`/track`** → Logs feature click interactions  
- **`/analytics`** → Aggregates feature click data by **date, age, gender**  

### 🔹 Database

- **User table**: Stores user info (**username, password, age, gender**)  
- **FeatureClick table**: Stores feature click events with **timestamp** and **user reference**  

### 🔹 Frontend

- **Responsive UI** built with `React + Material-UI`  
- **Interactive Charts** with `Recharts`; filters update queries dynamically  
- **Filter Persistence**: Stores last selected filters in cookies  

### 🔹 Data Flow

1. User interacts with the dashboard  
2. Frontend sends **POST `/track`** to backend  
3. Backend stores click in database  
4. Dashboard updates analytics on refresh  

---

## 🌱 Seed Instructions (Dummy Data)

The project includes a seed script to populate the database with **dummy users** and **feature click events** for demonstration.

### 🔹 Backend Seed

Run backend with:
```bash
mvn spring-boot:run


Custom Seeding:
Modify SeedData.java to add more features, users, or dates.

---

## 🚀 Scaling for **1 Million Write-Events/Minute**

To handle **high write throughput**, the backend architecture can be optimized as follows:

- **Asynchronous Event Tracking**: Use message queues like `Kafka` or `RabbitMQ` instead of direct DB writes.

- **Batch Writes**: Process events in batches to reduce DB load.

- **Horizontal Scaling**: Deploy multiple backend instances behind a load balancer.

- **Database Sharding / Partitioning**: Distribute data load efficiently.

- **NoSQL / Time-Series DB**: For very high throughput, consider `Cassandra`, `DynamoDB`, or `TimescaleDB`.

- **Caching**: Precompute aggregated metrics and store in `Redis` to serve analytics faster.

---

## 👤 Author

**Kundan Chouhan**  
- GitHub: [Kundan Chouhan](https://github.com/kundanchouhan12)  
- LinkedIn: [Kundan Singh Chouhan](https://www.linkedin.com/in/kundansinghchouhan/)

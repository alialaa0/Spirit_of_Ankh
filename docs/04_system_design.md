# System Design

## 1. Architecture Overview
The system follows a modern ELT architecture:

Sources → Ingestion → Raw → Transform → Data Mart → Visualization

---

## 2. Architecture Diagram
(Insert diagram here)

![Architecture](../diagrams/architecture.png)

---

## 3. Components

### Data Sources
- Historical dataset
- Streaming simulation
- Weather & holiday APIs

---

### Ingestion
- Batch + streaming

---

### Storage
- Snowflake (Raw Layer)

---

### Transformation
- dbt (staging → marts)

---

### Orchestration
- Apache Airflow

---

### Serving
- Power BI dashboards

---

## 4. Data Flow
1. Collect data
2. Store in Snowflake
3. Transform via dbt
4. Orchestrate via Airflow
5. Serve to dashboards

---

## 5. Data Model (ERD)
(Insert ERD here)

![ERD](../diagrams/erd.png)

---

## 6. Design Principles
- Modularity
- Scalability
- Reusability
- Separation of concerns

---

## 7. Future Improvements
- Real streaming (Kafka / Event Hub)
- Machine Learning layer
- Real-time alerts

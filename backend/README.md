# Backend README

## Social Learning Platform - Spring Boot Backend

### Prerequisites
- Java 21 (LTS)
- Maven 3.8+
- PostgreSQL 15+

### Setup Instructions

1. **Install PostgreSQL** (if not already installed)
   - Download from https://www.postgresql.org/download/
   - Or use Docker: `docker run --name postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres:15`

2. **Create Database**
   ```sql
   CREATE DATABASE sociallearning;
   ```

3. **Configure Database Connection**
   - Edit `src/main/resources/application.yml`
   - Update database credentials if needed

4. **Build the Project**
   ```bash
   mvn clean install
   ```

5. **Run the Application**
   ```bash
   mvn spring-boot:run
   ```

### API Endpoints

- **GraphQL Playground**: http://localhost:8080/graphiql
- **GraphQL API**: http://localhost:8080/graphql
- **Health Check**: http://localhost:8080/actuator/health (add actuator dependency first)

### Project Structure

```
backend/
├── src/main/java/com/sociallearning/
│   ├── SocialLearningApplication.java  # Main application class
│   ├── entity/                         # JPA entities
│   ├── repository/                     # Spring Data repositories
│   ├── service/                        # Business logic
│   ├── graphql/                        # GraphQL resolvers
│   ├── security/                       # Security configuration
│   └── config/                         # Configuration classes
└── src/main/resources/
    ├── application.yml                 # Application configuration
    └── graphql/                        # GraphQL schema files
```

### Current Status

✅ **Completed Tasks:**
- Task 0.1: Spring Boot project initialized
- Task 0.2: PostgreSQL database configuration ready
- Task 0.3: Package structure created
- Task 1.1: User entity implemented with full validation

### Next Steps

- Task 1.2: Create UserRepository
- Task 1.3: Implement JWT Token Service
- Task 1.4: Configure Spring Security
- Task 1.5: Create Authentication GraphQL Resolvers

### Database Configuration

Default connection settings (change in production):
```yaml
Database: sociallearning
Host: localhost
Port: 5432
Username: postgres
Password: postgres
```

### Testing

Run tests with:
```bash
mvn test
```

### Notes

- The User entity includes relationships that will be implemented in later phases
- PlaceholderEntities.java contains stub classes for relationships
- JPA auditing is enabled for automatic timestamp management
- All validation annotations are in place for data integrity

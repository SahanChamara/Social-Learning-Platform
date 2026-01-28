# Backend Setup Guide

## Task 1.1: User Entity - COMPLETED ✅

The User entity has been successfully created with all required fields and validation!

---

## What Was Implemented

### Files Created:

1. **[pom.xml](pom.xml)** - Maven project configuration
   - Spring Boot 3.2.2
   - Java 21 configuration
   - All required dependencies (Spring GraphQL, JPA, PostgreSQL, Security, JWT, Lombok)

2. **[src/main/resources/application.yml](src/main/resources/application.yml)** - Application configuration
   - PostgreSQL database connection
   - JPA/Hibernate settings
   - GraphQL configuration
   - JWT secret configuration

3. **[src/main/java/com/sociallearning/SocialLearningApplication.java](src/main/java/com/sociallearning/SocialLearningApplication.java)** - Main application class
   - Spring Boot application entry point
   - JPA Auditing enabled

4. **[src/main/java/com/sociallearning/entity/User.java](src/main/java/com/sociallearning/entity/User.java)** - User JPA Entity ⭐
   - Complete user model with all fields from database schema
   - Validation annotations (@NotBlank, @Email, @Size)
   - Database indexes for performance
   - JPA auditing for timestamps
   - User roles enum (LEARNER, CREATOR, ADMIN)
   - Relationships prepared for later phases
   - Lombok annotations for clean code

5. **[README.md](README.md)** - Backend documentation

---

## User Entity Features

### Fields Implemented:
✅ **Identity**: id, username, email, passwordHash  
✅ **Profile**: fullName, bio, avatarUrl  
✅ **Role Management**: role (LEARNER/CREATOR/ADMIN)  
✅ **Professional Info**: expertise, websiteUrl, githubUrl, linkedinUrl, twitterUrl  
✅ **Status**: isVerified, isActive, lastLoginAt  
✅ **Timestamps**: createdAt, updatedAt (auto-managed)  

### Validation Rules:
- Username: 3-50 characters, unique, required
- Email: Valid email format, unique, required
- Password: Required (hashed)
- Full name: Max 100 characters, required
- All URLs: Max 500 characters
- Default role: LEARNER
- Default status: Active, unverified

### Relationships (Prepared):
- One-to-Many: createdCourses, enrollments, comments, likes, ratings, bookmarks
- Many-to-Many: followers, following
- One-to-Many: achievements, notifications

### Database Indexes:
- idx_users_email
- idx_users_username  
- idx_users_role
- idx_users_created_at

---

## Next Steps - Prerequisites

### 1. Install Maven (Build Tool)

**Windows:**
```powershell
# Option 1: Using Chocolatey
choco install maven

# Option 2: Manual Installation
# 1. Download from: https://maven.apache.org/download.cgi
# 2. Extract to C:\Program Files\Apache\maven
# 3. Add to PATH: C:\Program Files\Apache\maven\bin
# 4. Verify: mvn -version
```

**Verify Installation:**
```bash
mvn -version
```

### 2. Install PostgreSQL 15+

**Windows:**
```powershell
# Option 1: Using Chocolatey
choco install postgresql15

# Option 2: Download Installer
# https://www.postgresql.org/download/windows/

# Option 3: Using Docker
docker run --name postgres-sociallearning -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres:15
```

### 3. Create Database

```sql
-- Connect to PostgreSQL
psql -U postgres

-- Create database
CREATE DATABASE sociallearning;

-- Verify
\l
```

---

## Running the Backend

### 1. Build the Project
```bash
cd backend
mvn clean install
```

### 2. Run the Application
```bash
mvn spring-boot:run
```

### 3. Verify

Application will start on: **http://localhost:8080**

Endpoints:
- GraphQL Playground: http://localhost:8080/graphiql
- GraphQL API: http://localhost:8080/graphql

### 4. Check Database

After running, the `users` table should be auto-created by Hibernate (ddl-auto: update).

```sql
-- Connect to database
psql -U postgres -d sociallearning

-- Verify table
\dt

-- Check table structure
\d users
```

---

## Project Structure

```
backend/
├── pom.xml                           # Maven configuration
├── README.md                         # This file
└── src/
    └── main/
        ├── java/com/sociallearning/
        │   ├── SocialLearningApplication.java
        │   └── entity/
        │       ├── User.java         # ✅ COMPLETED
        │       └── PlaceholderEntities.java
        └── resources/
            └── application.yml       # Database & app config
```

---

## Current Status

### ✅ Completed Tasks:
- **Task 0.1**: Spring Boot project initialized with Maven
- **Task 0.2**: PostgreSQL configuration ready
- **Task 0.3**: Package structure created
- **Task 1.1**: User entity implemented with full validation ⭐

### 📋 Next Tasks (Phase 1):
- **Task 1.2**: Create UserRepository interface
- **Task 1.3**: Implement JWT Token Service
- **Task 1.4**: Configure Spring Security
- **Task 1.5**: Create Authentication GraphQL Resolvers

---

## Learning Points

### JPA Entity Annotations:
- `@Entity` - Marks class as JPA entity
- `@Table` - Defines table name and indexes
- `@Id` - Primary key
- `@GeneratedValue` - Auto-increment strategy
- `@Column` - Column configuration
- `@Enumerated` - Enum type mapping
- `@OneToMany` / `@ManyToOne` - Relationships

### Validation Annotations:
- `@NotBlank` - Required string, not empty
- `@Email` - Valid email format
- `@Size` - String length constraints

### Lombok Annotations:
- `@Getter` / `@Setter` - Auto-generate getters/setters
- `@NoArgsConstructor` / `@AllArgsConstructor` - Constructors
- `@Builder` - Builder pattern
- `@ToString` - toString() method
- `@EqualsAndHashCode` - equals() and hashCode()

### Spring Data JPA Auditing:
- `@CreatedDate` - Auto-set on creation
- `@LastModifiedDate` - Auto-update on modification
- `@EntityListeners(AuditingEntityListener.class)` - Enable auditing

---

## Troubleshooting

### Java Version Mismatch
Current system: Java 23  
Project configured for: Java 21

Either:
1. Update pom.xml to use Java 23
2. Install Java 21 LTS for better compatibility

### Database Connection Issues
- Verify PostgreSQL is running: `pg_isready`
- Check credentials in application.yml
- Test connection: `psql -U postgres -d sociallearning`

### Maven Not Found
Install Maven first (see Prerequisites section)

---

## What's Next?

Once Maven and PostgreSQL are installed:

1. **Run the application**: `mvn spring-boot:run`
2. **Verify User table** is created in database
3. **Proceed to Task 1.2**: Create UserRepository

Ready to continue? Let me know when Maven/PostgreSQL are installed!

# 🎓 Social Learning Platform

A collaborative platform where educators, students, and professionals share knowledge through courses, tutorials, and study materials. Users can create content, engage with others' materials, track their learning progress, and discover new topics based on their interests.

**Think**: Udemy (course structure) + Medium (content sharing) + Reddit (community engagement)

---

## 🌟 Key Features

### For Learners
- 📚 Browse and enroll in courses with structured learning paths
- 📊 Track progress with completion percentages and learning streaks
- 💬 Engage through comments, ratings, and discussions
- 🏆 Earn achievements and badges for milestones
- 🔖 Bookmark content for later reference
- 🔍 Discover personalized recommendations
- 📱 Clean, accessible UI with dark mode support

### For Creators
- ✍️ Create courses with modules and lessons
- 📝 Publish tutorials and study materials
- 📈 View analytics (enrollments, completions, engagement)
- 💡 Respond to learner questions
- 👥 Build a following and community

### Platform Features
- 🔐 Secure authentication with JWT
- ⚡ Real-time updates for comments and notifications
- 🎨 Beautiful UI with Radix UI and Tailwind CSS
- 🚀 GraphQL API for efficient data fetching
- 📱 Responsive design for all devices
- ♿ Accessibility-first with WCAG compliance

---

## 🛠️ Technology Stack

### Backend
- **Framework**: Spring Boot 3.2+ (Java 21)
- **API**: GraphQL (Spring for GraphQL)
- **Database**: PostgreSQL 15+
- **ORM**: Spring Data JPA
- **Security**: Spring Security + JWT
- **Build Tool**: Maven

### Frontend
- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite 7+
- **GraphQL Client**: Apollo Client 3.11+
- **UI Components**: Radix UI (unstyled primitives)
- **Styling**: Tailwind CSS 4+
- **Routing**: React Router v6
- **Forms**: React Hook Form + Zod
- **Icons**: Lucide React

### Database
- **Primary**: PostgreSQL 15+
- **Features**: Full-text search, JSONB, triggers, indexes

---

## 📁 Project Structure

```
Social Learning Platform/
├── .agent/                      # 📚 Comprehensive documentation
│   ├── database/
│   │   └── schema.md           # Complete database schema
│   ├── graphql/
│   │   └── schema.graphql      # GraphQL API definition
│   ├── backend/
│   │   └── architecture.md     # Backend architecture guide
│   ├── frontend/
│   │   └── architecture.md     # Frontend architecture guide
│   ├── learning/
│   │   └── comprehensive-guide.md  # Learning resources
│   ├── implementation-plan.md  # Phase-by-phase roadmap
│   ├── quick-reference.md      # Commands & snippets
│   └── README.md               # Documentation index
│
├── backend/                     # Spring Boot application
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/sociallearning/
│   │   │   │   ├── entity/          # JPA entities
│   │   │   │   ├── repository/      # Data access layer
│   │   │   │   ├── service/         # Business logic
│   │   │   │   ├── graphql/         # GraphQL resolvers
│   │   │   │   ├── security/        # Authentication & authorization
│   │   │   │   └── config/          # Configuration classes
│   │   │   └── resources/
│   │   │       ├── application.yml
│   │   │       └── graphql/schema.graphqls
│   │   └── test/
│   └── pom.xml
│
├── frontend/                    # React application
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/              # Radix UI base components
│   │   │   ├── features/        # Feature-specific components
│   │   │   ├── layout/          # Layout components
│   │   │   └── common/          # Common utilities
│   │   ├── pages/               # Page components (routes)
│   │   ├── graphql/             # GraphQL queries/mutations
│   │   ├── hooks/               # Custom React hooks
│   │   ├── context/             # React Context providers
│   │   ├── types/               # TypeScript types
│   │   ├── utils/               # Utility functions
│   │   └── styles/              # Global styles
│   ├── public/
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
│
└── README.md                    # This file
```

---

## 🚀 Quick Start

### Prerequisites
- Java 21+ (JDK)
- Node.js 18+ and npm
- PostgreSQL 15+
- Maven 3.8+
- Git

### 1. Clone the Repository
```bash
git clone <repository-url>
cd "Social Learning Platform"
```

### 2. Set Up Database
```bash
# Create PostgreSQL database
psql -U postgres
CREATE DATABASE sociallearning;
\q
```

### 3. Configure Backend
```bash
cd backend

# Copy example config
cp src/main/resources/application-example.yml src/main/resources/application.yml

# Update database credentials in application.yml
# Update JWT secret key

# Run backend
./mvnw spring-boot:run
```

Backend will start at: http://localhost:8080
- GraphQL endpoint: http://localhost:8080/graphql
- GraphiQL interface: http://localhost:8080/graphiql

### 4. Set Up Frontend
```bash
cd frontend

# Install dependencies
npm install

# Copy example env
cp .env.example .env.local

# Update API endpoints in .env.local

# Start dev server
npm run dev
```

Frontend will start at: http://localhost:5173

---
---

## 🧪 Testing

### Backend Tests
```bash
cd backend
./mvnw test                    # Run all tests
./mvnw test -Dtest=CourseServiceTest  # Run specific test
```

### Frontend Tests
```bash
cd frontend
npm test                       # Run tests
npm test -- --coverage         # With coverage
```

---

## 🏗️ Build for Production

### Backend
```bash
cd backend
./mvnw clean package
java -jar target/social-learning-platform-0.0.1-SNAPSHOT.jar
```

### Frontend
```bash
cd frontend
npm run build
# Output in dist/ folder
```

---
---

## 🤝 Contributing

This is a learning project. Contributions, issues, and feature requests are welcome!

### Development Workflow
1. Create a feature branch
2. Follow the architecture documented in `.agent/`
3. Write tests for new features
4. Submit a pull request

---

## 🔐 Security

- JWT-based authentication
- Password hashing with BCrypt
- Input validation and sanitization
- SQL injection prevention
- XSS protection
- CORS configuration
- Rate limiting (production)

---

Quick fixes:
```bash
# Backend: Port already in use
netstat -ano | findstr :8080
taskkill /PID <PID> /F

# Frontend: Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Database: Reset database
psql -U postgres
DROP DATABASE sociallearning;
CREATE DATABASE sociallearning;
```

---

## 🙏 Acknowledgments

- Spring Boot team for excellent framework
- GraphQL Foundation for the query language
- Radix UI for accessible primitives
- Tailwind Labs for amazing CSS framework
- Apollo team for GraphQL client
- React team for the UI library

---

## 📬 Contact

For questions or feedback about this project, please open an issue on GitHub.

---

**Happy Learning! 🚀**

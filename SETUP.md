# Setup Instructions for Inspired Benevolence Cybersecurity Platform

## Prerequisites

- Node.js 18+ 
- PostgreSQL 14+
- Git
- Docker (optional, for containerized deployment)

## Option 1: Local Development Setup

### 1. Install Dependencies

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### 2. Set Up PostgreSQL Database

```bash
# Create database
createdb ibc_security

# Or using psql
psql -U postgres
CREATE DATABASE ibc_security;
\q
```

### 3. Configure Environment Variables

```bash
# Backend environment
cp backend/.env.example backend/.env

# Edit backend/.env with your database credentials
# DATABASE_URL=postgresql://postgres:password@localhost:5432/ibc_security
# JWT_SECRET=generate-a-secure-random-string-here
# PORT=3001
# NODE_ENV=development
# CORS_ORIGIN=http://localhost:3000

# Frontend environment
cp frontend/.env.example frontend/.env

# Edit frontend/.env
# VITE_API_URL=http://localhost:3001
```

### 4. Initialize Database

```bash
cd backend
npm run db:migrate
cd ..
```

### 5. Seed Initial Data (Optional)

Create a first admin user by registering through the API or using psql.

### 6. Start Development Servers

```bash
# Start both frontend and backend
npm run dev

# Or start separately:
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

## Option 2: Docker Deployment

### 1. Using Docker Compose

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Stop and remove volumes (WARNING: deletes database)
docker-compose down -v
```

### 2. Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- PostgreSQL: localhost:5432

## Creating the First Admin User

### Using the API

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@inspiredbenevolence.com",
    "password": "SecurePassword123!",
    "firstName": "Admin",
    "lastName": "User",
    "role": "admin"
  }'
```

### Using PostgreSQL directly

```bash
# Hash password first using Node.js
node -e "const bcrypt = require('bcrypt'); bcrypt.hash('YourPassword', 10, (err, hash) => console.log(hash));"

# Then insert into database (replace HASHED_PASSWORD with output from above)
psql -U postgres -d ibc_security -c "INSERT INTO users (id, email, password, \"firstName\", \"lastName\", role, \"isActive\", \"createdAt\", \"updatedAt\") VALUES (gen_random_uuid(), 'admin@inspiredbenevolence.com', 'HASHED_PASSWORD', 'Admin', 'User', 'admin', true, NOW(), NOW());"
```

## Loading Pre-Built Playbooks

```bash
# The pre-built playbooks are in backend/src/data/playbook-templates.json
# Import them using the API or create a seed script
```

## Deployment to Mac Mini

### 1. Clone Repository on Mac Mini

```bash
cd /path/to/deployment
git clone <repository-url>
cd inspired-benevolence-cybersecurity
```

### 2. Install PostgreSQL on Mac Mini

```bash
# Using Homebrew
brew install postgresql@14
brew services start postgresql@14
createdb ibc_security
```

### 3. Configure for Production

```bash
# Update backend/.env for production
NODE_ENV=production
DATABASE_URL=postgresql://postgres:password@localhost:5432/ibc_security
JWT_SECRET=<generate-secure-secret>
PORT=3001
CORS_ORIGIN=http://your-mac-mini-ip:3000

# Build frontend
cd frontend
npm run build
cd ..
```

### 4. Start with PM2 (Process Manager)

```bash
# Install PM2
npm install -g pm2

# Start backend
cd backend
pm2 start npm --name "ibc-backend" -- start

# Serve frontend (using serve package)
npm install -g serve
cd ../frontend
pm2 start serve --name "ibc-frontend" -- -s dist -l 3000

# Save PM2 configuration
pm2 save
pm2 startup
```

### 5. Set Up Reverse Proxy (Optional - using nginx)

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Troubleshooting

### Database Connection Issues

```bash
# Check PostgreSQL is running
pg_isready

# Check database exists
psql -U postgres -l | grep ibc_security

# Test connection
psql postgresql://postgres:password@localhost:5432/ibc_security
```

### Port Already in Use

```bash
# Find process using port
lsof -i :3000
lsof -i :3001

# Kill process if needed
kill -9 <PID>
```

### Permission Issues

```bash
# Ensure proper permissions
chmod -R 755 backend frontend
```

## Maintenance

### Backup Database

```bash
pg_dump -U postgres ibc_security > backup_$(date +%Y%m%d).sql
```

### Restore Database

```bash
psql -U postgres ibc_security < backup_20260224.sql
```

### Update Application

```bash
git pull origin main
npm install
cd backend && npm install && cd ..
cd frontend && npm install && cd ..
npm run build
pm2 restart all
```

## Support

For issues or questions, contact the development team.

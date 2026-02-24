# Quick Start Guide - Inspired Benevolence Cybersecurity

Get your incident response platform running in minutes!

## Prerequisites Checklist

- [ ] Node.js 18+ installed (`node --version`)
- [ ] PostgreSQL 14+ installed (`postgres --version`)
- [ ] Git installed (`git --version`)

## 5-Minute Quick Start

### Step 1: Clone and Install (2 minutes)

```bash
cd /Users/william/inspired-benevolence-cybersecurity
npm install
cd backend && npm install && cd ..
cd frontend && npm install && cd ..
```

### Step 2: Setup Database (1 minute)

```bash
# Create database
createdb ibc_security

# Or using psql
psql -U postgres
CREATE DATABASE ibc_security;
\q
```

### Step 3: Configure Environment (1 minute)

```bash
# Backend configuration
cp backend/.env.example backend/.env

# Edit backend/.env - Update these values:
# DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/ibc_security
# JWT_SECRET=changethis-to-a-secure-random-string-abc123xyz
# PORT=3001
# NODE_ENV=development
# CORS_ORIGIN=http://localhost:3000

# Frontend configuration
cp frontend/.env.example frontend/.env
# Default values should work
```

### Step 4: Start the Application (1 minute)

```bash
# From project root
npm run dev
```

✅ **Done!** Access the application at:
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:3001

## Create Your First Admin User

### Option 1: Using curl

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@yourcompany.com",
    "password": "SecurePassword123!",
    "firstName": "Admin",
    "lastName": "User",
    "role": "admin",
    "department": "Security"
  }'
```

### Option 2: Using the Login Page

1. Go to http://localhost:3000/login
2. Click "Register" (if you add a register link)
3. Fill in the form with admin role

## First Steps After Login

### 1. Explore Pre-Built Playbooks (5 minutes)

Navigate to **Playbooks** → You'll see 5 pre-built templates ready to use:

- 🔒 Ransomware Incident Response
- 📧 Phishing Attack Response  
- 💾 Data Breach Response
- 🌐 DDoS Attack Mitigation
- 👤 Insider Threat Response

Click on any playbook to view the step-by-step workflow!

### 2. Import Template Playbooks (2 minutes)

The pre-built playbook templates are in `backend/src/data/playbook-templates.json`

To import them via API:

```bash
# Example: Import Ransomware playbook
curl -X POST http://localhost:3001/api/playbooks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d @backend/src/data/playbook-templates.json
```

### 3. Create Your First Incident (3 minutes)

1. Navigate to **Incidents** → **Create Incident**
2. Fill in:
   - **Title:** Test Phishing Email Reported
   - **Type:** Phishing
   - **Severity:** Medium
   - **Description:** Employee reported suspicious email
   - **Select Playbook:** Phishing Attack Response
3. Click **Create**

✅ Tasks are automatically generated from the playbook!

### 4. View Dashboard (1 minute)

Navigate to **Dashboard** to see:
- Active incidents count
- Critical alerts
- Resolution metrics
- Incident charts

## Docker Quick Start (Alternative)

Prefer Docker? Even faster setup:

```bash
cd /Users/william/inspired-benevolence-cybersecurity

# Start everything with one command
docker-compose up -d

# View logs
docker-compose logs -f

# Access at http://localhost:3000
```

## Common Issues & Solutions

### Issue: "Port 3000 already in use"

```bash
# Find and kill the process
lsof -i :3000
kill -9 <PID>
```

### Issue: "Database connection failed"

```bash
# Check PostgreSQL is running
pg_isready

# Check database exists
psql -U postgres -l | grep ibc_security

# Recreate if needed
dropdb ibc_security
createdb ibc_security
```

### Issue: "Cannot find module"

```bash
# Reinstall dependencies
rm -rf node_modules backend/node_modules frontend/node_modules
npm install
cd backend && npm install && cd ..
cd frontend && npm install && cd ..
```

## Next Steps

### Customize Your Platform

1. **Add Users:** Create accounts for team members with appropriate roles
2. **Create Custom Playbooks:** Build playbooks specific to your organization
3. **Set Up Alerts:** Configure alert sources and monitoring
4. **Configure Compliance:** Map playbooks to your compliance frameworks

### Deploy to Production

See `SETUP.md` for detailed instructions on:
- Mac Mini deployment
- PM2 process management
- Nginx reverse proxy
- SSL/TLS configuration
- Backup procedures

## Learning Resources

- 📖 **Full Documentation:** See `README.md`
- 🚀 **Setup Guide:** See `SETUP.md`
- ⚡ **Features List:** See `FEATURES.md`
- 🔧 **API Documentation:** Coming soon

## Support

Encountering issues? Check:
1. Database is running: `pg_isready`
2. Environment variables are set correctly
3. All dependencies installed: `npm list`
4. Ports 3000 and 3001 are available

## Development Tips

### Running Backend Only

```bash
cd backend
npm run dev
# API at http://localhost:3001
```

### Running Frontend Only

```bash
cd frontend
npm run dev
# App at http://localhost:3000
```

### Database Migrations

```bash
cd backend
npm run db:migrate
```

### Build for Production

```bash
npm run build
```

### View Logs

```bash
# Backend logs
tail -f backend/logs/combined.log

# Docker logs
docker-compose logs -f backend
docker-compose logs -f frontend
```

## Testing the Platform

### Test User Roles

Create users with different roles to test permissions:

```bash
# Security Analyst
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "analyst@company.com", "password": "Test123!", "firstName": "Security", "lastName": "Analyst", "role": "security_analyst"}'

# IT Director
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "it@company.com", "password": "Test123!", "firstName": "IT", "lastName": "Director", "role": "it_director"}'
```

### Test Incident Workflow

1. Create incident
2. View auto-generated tasks
3. Assign tasks to team members
4. Update task status
5. Add timeline events
6. Close incident with post-mortem

### Test Real-Time Updates

1. Open two browser windows
2. Login as different users
3. Update an incident in one window
4. Watch it update in real-time in the other window

## Ready for Production?

Before deploying to production:

- [ ] Change JWT_SECRET to a secure random string
- [ ] Update database credentials
- [ ] Enable SSL/TLS
- [ ] Set up backups
- [ ] Configure firewall rules
- [ ] Set up monitoring
- [ ] Test disaster recovery

---

**You're all set!** Start managing incidents like a pro! 🛡️

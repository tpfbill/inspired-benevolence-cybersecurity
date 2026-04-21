# Mac Mini Deployment Guide

Complete guide for deploying the Inspired Benevolence Cybersecurity Platform to a Mac mini with npm and automatic startup on reboot.

## Prerequisites

- Mac mini running macOS
- Node.js 18+ installed
- PostgreSQL 14+ installed
- Git installed
- Admin access to create system services

## Installation Steps

### 1. Clone Repository

```bash
cd ~
git clone <your-github-repo-url> ibc-platform
cd ibc-platform
```

### 2. Install Dependencies

```bash
# Install all dependencies
npm install
cd backend && npm install && cd ..
cd frontend && npm install && cd ..
```

### 3. Setup PostgreSQL Database

```bash
# Create database
createdb ibc_security

# Set PostgreSQL password (if needed)
psql postgres
# In psql console:
ALTER USER postgres PASSWORD 'YOUR_PASSWORD_HERE';
\q
```

### 4. Configure Environment Variables

**Backend Configuration:**
```bash
# Edit backend/.env
cp backend/.env.example backend/.env
nano backend/.env
```

Update the following values:
```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD_HERE@localhost:5432/ibc_security
JWT_SECRET=YOUR_JWT_SECRET_HERE_MINIMUM_32_CHARACTERS
PORT=3001
NODE_ENV=production
CORS_ORIGIN=http://localhost:3000
```

**Frontend Configuration:**
```bash
# Edit frontend/.env
cp frontend/.env.example frontend/.env
nano frontend/.env
```

Update:
```env
VITE_API_URL=http://localhost:3001
```

### 5. Build the Application

```bash
# Build backend
cd backend
npm run build
cd ..

# Build frontend
cd frontend
npm run build
cd ..
```

### 6. Initialize Database

```bash
cd backend
npm run db:migrate
npm run seed:roles
cd ..
```

### 7. Create Admin User

```bash
cd backend
npm run reset:admin
# Follow prompts to set admin password
cd ..
```

## Auto-Start on Reboot (launchd)

### Backend Service

Create `/Users/william/Library/LaunchAgents/com.ibc.backend.plist`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.ibc.backend</string>
    
    <key>ProgramArguments</key>
    <array>
        <string>/usr/local/bin/node</string>
        <string>dist/index.js</string>
    </array>
    
    <key>WorkingDirectory</key>
    <string>/Users/william/ibc-platform/backend</string>
    
    <key>EnvironmentVariables</key>
    <dict>
        <key>NODE_ENV</key>
        <string>production</string>
        <key>PATH</key>
        <string>/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin</string>
    </dict>
    
    <key>RunAtLoad</key>
    <true/>
    
    <key>KeepAlive</key>
    <true/>
    
    <key>StandardOutPath</key>
    <string>/Users/william/ibc-platform/backend/logs/backend.log</string>
    
    <key>StandardErrorPath</key>
    <string>/Users/william/ibc-platform/backend/logs/backend-error.log</string>
</dict>
</plist>
```

### Frontend Service (Production Server)

For production, serve the built frontend with a simple HTTP server.

First, install `serve` globally:
```bash
npm install -g serve
```

Create `/Users/william/Library/LaunchAgents/com.ibc.frontend.plist`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.ibc.frontend</string>
    
    <key>ProgramArguments</key>
    <array>
        <string>/usr/local/bin/serve</string>
        <string>-s</string>
        <string>dist</string>
        <string>-l</string>
        <string>3000</string>
    </array>
    
    <key>WorkingDirectory</key>
    <string>/Users/william/ibc-platform/frontend</string>
    
    <key>RunAtLoad</key>
    <true/>
    
    <key>KeepAlive</key>
    <true/>
    
    <key>StandardOutPath</key>
    <string>/Users/william/ibc-platform/frontend/logs/frontend.log</string>
    
    <key>StandardErrorPath</key>
    <string>/Users/william/ibc-platform/frontend/logs/frontend-error.log</string>
</dict>
</plist>
```

### PostgreSQL Service

PostgreSQL should already be configured to start on boot if installed via Homebrew:

```bash
# Enable PostgreSQL to start on boot
brew services start postgresql@14
```

### Load and Start Services

```bash
# Create log directories
mkdir -p ~/ibc-platform/backend/logs
mkdir -p ~/ibc-platform/frontend/logs

# Load the services
launchctl load ~/Library/LaunchAgents/com.ibc.backend.plist
launchctl load ~/Library/LaunchAgents/com.ibc.frontend.plist

# Start services immediately
launchctl start com.ibc.backend
launchctl start com.ibc.frontend
```

## Managing Services

### Check Service Status
```bash
# Check if services are running
launchctl list | grep ibc

# View backend logs
tail -f ~/ibc-platform/backend/logs/backend.log

# View frontend logs
tail -f ~/ibc-platform/frontend/logs/frontend.log
```

### Stop Services
```bash
launchctl stop com.ibc.backend
launchctl stop com.ibc.frontend
```

### Restart Services
```bash
launchctl stop com.ibc.backend
launchctl start com.ibc.backend

launchctl stop com.ibc.frontend
launchctl start com.ibc.frontend
```

### Unload Services (disable auto-start)
```bash
launchctl unload ~/Library/LaunchAgents/com.ibc.backend.plist
launchctl unload ~/Library/LaunchAgents/com.ibc.frontend.plist
```

## Updating the Application

```bash
cd ~/ibc-platform

# Stop services
launchctl stop com.ibc.backend
launchctl stop com.ibc.frontend

# Pull latest changes
git pull

# Update dependencies
npm install
cd backend && npm install && npm run build && cd ..
cd frontend && npm install && npm run build && cd ..

# Run migrations if needed
cd backend && npm run db:migrate && cd ..

# Start services
launchctl start com.ibc.backend
launchctl start com.ibc.frontend
```

## Troubleshooting

### Services Won't Start

1. Check node path:
```bash
which node
# Update ProgramArguments in plist if path is different
```

2. Check permissions:
```bash
chmod 644 ~/Library/LaunchAgents/com.ibc.*.plist
```

3. Check logs:
```bash
tail -f ~/ibc-platform/backend/logs/backend-error.log
tail -f ~/ibc-platform/frontend/logs/frontend-error.log
```

### Database Connection Issues

1. Verify PostgreSQL is running:
```bash
brew services list
```

2. Test connection:
```bash
psql -U postgres -d ibc_security
```

3. Check DATABASE_URL in backend/.env

### Port Already in Use

```bash
# Find process using port 3001 (backend)
lsof -i :3001

# Find process using port 3000 (frontend)
lsof -i :3000

# Kill process if needed
kill -9 <PID>
```

## Access the Application

After deployment:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- Default admin credentials: See DEFAULT_CREDENTIALS.md

## Security Recommendations

1. **Change default passwords** immediately after deployment
2. **Update JWT_SECRET** to a strong random string (32+ characters)
3. **Configure firewall** to restrict access to ports 3000 and 3001
4. **Setup SSL/TLS** if exposing to network (use nginx reverse proxy)
5. **Regular backups** of PostgreSQL database:
```bash
pg_dump -U postgres ibc_security > backup-$(date +%Y%m%d).sql
```

## Network Access (Optional)

To access from other devices on the network:

1. Find Mac mini IP address:
```bash
ipconfig getifaddr en0
```

2. Update frontend/.env:
```env
VITE_API_URL=http://<mac-mini-ip>:3001
```

3. Update backend/.env:
```env
CORS_ORIGIN=http://<mac-mini-ip>:3000
```

4. Rebuild and restart services

5. Access from network: `http://<mac-mini-ip>:3000`

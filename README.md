# Inspired Benevolence Cybersecurity Platform

A comprehensive cyber security incident response platform featuring playbook management, incident monitoring, and cross-team collaboration.

## Features

- **Playbook Management**: Create, edit, and share step-by-step incident response playbooks
- **Incident Tracking**: Real-time monitoring and case management
- **Alert Management**: AI-driven severity classification and triage
- **Cross-Functional Collaboration**: Coordinate across IT, Security, HR, Legal, and C-suite
- **Compliance Tracking**: NIST CSF, ISO 27001, PCI/DSS support
- **Evidence Preservation**: Automated documentation and audit trails
- **Analytics & Reporting**: Incident trends, metrics, and compliance reports

## Technology Stack

- **Frontend**: React + TypeScript
- **Backend**: Node.js + Express
- **Database**: PostgreSQL
- **Real-time**: WebSockets (Socket.io)
- **Authentication**: JWT with RBAC

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Docker (optional)

### Installation

```bash
# Install dependencies
npm install

# Set up database
npm run db:setup

# Start development server
npm run dev
```

### Environment Variables

Create a `.env` file:

```
DATABASE_URL=postgresql://user:password@localhost:5432/ibc_security
JWT_SECRET=your-secret-key
PORT=3000
```

## Project Structure

```
inspired-benevolence-cybersecurity/
├── backend/           # Express API server
├── frontend/          # React application
├── database/          # Database schemas and migrations
├── docs/              # Documentation
└── docker/            # Docker configuration
```

## License

Proprietary - Inspired Benevolence LLC

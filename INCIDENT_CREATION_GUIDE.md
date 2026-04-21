# Incident Creation Guide

## Overview

Currently, incidents in the IB Cybersecurity platform are created **manually** through the **Alerts page** when an alert is escalated to an incident.

---

## Current Incident Creation Method

### **Method: Manual Escalation from Alerts**

**Location:** Alerts page (`/alerts`)

**Process:**
1. User views alerts on the Alerts page
2. User clicks "Escalate to Incident" button on an alert
3. System creates new incident from alert data
4. System links alert to the newly created incident
5. User is notified of successful escalation

---

## Detailed Workflow

### **Step 1: Alert Created**

Alerts are created through:
- Manual entry on Alerts page
- External integrations (e.g., ManageEngine)
- API calls

**Alert Data:**
- Title
- Description
- Severity (critical, high, medium, low)
- Alert Type (malware, phishing, intrusion, etc.)
- Source
- Affected Assets
- Detection Method
- Raw Data

### **Step 2: Alert Reviewed**

Security analyst reviews alerts:
- Views alert details
- Assesses threat level
- Determines if it requires incident response

### **Step 3: Escalate to Incident**

If alert warrants incident response:

**User Action:**
- Click "⬆️ Escalate to Incident" button

**System Actions:**
1. **Determine Incident Type** from alert type:
   ```typescript
   const typeMap = {
     'malware': 'malware',
     'phishing': 'phishing',
     'intrusion': 'unauthorized_access',
     'ddos': 'ddos',
     'data_exfiltration': 'data_breach',
     'ransomware': 'ransomware',
     'insider_threat': 'insider_threat'
   };
   ```

2. **Create Incident** via API:
   ```typescript
   POST /api/incidents
   {
     title: alert.title,
     description: alert.description,
     incidentType: mappedType,
     severity: alert.severity,
     affectedSystems: alert.affectedAssets
   }
   ```

3. **Link Alert to Incident**:
   ```typescript
   PUT /api/alerts/:alertId
   {
     status: 'escalated',
     incidentId: newIncidentId
   }
   ```

4. **Trigger Notifications**:
   - If incident has playbook assigned
   - Send task notifications for tasks without dependencies

5. **Show Success**:
   - Alert user with incident ID
   - Mark alert as "escalated"

---

## What Happens When Incident is Created

### **Backend Processing** (`POST /api/incidents`)

**File:** `backend/src/routes/incidents.ts`

**Steps:**

1. **Validate Input**:
   - Check required fields (title, description, incidentType, severity)
   - Verify severity is valid value
   - Authenticate user

2. **Fetch Playbook Snapshot** (if playbook assigned):
   - Load full playbook from database
   - Create snapshot with phases, tasks, version
   - Store in `playbookSnapshot` field

3. **Create Incident Record**:
   ```typescript
   await Incident.create({
     title,
     description,
     incidentType,
     severity,
     playbookId,
     playbookSnapshot,
     affectedSystems,
     reportedBy: userId,
     status: 'detected'
   });
   ```

4. **Generate Tasks** (legacy - for old playbook format):
   - If playbook has `steps` field
   - Create Task records for each step

5. **Send Notifications** (automatic):
   ```typescript
   taskNotificationService.notifyReadyTasks(incident.id)
   ```
   - Finds tasks without dependencies
   - Sends email to users with matching work roles
   - Logs notifications sent

6. **Emit WebSocket Event**:
   ```typescript
   io.emit('incident-created', incident);
   ```

7. **Return Incident Data**:
   - Full incident object
   - Includes ID for reference

---

## Missing Features

### **❌ Currently NOT Available:**

1. **No Direct Incident Creation**
   - No "Create Incident" button on Incidents page
   - Can't create incident without escalating from alert
   - Must go through Alerts → Escalate workflow

2. **No Incident Form**
   - No dedicated incident creation form
   - No way to manually create incident with playbook
   - No incident wizard/guided flow

3. **No Automatic Incident Creation**
   - No rule engine to auto-create incidents
   - No threshold-based incident creation
   - No alert correlation for auto-incidents

---

## Recommended Enhancements

### **Enhancement 1: Direct Incident Creation**

**Add "Create Incident" Button on Incidents Page**

**Features:**
- Create incident without alert
- Select playbook during creation
- Fill in all incident details
- Automatic task notification

**UI Location:**
```
┌─────────────────────────────────────────────┐
│ Security Incidents          [+ Create]      │
└─────────────────────────────────────────────┘
```

### **Enhancement 2: Incident Creation Form**

**Modal or Page with Fields:**
- Title *
- Description *
- Incident Type * (dropdown)
- Severity * (dropdown)
- Playbook (optional dropdown)
- Affected Systems (multi-select or text)
- Assigned To (user dropdown)

**After Creation:**
- Redirect to incident detail page
- Show Active Playbook tab
- Notifications sent automatically

### **Enhancement 3: Alert Rule Engine**

**Auto-Create Incidents Based on Rules:**

**Example Rules:**
- "If alert severity = critical AND type = ransomware → auto-create incident"
- "If 3+ alerts same source in 1 hour → create incident"
- "If alert contains keyword 'breach' → create incident"

**Benefits:**
- Faster response times
- Consistent incident creation
- Reduced manual work
- 24/7 automated triage

---

## Current Code Locations

### **Frontend**

**Alerts Page (Escalation):**
```
frontend/src/pages/Alerts.tsx
- handleEscalate() function (line ~74)
- POST /api/incidents API call
- Alert status update
```

**Incidents Page (Display Only):**
```
frontend/src/pages/Incidents.tsx
- No creation functionality
- Only displays existing incidents
```

**Incident Detail Page:**
```
frontend/src/pages/IncidentDetail.tsx
- View and manage existing incidents
- No creation functionality
```

### **Backend**

**Incident Creation Endpoint:**
```
backend/src/routes/incidents.ts
- POST / route (line ~50)
- Authentication required
- Validation middleware
- Playbook snapshot logic
- Task notification trigger
```

**Incident Model:**
```
backend/src/models/Incident.ts
- Incident schema
- Status enum
- Severity enum
```

---

## API Reference

### **Create Incident**

**Endpoint:** `POST /api/incidents`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "Ransomware Attack - Finance Department",
  "description": "Multiple workstations encrypted, ransom note detected",
  "incidentType": "ransomware",
  "severity": "critical",
  "playbookId": "uuid-of-playbook",
  "affectedSystems": ["WKS-001", "WKS-002", "SRV-FIN-01"]
}
```

**Response:**
```json
{
  "id": "uuid",
  "title": "Ransomware Attack - Finance Department",
  "description": "...",
  "incidentType": "ransomware",
  "severity": "critical",
  "status": "detected",
  "playbookId": "uuid",
  "playbookSnapshot": {
    "id": "uuid",
    "name": "Ransomware Response Playbook",
    "phases": [ ... ],
    "snapshotTakenAt": "2026-03-16T21:00:00Z"
  },
  "affectedSystems": ["WKS-001", "WKS-002", "SRV-FIN-01"],
  "reportedBy": "user-uuid",
  "detectedAt": "2026-03-16T21:00:00Z",
  "createdAt": "2026-03-16T21:00:00Z"
}
```

---

## Summary

### **Current State**

✅ **Incidents created from:**
- Alerts page → "Escalate to Incident" button only

✅ **Automatic features:**
- Playbook snapshot stored
- Tasks notifications sent
- WebSocket events emitted

❌ **Not available:**
- Direct incident creation button
- Incident creation form
- Automatic incident creation from rules

### **How to Create Incident Today**

1. Go to Alerts page
2. Find or create an alert
3. Click "Escalate to Incident"
4. Incident created automatically
5. Navigate to incident to manage response

### **Recommendation**

**Add "Create Incident" button to Incidents page** for:
- Direct incident creation without alert
- Manual incident reporting
- Better user experience
- More flexible workflow

---

## Quick Reference

**Current Method:**
```
Alerts → [Select Alert] → [Escalate to Incident] → Incident Created
```

**Recommended Addition:**
```
Incidents → [+ Create Incident] → [Fill Form] → Incident Created
```

**API Endpoint:**
```
POST /api/incidents
{
  title, description, incidentType, 
  severity, playbookId, affectedSystems
}
```

**Code Locations:**
- Frontend Escalation: `frontend/src/pages/Alerts.tsx`
- Backend Creation: `backend/src/routes/incidents.ts`
- Incident Model: `backend/src/models/Incident.ts`

---

**Currently, incidents are created by escalating alerts. Consider adding a direct "Create Incident" button for improved workflow.** 📋

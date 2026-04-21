# Create Incident Feature

## Overview

The IB Cybersecurity platform now includes a **"Create Incident" button** on the Incidents page, allowing users to create incidents directly without needing to escalate from alerts.

---

## New Feature: Direct Incident Creation

### **Access**

**Location:** Incidents page (`/incidents`)

**Button:** Blue "➕ Create Incident" button in top-right corner

```
┌─────────────────────────────────────────────────────┐
│ Security Incidents    [🔶 3 Active] [✓ 5 Resolved] [+ Create Incident] │
└─────────────────────────────────────────────────────┘
```

---

## Create Incident Form

### **Form Fields**

**1. Incident Title * (Required)**
- Short, descriptive title
- Example: "Ransomware Attack - Finance Department"

**2. Description * (Required)**
- Detailed description of incident
- What happened, when, where
- Initial observations

**3. Incident Type * (Required)**
- Dropdown with options:
  - Ransomware
  - Phishing
  - DDoS Attack
  - Data Breach
  - Insider Threat
  - Malware
  - Unauthorized Access
  - Custom

**4. Severity * (Required)**
- Dropdown with options:
  - Critical (🔴)
  - High (🟡)
  - Medium (🔵)
  - Low (🟢)

**5. Response Playbook (Optional)**
- Dropdown showing active playbooks
- Automatically suggests playbook matching incident type
- Option to create incident without playbook
- Shows confirmation when playbook selected

**6. Affected Systems (Optional)**
- Comma-separated list
- System names, hostnames, or IP addresses
- Example: "WKS-001, WKS-002, SRV-FIN-01"

---

## Features

### **✅ Smart Playbook Matching**

When you select an incident type, the form automatically selects a matching playbook if available:

**Example:**
1. Select Incident Type: "Ransomware"
2. System automatically selects "Ransomware Response Playbook"
3. User can change selection or choose "No playbook"

### **✅ Automatic Notifications**

When incident created with playbook:
- Playbook snapshot stored
- Tasks without dependencies identified
- Email notifications sent to users with matching work roles
- All happens automatically in background

### **✅ Visual Feedback**

**With Playbook:**
```
┌─────────────────────────────────────────────┐
│ 📘 Response Playbook                        │
│ ✓ Tasks will be automatically generated     │
│   and notifications sent to assigned roles  │
└─────────────────────────────────────────────┘
```

**Without Playbook:**
```
┌─────────────────────────────────────────────┐
│ ⚠️ No playbook selected                     │
│ Without a playbook, you'll need to manually │
│ manage incident response tasks.             │
└─────────────────────────────────────────────┘
```

---

## User Workflow

### **Scenario 1: Create Incident with Playbook**

**Step 1:** Navigate to Incidents page
- Click "Incidents" in navigation menu
- Or go to http://127.0.0.1:3012/incidents

**Step 2:** Click "Create Incident"
- Blue button in top-right corner
- Modal form appears

**Step 3:** Fill in form
- **Title:** "Ransomware Attack - Accounting Department"
- **Description:** "Multiple workstations showing file encryption, ransom note detected"
- **Type:** Select "Ransomware"
- **Severity:** Select "Critical"
- **Playbook:** "Ransomware Response Playbook" (auto-selected)
- **Systems:** "WKS-ACC-01, WKS-ACC-02, WKS-ACC-03"

**Step 4:** Click "Create Incident"
- Form validates fields
- Incident created
- Success message shown
- Modal closes
- Incident appears in list

**Step 5:** Automatic Actions
- Playbook snapshot stored
- Notifications sent to:
  - Security Analysts (for identification tasks)
  - IT Director (for initial assessment)
  - Executive (for notification)
- Tasks ready for execution

**Step 6:** Open Incident
- Click on newly created incident
- See "Active Playbook" tab
- Begin response with guided tasks

---

### **Scenario 2: Create Incident without Playbook**

**Use Case:** Incident type doesn't have playbook or custom response needed

**Step 1-4:** Same as above

**Step 5:** Deselect playbook
- Change dropdown to "No playbook (manual response)"
- Warning appears about manual task management

**Step 6:** Create incident
- Incident created without playbook
- No automatic task generation
- No automatic notifications
- Manual response required

---

## Comparison: Alert vs Direct Creation

### **Method 1: Escalate from Alert**

**When to use:**
- Alert already exists
- Incident triggered by monitoring system
- Alert data needs to be preserved

**Process:**
```
Alert Detected → Review Alert → Escalate → Incident Created
```

### **Method 2: Direct Creation (NEW)**

**When to use:**
- Manual incident reporting
- Incident discovered outside monitoring
- Testing playbooks
- Training exercises
- No alert exists

**Process:**
```
Create Incident → Fill Form → Incident Created
```

---

## Technical Details

### **Form Component**

**File:** `frontend/src/components/IncidentForm.tsx`

**Features:**
- Modal overlay with full form
- Real-time validation
- Playbook auto-selection
- Affected systems parsing
- Error handling
- Success feedback

### **API Call**

```typescript
POST /api/incidents
{
  title: "Ransomware Attack - Finance",
  description: "Multiple workstations encrypted...",
  incidentType: "ransomware",
  severity: "critical",
  playbookId: "uuid-of-playbook", // optional
  affectedSystems: ["WKS-001", "WKS-002"]
}
```

### **Backend Processing**

Same as alert escalation:
1. Validate input
2. Fetch playbook (if selected)
3. Create playbook snapshot
4. Create incident record
5. Send notifications (if playbook)
6. Emit WebSocket event
7. Return incident data

---

## Benefits

### **For Security Teams**

✅ **Faster Response** - No need to create alert first  
✅ **Flexible Workflow** - Create incidents from any source  
✅ **Manual Reporting** - Report incidents discovered outside monitoring  
✅ **Testing** - Create test incidents with playbooks  
✅ **Training** - Practice incident response procedures  

### **For Incident Commanders**

✅ **Direct Control** - Create incident when needed  
✅ **Playbook Selection** - Choose appropriate response plan  
✅ **System Tracking** - Document affected systems from start  
✅ **Immediate Action** - Start response without delay  

### **For Operations**

✅ **Multiple Entry Points** - Alerts OR direct creation  
✅ **Same Backend** - Consistent processing  
✅ **Automatic Notifications** - Tasks emailed to teams  
✅ **Audit Trail** - All incidents tracked equally  

---

## Form Validation

### **Required Fields**

- ❌ Title empty → "Please fill out this field"
- ❌ Description empty → "Please fill out this field"
- ✅ All required fields filled → Form can submit

### **Optional Fields**

- Playbook: Can be left as "No playbook"
- Affected Systems: Can be left empty

### **Affected Systems Parsing**

**Input:** "WKS-001, WKS-002, SRV-FIN-01"  
**Parsed to:** `["WKS-001", "WKS-002", "SRV-FIN-01"]`

**Input:** "192.168.1.10,192.168.1.11"  
**Parsed to:** `["192.168.1.10", "192.168.1.11"]`

---

## Testing the Feature

### **Test 1: Create Incident with Playbook**

1. Go to http://127.0.0.1:3012/incidents
2. Click "➕ Create Incident" button
3. Fill in form:
   - Title: "Test Ransomware Incident"
   - Description: "Testing incident creation with playbook"
   - Type: "Ransomware"
   - Severity: "High"
   - Playbook: Select "Ransomware Incident Response"
   - Systems: "TEST-001, TEST-002"
4. Click "Create Incident"
5. Verify:
   - Success message appears
   - Incident appears in list with playbook badge
   - Check console logs for notifications
6. Open incident:
   - See Active Playbook tab
   - See progress at 0%
   - See tasks organized by phase

### **Test 2: Create Incident without Playbook**

1. Click "➕ Create Incident"
2. Fill in form:
   - Title: "Test Manual Incident"
   - Description: "Testing manual response"
   - Type: "Custom"
   - Severity: "Medium"
   - Playbook: "No playbook (manual response)"
3. See warning message about manual task management
4. Click "Create Incident"
5. Verify:
   - Incident created
   - No playbook badge
   - No Active Playbook tab

### **Test 3: Playbook Auto-Selection**

1. Click "➕ Create Incident"
2. Select different incident types
3. Watch playbook dropdown:
   - "Ransomware" → "Ransomware Incident Response"
   - "Phishing" → "Phishing Attack Response"
   - "DDoS" → "DDoS Attack Mitigation"
4. Verify matching playbooks selected automatically

---

## UI Screenshots

### **Incidents Page with Button**

```
┌──────────────────────────────────────────────────────────┐
│ Security Incidents                                       │
│                                                          │
│ 🔶 3 Active  ✓ 5 Resolved           [+ Create Incident] │
│                                                          │
│ 🛡️ Active Incidents                                     │
│ ┌────────────────────────────────────────────────────┐  │
│ │ 🚨 CRITICAL | RANSOMWARE                           │  │
│ │ Ransomware - Finance Department                    │  │
│ │ Multiple workstations showing encryption...        │  │
│ │ 📘 Ransomware Response Playbook        53%         │  │
│ │ Detected 2 hours ago                               │  │
│ └────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
```

### **Create Incident Modal**

```
┌──────────────────────────────────────────────────────────┐
│ 🛡️ Create New Incident                              ✕  │
├──────────────────────────────────────────────────────────┤
│                                                          │
│ Incident Title *                                         │
│ [Ransomware Attack - Finance Department              ]  │
│                                                          │
│ Description *                                            │
│ [Multiple workstations encrypted, ransom note...     ]  │
│ [                                                     ]  │
│                                                          │
│ Incident Type *          Severity *                      │
│ [Ransomware         ▼]  [Critical              ▼]       │
│                                                          │
│ 📘 Response Playbook (Optional)                          │
│ [Ransomware Response Playbook - RANSOMWARE       ▼]     │
│ ✓ Tasks will be automatically generated and             │
│   notifications sent to assigned roles                   │
│                                                          │
│ Affected Systems (Optional)                              │
│ [WKS-001, WKS-002, SRV-FIN-01                        ]  │
│ Enter system names or IPs separated by commas           │
│                                                          │
│                              [Cancel] [Create Incident]  │
└──────────────────────────────────────────────────────────┘
```

---

## Files Modified/Created

**Frontend:**
- ✅ `frontend/src/components/IncidentForm.tsx` - **NEW** - Modal form component
- ✅ `frontend/src/pages/Incidents.tsx` - Added create button and modal

**Backend:**
- ✅ No changes needed (existing API endpoint works)

---

## Summary

### **What Was Added**

✅ **"Create Incident" Button** - Top-right of Incidents page  
✅ **Incident Form Modal** - Complete form with all fields  
✅ **Playbook Selection** - Dropdown with auto-matching  
✅ **Smart Defaults** - Auto-selects matching playbook  
✅ **Visual Feedback** - Warnings and confirmations  
✅ **Validation** - Required field checking  
✅ **Affected Systems** - Comma-separated input  

### **How to Use**

1. Go to Incidents page
2. Click "➕ Create Incident"
3. Fill in form
4. Select playbook (optional)
5. Click "Create Incident"
6. Incident created with automatic notifications!

### **Benefits**

- ✅ Create incidents without alerts
- ✅ Manual incident reporting
- ✅ Testing and training
- ✅ Same backend processing
- ✅ Automatic task notifications
- ✅ Guided playbook response

---

**You can now create incidents directly from the Incidents page with or without playbooks!** 🎉

**Try it:** http://127.0.0.1:3012/incidents → Click "➕ Create Incident"

# Archive and Escalation Feature

## Overview

The IB Cybersecurity platform now includes **incident archiving** and **escalation** capabilities, allowing teams to manage incident lifecycle more effectively.

---

## New Features

### **1. Incident Archiving**

Archive completed or closed incidents for long-term storage while keeping them accessible.

### **2. Incident Restoration**  

Restore archived incidents if they need to be reopened.

### **3. Incident Escalation**

Escalate incidents to higher levels for increased visibility and urgency.

### **4. Archived Incidents View**

Dedicated section on Incidents page to view all archived incidents.

---

## Incident Archiving

### **When to Archive**

Archive incidents that:
- ✅ Are fully resolved
- ✅ Have completed post-mortem
- ✅ Don't need active monitoring
- ✅ Should be retained for historical reference
- ✅ Need to be kept for compliance/audit

### **How to Archive**

**Step 1:** Open incident detail page

**Step 2:** Scroll to sidebar actions

**Step 3:** Click **"📦 Archive Incident"** button

**Step 4:** Enter reason for archiving:
```
Example: "Incident fully resolved, post-mortem completed, no further action needed"
```

**Step 5:** Click OK

**Result:**
- ✅ Incident status changed to "archived"
- ✅ Archive timestamp recorded
- ✅ Archive reason stored
- ✅ Moved to Archived Incidents section
- ✅ Remains searchable and accessible

### **What Happens When Archived**

**Data Stored:**
- `status`: Set to "archived"
- `archivedAt`: Current timestamp
- `archivedBy`: User ID who archived it
- `archiveReason`: Reason provided

**Preserved Information:**
- All incident details
- Playbook snapshot
- Task completion history
- Timeline entries
- Evidence
- Post-mortem
- **Nothing is deleted!**

### **Viewing Archived Incidents**

**Location:** Incidents page (`/incidents`)

**Section:** "Archived Incidents" (below Resolved Incidents)

**Display:**
```
┌────────────────────────────────────────────────┐
│ 📦 Archived Incidents                          │
│                                                │
│ ┌──────────────────────────────────────────┐  │
│ │ 🔒 ARCHIVED | HIGH                       │  │
│ │ Ransomware - Finance (Resolved)          │  │
│ │ 📄 Ransomware Response Playbook          │  │
│ │ Archived 3 days ago • Fully resolved     │  │
│ └──────────────────────────────────────────┘  │
└────────────────────────────────────────────────┘
```

**Badge Counter:**
```
🔶 3 Active  ✓ 5 Resolved  📦 12 Archived
```

---

## Incident Restoration

### **When to Restore**

Restore archived incidents when:
- ❗ Incident recurs or reopens
- ❗ Additional investigation needed
- ❗ Related new incident discovered
- ❗ Archived by mistake

### **How to Restore**

**Step 1:** Navigate to archived incident

**Step 2:** Click on incident to open detail page

**Step 3:** Click **"🔄 Restore Incident"** button

**Step 4:** Confirm restoration

**Result:**
- ✅ Status restored (to previous or "investigating")
- ✅ Archive fields cleared
- ✅ Moved back to Active or Resolved section
- ✅ Fully functional again

### **Restoration Behavior**

**If incident was resolved before archiving:**
- Restored to: "resolved" status

**If incident was not resolved:**
- Restored to: "investigating" status

**All data preserved:**
- Timeline intact
- Evidence preserved
- Task history maintained
- Playbook snapshot unchanged

---

## Incident Escalation

### **What is Escalation?**

Escalation increases the urgency/visibility level of an incident.

**Escalation Levels:**
- Level 1: Normal incident (default)
- Level 2: Escalated once
- Level 3: Escalated twice
- Level 4+: Multiple escalations

### **When to Escalate**

Escalate incidents when:
- ⚠️ Severity increases
- ⚠️ Impact broader than initially assessed
- ⚠️ Response not progressing
- ⚠️ Management attention needed
- ⚠️ External parties involved

### **How to Escalate**

**Step 1:** Open incident detail page

**Step 2:** Click **"📈 Escalate"** button

**Shows:** Current level → Next level
```
Example: "Escalate (Level 1 → 2)"
```

**Step 3:** Confirm escalation

**Result:**
- ✅ Escalation level increased
- ✅ Timeline entry added
- ✅ Escalation tracked
- ✅ Can escalate multiple times

### **Escalation Timeline Entry**

Automatically added to incident timeline:
```
📈 Escalated to Level 2
Incident escalated from Level 1 to Level 2
By: John Doe
At: 2026-03-16 14:30:00
```

### **Visual Indication**

Button shows current and next level:
```
📈 Escalate (Level 1 → 2)
📈 Escalate (Level 2 → 3)
📈 Escalate (Level 3 → 4)
```

---

## User Interface

### **Incident Detail Page - Sidebar Actions**

```
┌─────────────────────────────────────┐
│ Status                              │
│ [Investigating ▼]                   │
│                                     │
│ [📈 Escalate (Level 1 → 2)]        │
│                                     │
│ [📧 Send Task Notifications]       │
│                                     │
│ [📦 Archive Incident]              │
└─────────────────────────────────────┘
```

**For Archived Incidents:**
```
┌─────────────────────────────────────┐
│ Status                              │
│ [ARCHIVED]                          │
│                                     │
│ [🔄 Restore Incident]              │
└─────────────────────────────────────┘
```

### **Incidents Page Layout**

**Three Sections:**

1. **🔶 Active Incidents**
   - Currently open incidents
   - Status: detected, investigating, contained, etc.

2. **✓ Resolved Incidents**
   - Status: resolved, closed
   - Shows completion info

3. **📦 Archived Incidents** (NEW)
   - Status: archived
   - Shows archive reason
   - Reduced opacity (60%)

---

## API Endpoints

### **Archive Incident**

**Endpoint:** `POST /api/incidents/:id/archive`

**Request:**
```json
{
  "reason": "Incident fully resolved and documented"
}
```

**Response:**
```json
{
  "id": "uuid",
  "status": "archived",
  "archivedAt": "2026-03-16T21:00:00Z",
  "archivedBy": "user-uuid",
  "archiveReason": "Incident fully resolved and documented"
}
```

### **Restore Incident**

**Endpoint:** `POST /api/incidents/:id/restore`

**Request:** (empty body)

**Response:**
```json
{
  "id": "uuid",
  "status": "investigating",
  "archivedAt": null,
  "archivedBy": null,
  "archiveReason": null
}
```

### **Escalate Incident**

**Endpoint:** `POST /api/incidents/:id/escalate`

**Request:** (empty body)

**Response:**
```json
{
  "id": "uuid",
  "escalationLevel": 2,
  "timeline": [
    {
      "timestamp": "2026-03-16T21:00:00Z",
      "userId": "user-uuid",
      "action": "Escalated to Level 2",
      "description": "Incident escalated from Level 1 to Level 2"
    }
  ]
}
```

---

## Database Schema

### **New Fields in `incidents` Table**

```sql
ALTER TABLE incidents ADD COLUMN "archivedAt" TIMESTAMP;
ALTER TABLE incidents ADD COLUMN "archivedBy" UUID REFERENCES users(id);
ALTER TABLE incidents ADD COLUMN "archiveReason" TEXT;
ALTER TABLE incidents ADD COLUMN "escalationLevel" INTEGER DEFAULT 1;
```

### **Updated Status Enum**

```sql
ALTER TYPE enum_incidents_status ADD VALUE 'archived';
```

**All Statuses:**
- detected
- investigating
- contained
- eradicating
- recovering
- resolved
- closed
- **archived** (new)

---

## Use Cases

### **Use Case 1: Archive Completed Incident**

**Scenario:** Ransomware incident fully resolved, post-mortem done

**Steps:**
1. Open incident
2. Verify status: "resolved"
3. Check post-mortem completed
4. Click "Archive Incident"
5. Enter reason: "Incident resolved, all systems restored, post-mortem completed"
6. Incident moved to archived section

**Benefit:** Keeps active incidents list clean while preserving history

### **Use Case 2: Escalate Stalled Incident**

**Scenario:** Phishing incident not progressing, needs management attention

**Steps:**
1. Open incident (currently Level 1)
2. Click "Escalate (Level 1 → 2)"
3. Confirm escalation
4. Timeline updated with escalation
5. Management notified (via timeline)

**Benefit:** Increases visibility and urgency

### **Use Case 3: Restore Recurring Incident**

**Scenario:** Archived DDoS incident recurs

**Steps:**
1. Go to Archived Incidents
2. Find original DDoS incident
3. Open incident detail
4. Click "Restore Incident"
5. Incident back in Active section
6. Continue response with existing playbook

**Benefit:** Reuse context and history from original incident

---

## Benefits

### **For Incident Commanders**

✅ **Clean Active List** - Archive completed incidents  
✅ **Escalation Path** - Clear process for raising urgency  
✅ **Historical Access** - All archives remain searchable  
✅ **Reopen if Needed** - Restore archived incidents  

### **For Management**

✅ **Escalation Visibility** - See which incidents escalated  
✅ **Audit Trail** - Archive reasons documented  
✅ **Compliance** - Historical incidents preserved  
✅ **Metrics** - Track escalation frequency  

### **For Compliance**

✅ **Data Retention** - Archived incidents preserved  
✅ **Audit Access** - Can review archived incidents  
✅ **Reason Tracking** - Why incidents archived  
✅ **Timestamp Records** - When archived, by whom  

---

## Best Practices

### **Archiving**

**Do:**
- ✅ Archive only fully resolved incidents
- ✅ Complete post-mortem before archiving
- ✅ Provide clear archive reason
- ✅ Review incident thoroughly before archiving

**Don't:**
- ❌ Archive active incidents
- ❌ Archive as a way to "hide" problems
- ❌ Archive without documenting reason
- ❌ Archive incidents needing follow-up

### **Escalation**

**Do:**
- ✅ Escalate when truly needed
- ✅ Document why escalating in timeline
- ✅ Notify stakeholders of escalation
- ✅ Use for significant incidents

**Don't:**
- ❌ Overuse escalation (loses meaning)
- ❌ Escalate without trying normal response first
- ❌ Use as substitute for proper response
- ❌ Escalate minor incidents unnecessarily

---

## Files Modified

**Backend:**
- ✅ `backend/src/models/Incident.ts` - Added archive and escalation fields
- ✅ `backend/src/routes/incidents.ts` - Added archive, restore, escalate endpoints
- ✅ Database: Added columns and archived status

**Frontend:**
- ✅ `frontend/src/pages/Incidents.tsx` - Added archived section
- ✅ `frontend/src/pages/IncidentDetail.tsx` - Added action buttons

---

## Summary

### **New Capabilities**

✅ **Archive Incidents** - Store completed incidents  
✅ **Restore Incidents** - Reopen if needed  
✅ **Escalate Incidents** - Increase urgency level  
✅ **View Archives** - Dedicated section on Incidents page  
✅ **Track Reasons** - Document why archived  
✅ **Timeline Tracking** - Escalations recorded  

### **Status Flow**

```
Active → Resolved → Archived
   ↓                    ↑
Escalate            Restore
```

### **Access**

**Archive/Escalate:** Incident detail page → Sidebar actions  
**View Archives:** http://127.0.0.1:3012/incidents → Archived Incidents section  
**Restore:** Archived incident detail → Restore button  

---

**Incidents can now be archived for clean management and escalated for increased visibility!** 📦📈

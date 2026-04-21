# Alert Archive Feature

## Overview

The Alerts system now includes **archive and restore functionality**, allowing security teams to archive resolved or false-positive alerts while keeping them accessible. The Alerts page also features **filter buttons** (Active/Resolved/Archived) similar to the Incidents page.

---

## New Features

### **1. Alert Archiving**

Archive alerts that have been reviewed and don't require further action.

### **2. Alert Restoration**  

Restore archived alerts if they need to be reopened or reconsidered.

### **3. Filter-Based View**

Filter alerts by status using clickable buttons:
- **Active** - New, acknowledged, investigating, escalated
- **Resolved** - Resolved and false positive
- **Archived** - Archived alerts

---

## Alerts Page - Filter Buttons

### **Filter Interface**

```
┌─────────────────────────────────────────────────────┐
│ Security Alerts                                     │
├─────────────────────────────────────────────────────┤
│ [⚠️ Active 15] [✓ Resolved 32] [📦 Archived 48]    │  ← FILTERS
└─────────────────────────────────────────────────────┘
```

**Three filter buttons:**

1. **⚠️ Active** (Orange)
   - Shows: new, acknowledged, investigating, escalated
   - Default selected on page load

2. **✓ Resolved** (Green)
   - Shows: resolved, false_positive
   - Displays resolution status

3. **📦 Archived** (Gray)
   - Shows: archived alerts only
   - Displays archive reason and timestamp
   - Reduced opacity (70%)

---

## Archive Alert

### **When to Archive**

Archive alerts that:
- ✅ Have been resolved
- ✅ Are false positives
- ✅ Have been thoroughly investigated
- ✅ Don't require escalation
- ✅ Should be retained for historical reference

### **How to Archive**

**Step 1:** View active or resolved alerts

**Step 2:** Click **"📦 Archive"** button on the alert card

**Step 3:** Enter reason for archiving:
```
Example: "False positive - legitimate system update"
Example: "Alert reviewed, no security threat detected"
Example: "Resolved and documented, no further action needed"
```

**Step 4:** Alert moved to Archived section

**Result:**
- Status changed to "archived"
- Archive timestamp recorded
- Archive reason stored
- Moved to archived filter view

---

## Restore Alert

### **When to Restore**

Restore archived alerts when:
- ❗ Similar alert recurs
- ❗ Additional context discovered
- ❗ Archived by mistake
- ❗ Needs re-investigation

### **How to Restore**

**Step 1:** Click **"📦 Archived"** filter button

**Step 2:** Find alert to restore

**Step 3:** Click **"🔄 Restore"** button

**Step 4:** Confirm restoration

**Result:**
- Status restored (to previous or "new")
- Archive fields cleared
- Moved to Active or Resolved section
- Available for action again

---

## Alert Display

### **Active Alerts**

**Shows:**
- New alerts (needs triage)
- Acknowledged alerts (under review)
- Investigating alerts (being analyzed)
- Escalated alerts (created incident)

**Actions:**
- Escalate to Incident
- Acknowledge
- Archive

---

### **Resolved Alerts**

**Shows:**
- Resolved alerts (threat mitigated)
- False positive alerts (not a threat)

**Actions:**
- Archive (primary action for resolved alerts)

---

### **Archived Alerts**

**Shows:**
- Archived alerts only
- Archive reason displayed
- Archive timestamp shown
- Reduced opacity (70%)

**Actions:**
- Restore (bring back to active/resolved)

---

## Technical Implementation

### **Database Changes**

**Added to alerts table:**
```sql
ALTER TABLE alerts ADD COLUMN "archivedAt" TIMESTAMP;
ALTER TABLE alerts ADD COLUMN "archivedBy" UUID REFERENCES users(id);
ALTER TABLE alerts ADD COLUMN "archiveReason" TEXT;
```

**Added to status enum:**
```sql
ALTER TYPE enum_alerts_status ADD VALUE 'archived';
```

---

### **Backend API**

**Archive Alert:**
```
POST /api/alerts/:id/archive
{
  "reason": "False positive - legitimate system update"
}
```

**Restore Alert:**
```
POST /api/alerts/:id/restore
```

---

### **Frontend Changes**

**Alerts Page:**
- Added filter buttons (Active/Resolved/Archived)
- Filter state management
- Archive/Restore buttons on alert cards
- Display archive reason for archived alerts
- Reduced opacity for archived alerts

---

##Use Cases

### **Use Case 1: Archive False Positive**

**Scenario:** Alert triggered by legitimate system update

**Steps:**
1. Review alert - determine false positive
2. Click "Archive" button
3. Enter reason: "False positive - scheduled Windows update"
4. Alert archived

**Benefit:** Keeps alert for historical reference without cluttering active list

---

### **Use Case 2: Archive Resolved Alert**

**Scenario:** Phishing alert resolved, user educated

**Steps:**
1. Mark alert as resolved
2. Click "Archive" button
3. Enter reason: "Phishing attempt blocked, user warned"
4. Alert archived

**Benefit:** Clean active list while maintaining audit trail

---

### **Use Case 3: Restore Recurring Alert**

**Scenario:** Same malware alert appears again

**Steps:**
1. Click "Archived" filter
2. Find original malware alert
3. Click "Restore" button
4. Alert back in active list
5. Escalate to incident

**Benefit:** Reuse context from original investigation

---

## Benefits

### **For Security Teams**

✅ **Clean Active List** - Archive processed alerts  
✅ **Audit Trail** - All alerts preserved with reasons  
✅ **Quick Filtering** - One click to switch views  
✅ **Historical Context** - Archived alerts searchable  

### **For Compliance**

✅ **Data Retention** - Archived alerts preserved  
✅ **Reason Documentation** - Why each alert archived  
✅ **Audit Access** - Can review all historical alerts  
✅ **Complete Records** - Nothing deleted, everything tracked  

### **For Operations**

✅ **Reduced Clutter** - Active alerts are actionable  
✅ **Better Focus** - Clear what needs attention  
✅ **Flexible Workflow** - Archive or escalate  
✅ **Easy Restoration** - Bring back if needed  

---

## Comparison with Incidents

### **Similar Features**

**Both have:**
- Archive functionality
- Restore capability
- Filter buttons (Active/Resolved/Archived)
- Archive reason tracking
- Timestamp recording

### **Differences**

**Alerts:**
- Lighter weight (detection events)
- Often false positives
- Quick triage needed
- Archive after review

**Incidents:**
- Full response workflow
- Playbook execution
- Task tracking
- Archive after resolution + post-mortem

---

## Best Practices

### **Archiving Alerts**

**Do:**
- ✅ Archive after thorough review
- ✅ Provide clear archive reason
- ✅ Archive false positives promptly
- ✅ Archive resolved alerts after documentation

**Don't:**
- ❌ Archive without investigating
- ❌ Use archive to hide problems
- ❌ Archive alerts needing escalation
- ❌ Archive without documenting reason

---

### **Restoration**

**Do:**
- ✅ Restore if similar alert recurs
- ✅ Check original context before restoring
- ✅ Update investigation with new findings
- ✅ Consider escalating after restore

**Don't:**
- ❌ Restore without clear reason
- ❌ Repeatedly restore/archive same alert
- ❌ Restore just to review (can view while archived)

---

## Files Modified

**Backend:**
- ✅ `backend/src/models/Alert.ts` - Added archive fields and status
- ✅ `backend/src/routes/alerts.ts` - Added archive/restore endpoints
- ✅ Database: Added columns and archived status enum

**Frontend:**
- ✅ `frontend/src/pages/Alerts.tsx` - Added filter buttons, archive/restore functionality

---

## Summary

### **What Was Added**

✅ **Archive Alerts** - With reason tracking  
✅ **Restore Alerts** - Bring back if needed  
✅ **Filter Buttons** - Active/Resolved/Archived  
✅ **Archive Reason Display** - Show why archived  
✅ **Reduced Opacity** - Visual indicator for archived  

### **How It Works**

1. Click filter button (Active, Resolved, or Archived)
2. View filtered alerts
3. Click "Archive" button on alert
4. Enter reason, alert archived
5. View in Archived filter
6. Restore if needed

### **Why It's Better**

- ✅ Cleaner active alerts list
- ✅ Better organization
- ✅ Complete audit trail
- ✅ Easy to restore if needed
- ✅ Consistent with Incidents page

---

**Alerts can now be archived with reasons and viewed through filter buttons for better organization!** 📦✅

**Try it:** http://127.0.0.1:3012/alerts → Use filter buttons to switch views

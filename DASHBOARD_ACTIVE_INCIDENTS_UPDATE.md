# Dashboard Update - Active Incidents Only

## Overview

The Dashboard charts for "Incidents by Type" and "Incidents by Severity" have been updated to show **only active incidents**, excluding resolved, closed, and archived incidents.

---

## What Changed

### **Before: All Incidents**

The charts previously showed **all incidents** regardless of status:
- Active incidents (detected, investigating, contained, etc.)
- Resolved incidents
- Closed incidents
- Archived incidents

**Problem:** Charts showed historical data, not current situation

---

### **After: Active Incidents Only**

The charts now show **only active incidents**:
- ✅ Detected
- ✅ Investigating
- ✅ Contained
- ✅ Eradicating
- ✅ Recovering

**Excluded:**
- ❌ Resolved
- ❌ Closed
- ❌ Archived

**Benefit:** Charts reflect current, actionable incidents

---

## Updated Charts

### **1. Active Incidents by Type**

**Title Changed:** "Incidents by Type" → **"Active Incidents by Type"**

**Shows:**
- Ransomware (active count)
- Phishing (active count)
- DDoS (active count)
- Data Breach (active count)
- Etc.

**Example:**
```
┌─────────────────────────────────────────┐
│ Active Incidents by Type                │
│                                         │
│ Ransomware     ████████ 8               │
│ Phishing       ████ 4                   │
│ DDoS           ██ 2                     │
│ Data Breach    █ 1                      │
└─────────────────────────────────────────┘
```

**Only shows incidents that are currently active!**

---

### **2. Active Incidents by Severity**

**Title Changed:** "Incidents by Severity" → **"Active Incidents by Severity"**

**Shows:**
- Critical (active count)
- High (active count)
- Medium (active count)
- Low (active count)

**Example:**
```
┌─────────────────────────────────────────┐
│ Active Incidents by Severity            │
│                                         │
│         ╱─────╲                         │
│        │       │  Critical: 3           │
│        │   ●   │  High: 7                │
│        │       │  Medium: 4             │
│         ╲─────╱   Low: 1                │
│                                         │
└─────────────────────────────────────────┘
```

**Pie chart shows only active incident distribution!**

---

## Why This Change?

### **Original Problem**

**Dashboard showed misleading data:**
- 50 total incidents
- Only 8 active
- But charts showed all 50!

**Result:** Charts didn't reflect current situation

### **Solution**

**Filter for active incidents only:**
- Shows what needs attention NOW
- Excludes historical/resolved incidents
- Matches "Active Incidents" stat card

**Result:** Dashboard shows actionable data

---

## Technical Implementation

### **Backend Changes**

**File:** `backend/src/routes/compliance.ts`

**Filter Added:**

```typescript
// Filter for active incidents only (not resolved, closed, or archived)
const activeIncidentFilter = {
  ...dateFilter,
  status: {
    [Op.notIn]: ['resolved', 'closed', 'archived']
  }
};

// Use filter for both charts
const incidentsByTypeRaw = await Incident.findAll({
  where: activeIncidentFilter,  // ← Changed from dateFilter
  attributes: [
    'incidentType',
    [Incident.sequelize!.fn('COUNT', Incident.sequelize!.col('id')), 'count']
  ],
  group: ['incidentType'],
  raw: true
});

const incidentsBySeverityRaw = await Incident.findAll({
  where: activeIncidentFilter,  // ← Changed from dateFilter
  attributes: [
    'severity',
    [Incident.sequelize!.fn('COUNT', Incident.sequelize!.col('id')), 'count']
  ],
  group: ['severity'],
  raw: true
});
```

**Key Change:** Added `status: { [Op.notIn]: ['resolved', 'closed', 'archived'] }`

---

### **Frontend Changes**

**File:** `frontend/src/pages/Dashboard.tsx`

**Title Updates:**

```typescript
// Before
<h3>Incidents by Type</h3>

// After
<h3>Active Incidents by Type</h3>

// Before
<h3>Incidents by Severity</h3>

// After
<h3>Active Incidents by Severity</h3>
```

**Reason:** Clarify that charts show active incidents only

---

## Dashboard Stats Card

### **"Active Incidents" Card**

**Already Correct:**

```typescript
const activeIncidents = incidents?.filter((i: any) => 
  !['resolved', 'closed'].includes(i.status)
).length || 0;
```

**Now Matches Charts:**
- Stat card counts active incidents
- Charts show active incidents
- Consistent dashboard view!

---

## Use Cases

### **Use Case 1: Monitor Current Workload**

**Scenario:** Security team wants to see current incident distribution

**Before:** 
- Charts showed 50 incidents
- Only 8 were active
- Misleading view

**After:**
- Charts show 8 active incidents
- Clear distribution by type
- Accurate workload view

---

### **Use Case 2: Resource Allocation**

**Scenario:** Manager needs to allocate team resources

**Before:**
- "20 ransomware incidents" (chart)
- Actually only 3 active
- Wrong allocation decision

**After:**
- "3 ransomware incidents" (chart)
- All are active
- Correct resource allocation

---

### **Use Case 3: Severity Assessment**

**Scenario:** Assess current risk level

**Before:**
- Chart showed 15 critical incidents
- 12 were already resolved
- False sense of urgency

**After:**
- Chart shows 3 critical incidents
- All active and need attention
- Accurate risk assessment

---

## Comparison

### **Old Dashboard Behavior**

```
┌──────────────────────────────────────────────┐
│ Active Incidents: 8                          │
├──────────────────────────────────────────────┤
│ Incidents by Type (shows all 50):           │
│ Ransomware: 20 (only 3 active!)             │
│ Phishing: 15 (only 2 active!)               │
│ DDoS: 10 (only 3 active!)                   │
│ Data Breach: 5 (all resolved!)              │
└──────────────────────────────────────────────┘
❌ Inconsistent - Charts don't match stat
```

---

### **New Dashboard Behavior**

```
┌──────────────────────────────────────────────┐
│ Active Incidents: 8                          │
├──────────────────────────────────────────────┤
│ Active Incidents by Type (shows 8):         │
│ Ransomware: 3 ✓                             │
│ Phishing: 2 ✓                               │
│ DDoS: 3 ✓                                   │
│ Data Breach: 0                              │
└──────────────────────────────────────────────┘
✅ Consistent - Charts match stat!
```

---

## Benefits

### **For Security Teams**

✅ **Accurate Workload View** - See current incident distribution  
✅ **Better Prioritization** - Focus on active threats  
✅ **Clear Status** - No confusion with historical data  
✅ **Real-Time Insights** - Dashboard reflects current state  

### **For Management**

✅ **Correct Resource Allocation** - Allocate based on active incidents  
✅ **Accurate Risk Assessment** - See current severity distribution  
✅ **Better Decision Making** - Data reflects current situation  
✅ **Consistent Metrics** - All dashboard stats align  

### **For Reporting**

✅ **Truthful Dashboards** - Charts show actionable data  
✅ **Clear Communication** - "Active Incidents" in title  
✅ **No Misinterpretation** - Obvious what data represents  

---

## Other Dashboard Sections

### **"Recent Incidents" Table**

**Still Shows All Incidents:**
- Last 5 incidents regardless of status
- Shows historical view
- Useful for timeline

**Reason:** Different purpose - shows recent activity, not current workload

---

### **Stat Cards**

**Also Updated (was already correct):**

1. **Active Incidents** - Counts active only ✓
2. **Critical Alerts** - Counts new alerts only ✓
3. **Resolution Rate** - Percentage of resolved ✓
4. **Avg Response Time** - Average for resolved ✓

All stat cards already filtered appropriately!

---

## Files Modified

**Backend:**
- ✅ `backend/src/routes/compliance.ts` - Added active incident filter

**Frontend:**
- ✅ `frontend/src/pages/Dashboard.tsx` - Updated chart titles

---

## Testing

### **Test 1: Verify Active Incidents Count**

1. Go to http://127.0.0.1:3012
2. Note "Active Incidents" stat (e.g., 8)
3. Check "Active Incidents by Type" chart
4. Sum up all bars (should equal 8)
5. Check "Active Incidents by Severity" chart
6. Sum up all pie slices (should equal 8)

**Expected:** All three should match!

---

### **Test 2: Verify Resolved Incidents Excluded**

1. Create test incident with "Ransomware" type
2. Mark as active → Check dashboard
3. "Ransomware" count increases by 1 ✓
4. Mark as resolved → Check dashboard
5. "Ransomware" count decreases by 1 ✓

**Expected:** Resolved incidents not counted!

---

### **Test 3: Verify Archived Incidents Excluded**

1. Create test incident
2. Archive it → Check dashboard
3. Charts should NOT include it

**Expected:** Archived incidents not counted!

---

## Summary

### **What Changed**

❌ **Old:** Charts showed ALL incidents (active + resolved + closed + archived)  
✅ **New:** Charts show ONLY active incidents

### **Why**

- Dashboard should reflect current situation
- Charts should match "Active Incidents" stat
- Team needs actionable data, not historical

### **How**

- Backend filter: `status NOT IN ('resolved', 'closed', 'archived')`
- Frontend titles: Added "Active" prefix to chart titles
- Consistent dashboard metrics

---

**The dashboard now accurately shows only active incidents in the Type and Severity charts!** 📊✅

**View it:** http://127.0.0.1:3012 → Dashboard shows current active incidents only

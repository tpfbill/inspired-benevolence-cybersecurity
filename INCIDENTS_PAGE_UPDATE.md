# Incidents Page Update - Filter-Based View

## Overview

The Incidents page has been updated to use **filter buttons** instead of displaying all incidents in three sequential sections. Users can now click Active, Resolved, or Archived to view only those specific incidents.

---

## What Changed

### **Before: Sequential Sections**

The old layout displayed all incidents in three sections stacked vertically:

```
┌─────────────────────────────────────────────┐
│ Security Incidents                          │
│ 🔶 3 Active  ✓ 5 Resolved  📦 12 Archived  │
├─────────────────────────────────────────────┤
│ Active Incidents                            │
│ - Incident 1                                │
│ - Incident 2                                │
│ - Incident 3                                │
│                                             │
│ Resolved Incidents                          │
│ - Incident 4                                │
│ - Incident 5                                │
│ - ... (5 more)                              │
│                                             │
│ Archived Incidents                          │
│ - Incident 6                                │
│ - Incident 7                                │
│ - ... (12 more)                             │
└─────────────────────────────────────────────┘
```

**Problem:** Long scrolling when many incidents exist

---

### **After: Filter-Based View**

The new layout uses clickable filter buttons:

```
┌─────────────────────────────────────────────┐
│ Security Incidents          [+ Create]      │
├─────────────────────────────────────────────┤
│ [🔶 Active 3] [✓ Resolved 5] [📦 Archived 12] │  ← FILTERS
├─────────────────────────────────────────────┤
│ Currently showing: Active Incidents         │
│ - Incident 1                                │
│ - Incident 2                                │
│ - Incident 3                                │
└─────────────────────────────────────────────┘
```

**Benefits:**
- ✅ Shorter page - only shows selected category
- ✅ Clearer focus on specific incident types
- ✅ Faster navigation
- ✅ Better UX for large incident lists

---

## How to Use

### **Filter Buttons**

**Three filter buttons at the top:**

1. **🔶 Active** (Orange)
   - Shows all active incidents
   - Statuses: detected, investigating, contained, eradicating, recovering
   - Default selected on page load

2. **✓ Resolved** (Green)
   - Shows completed incidents
   - Statuses: resolved, closed
   - Displays resolution time and post-mortem status

3. **📦 Archived** (Gray)
   - Shows archived incidents
   - Status: archived
   - Displays archive reason and timestamp
   - Slightly reduced opacity (70%)

### **Visual Feedback**

**Active Filter:**
- Bold, bright color (orange/green/gray)
- Larger scale (scale-105)
- Shadow effect
- White badge with colored text

**Inactive Filters:**
- Lighter color (pastel background)
- Smaller scale
- Colored badge
- Hover effect

---

## Filter Button States

### **Active Filter Selected**

```
[🔶 Active 3]  ← Bold orange, white badge, shadow
[✓ Resolved 5] ← Light green, no shadow
[📦 Archived 12] ← Light gray, no shadow
```

### **Resolved Filter Selected**

```
[🔶 Active 3]  ← Light orange, no shadow
[✓ Resolved 5] ← Bold green, white badge, shadow
[📦 Archived 12] ← Light gray, no shadow
```

### **Archived Filter Selected**

```
[🔶 Active 3]  ← Light orange, no shadow
[✓ Resolved 5] ← Light green, no shadow
[📦 Archived 12] ← Bold gray, white badge, shadow
```

---

## Incident Display

### **Active Incidents**

**Badges:**
- Status badge (orange/yellow/red based on status)
- Severity badge (critical/high/medium/low)
- Incident type badge
- Escalation badge (if escalated)

**Playbook Display:**
- Blue background (active)
- Progress bar
- Percentage complete

**Footer:**
- Detection time
- Affected systems count

---

### **Resolved Incidents**

**Badges:**
- Status badge (green "RESOLVED" or "CLOSED")
- Severity badge
- Incident type badge

**Playbook Display:**
- Green background (completed)
- Progress bar (typically 100%)
- Checkmark icon

**Footer:**
- Resolution time
- Post-mortem status (if completed)

**Styling:**
- Slightly reduced opacity (80%)

---

### **Archived Incidents**

**Badges:**
- "ARCHIVED" badge (gray)
- Severity badge
- Incident type badge

**Playbook Display:**
- Gray background
- No progress bar (static)
- Archive icon

**Footer:**
- Archive timestamp
- Archive reason (if provided)

**Styling:**
- Reduced opacity (70%)
- Grayed out appearance

---

## Empty States

### **No Active Incidents**

```
┌─────────────────────────────────────────────┐
│              🛡️                             │
│                                             │
│        No Active Incidents                  │
│  No active incidents at this time.          │
│                                             │
└─────────────────────────────────────────────┘
```

### **No Resolved Incidents**

```
┌─────────────────────────────────────────────┐
│              🛡️                             │
│                                             │
│       No Resolved Incidents                 │
│       No resolved incidents yet.            │
│                                             │
└─────────────────────────────────────────────┘
```

### **No Archived Incidents**

```
┌─────────────────────────────────────────────┐
│              🛡️                             │
│                                             │
│       No Archived Incidents                 │
│       No archived incidents yet.            │
│                                             │
└─────────────────────────────────────────────┘
```

---

## Technical Implementation

### **State Management**

```typescript
type FilterType = 'active' | 'resolved' | 'archived';

const [activeFilter, setActiveFilter] = useState<FilterType>('active');
```

**Default:** 'active' (shows active incidents by default)

### **Filtering Logic**

```typescript
// Calculate all incident categories
const activeIncidents = incidents?.filter((i: any) => 
  !['resolved', 'closed', 'archived'].includes(i.status)
) || [];

const resolvedIncidents = incidents?.filter((i: any) => 
  ['resolved', 'closed'].includes(i.status)
) || [];

const archivedIncidents = incidents?.filter((i: any) => 
  i.status === 'archived'
) || [];

// Show only filtered incidents
const filteredIncidents = activeFilter === 'active' 
  ? activeIncidents 
  : activeFilter === 'resolved' 
  ? resolvedIncidents 
  : archivedIncidents;
```

### **Button Click Handler**

```typescript
onClick={() => setActiveFilter('active')}
onClick={() => setActiveFilter('resolved')}
onClick={() => setActiveFilter('archived')}
```

### **Conditional Styling**

```typescript
className={`px-4 py-2 rounded-lg ... ${
  activeFilter === 'active'
    ? 'bg-orange-600 text-white shadow-lg scale-105'
    : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
}`}
```

---

## Benefits

### **User Experience**

✅ **Faster Navigation** - Click to view specific category  
✅ **Clearer Focus** - Only see what you need  
✅ **Less Scrolling** - Especially with many incidents  
✅ **Visual Clarity** - Active filter clearly highlighted  

### **Performance**

✅ **Smaller DOM** - Only renders filtered incidents  
✅ **Faster Rendering** - Fewer elements on page  
✅ **Better Scrolling** - Less content to scroll through  

### **Scalability**

✅ **Handles Growth** - Works well with 100+ incidents  
✅ **Organized View** - Clear separation of categories  
✅ **Easy Navigation** - One click to switch views  

---

## Comparison

### **Old Approach**

**Pros:**
- See all incidents at once
- Good for small incident count

**Cons:**
- Long scrolling with many incidents
- Hard to find specific incidents
- Performance impact with large lists
- Cluttered interface

### **New Approach**

**Pros:**
- Clean, focused view
- Fast navigation
- Scales well
- Better performance
- Clear visual feedback

**Cons:**
- Can't see all categories at once (minor)
- One extra click to switch views (acceptable trade-off)

---

## Usage Examples

### **Example 1: Check Active Incidents**

1. Go to http://127.0.0.1:3012/incidents
2. Page loads with **Active** filter selected by default
3. See all active incidents immediately
4. Badge shows count: "🔶 Active 3"

### **Example 2: Review Resolved Incidents**

1. On Incidents page
2. Click **"✓ Resolved 5"** button
3. Active incidents disappear
4. Resolved incidents display
5. Button highlighted in green
6. See resolution times and post-mortem status

### **Example 3: View Archived Incidents**

1. On Incidents page
2. Click **"📦 Archived 12"** button
3. All archived incidents display
4. Button highlighted in gray
5. See archive reasons and timestamps
6. Grayed-out appearance for archived items

### **Example 4: Switch Between Filters**

1. Start on Active (3 incidents shown)
2. Click Resolved → See 5 different incidents
3. Click Archived → See 12 different incidents
4. Click Active → Back to original 3 incidents

**Fast and responsive!**

---

## Files Modified

**Frontend:**
- ✅ `frontend/src/pages/Incidents.tsx` - Complete rewrite with filter functionality

**Changes:**
- Added FilterType type
- Added activeFilter state
- Added filter buttons with counts
- Implemented filtering logic
- Single incident list (instead of three)
- Conditional styling based on status
- Empty state messages per filter

---

## Future Enhancements

### **Possible Additions**

1. **"All" Filter** - View all incidents at once
2. **URL Parameters** - Save filter state in URL (`?filter=resolved`)
3. **Search/Sort** - Within filtered view
4. **Keyboard Shortcuts** - Alt+1/2/3 for filters
5. **Custom Filters** - Create saved filter combinations
6. **Filter Memory** - Remember last selected filter

---

## Summary

### **What Was Changed**

❌ **Old:** Three sequential sections (Active, Resolved, Archived)  
✅ **New:** Three filter buttons with single filtered list

### **How It Works**

1. Click filter button (Active, Resolved, or Archived)
2. Page shows only incidents matching that filter
3. Filter button highlights to show selection
4. Badge shows count for each category

### **Why It's Better**

- ✅ Cleaner interface
- ✅ Faster navigation
- ✅ Less scrolling
- ✅ Better for large incident lists
- ✅ Clear visual feedback

---

**The Incidents page now uses filter buttons for a cleaner, more focused viewing experience!** 🎯

**Try it:** http://127.0.0.1:3012/incidents → Click the filter buttons!

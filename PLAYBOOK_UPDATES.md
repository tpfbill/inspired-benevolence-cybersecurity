# Playbook Structure Updates - Phase-Based Incident Response

## Overview

The playbook system has been completely restructured to follow the **NIST Incident Response Framework** with proper phases, tasks, subtasks, work roles, and outcomes.

---

## New Playbook Structure

### **5 Incident Response Phases**

1. **Identification** - Detect and identify the incident
2. **Containment** - Contain the threat to prevent spread
3. **Eradication** - Remove the threat from systems
4. **Recovery** - Restore systems to normal operation
5. **Lessons Learned** - Document and improve processes

---

### **Hierarchical Task Structure**

```
Playbook
├── Phase (Identification, Containment, etc.)
│   ├── Phase Description
│   └── Tasks []
│       ├── Task
│       │   ├── Title
│       │   ├── Description
│       │   ├── Preferred Work Role
│       │   ├── Estimated Time
│       │   ├── Expected Outcome
│       │   └── Subtasks []
│       │       ├── Subtask
│       │       │   ├── Title
│       │       │   ├── Description
│       │       │   ├── Preferred Work Role
│       │       │   ├── Estimated Time
│       │       │   └── Expected Outcome
```

---

## Work Roles

The system now includes defined work roles for task assignment:

- **Security Analyst** - Front-line security operations
- **IT Director** - IT management and approvals
- **Legal** - Legal review and compliance
- **Human Resources** - HR-related incidents
- **Executive** - Executive decisions and approvals
- **Administrator** - System administration
- **Communications** - Internal/external communications

---

## Key Features

### **1. Phase-Based Organization**
- All playbooks organized into 5 standard incident response phases
- Each phase has a description explaining its purpose
- Visual indicators with color coding per phase

### **2. Tasks with Context**
- **Title**: Clear, action-oriented task name
- **Description**: Detailed instructions on what to do
- **Preferred Work Role**: Who should typically perform this task
- **Estimated Time**: How long the task should take
- **Expected Outcome**: What should be accomplished

### **3. Subtasks for Detail**
- Break down complex tasks into manageable steps
- Each subtask has the same attributes as tasks
- Visual hierarchy shows parent-child relationships
- Nested structure for clarity

### **4. Work Role Assignment**
- Each task/subtask indicates the preferred work role
- System can suggest assignees based on work role
- Multiple people can have the same work role
- Clear accountability and responsibility

### **5. Outcomes Tracking**
- Expected outcome defined for each task/subtask
- Helps verify task completion
- Provides success criteria
- Supports quality assurance

---

## Technical Changes

### **Database Schema**

Added new column to `playbooks` table:
```sql
ALTER TABLE playbooks ADD COLUMN phases JSONB DEFAULT '[]'::jsonb;
```

The `steps` column is maintained for backward compatibility.

### **Backend Model**

**File:** `backend/src/models/Playbook.ts`

Added interfaces:
- `IncidentPhase` enum - 5 standard phases
- `WorkRole` enum - 7 work roles
- `PlaybookSubtask` - Subtask structure
- `PlaybookTask` - Task structure
- `PlaybookPhase` - Phase structure

### **Frontend Components**

**New Files Created:**

1. **`frontend/src/pages/PlaybookEditorNew.tsx`**
   - Complete rewrite of playbook editor
   - Phase-based interface with collapsible sections
   - Add/edit/delete tasks and subtasks
   - Work role selection
   - Outcome fields
   - Visual hierarchy
   - Drag-and-drop ready

2. **`frontend/src/pages/PlaybookDetail.tsx`**
   - Beautiful phase-based display
   - Color-coded phases
   - Task cards with metadata
   - Subtask nested display
   - Work role badges
   - Time estimates
   - Expected outcomes

**Updated Files:**

1. **`frontend/src/App.tsx`**
   - Routes updated to use `PlaybookEditorNew`
   - Maintains existing URL structure

---

## User Interface

### **Playbook Editor**

**Phase Section:**
- All 5 phases pre-loaded
- Collapsible phase sections
- Phase description field
- "Add Task" button per phase

**Task Cards:**
- Task number badge
- Title and description fields
- Work role dropdown
- Estimated time input
- Outcome textarea
- "Add Subtask" button
- Delete task button

**Subtask Cards:**
- Nested under parent task
- Same fields as tasks (scaled down)
- Visual indentation
- Sequential numbering (1.1, 1.2, etc.)
- Delete subtask button

**Visual Design:**
- Color-coded phases:
  - Identification: Blue
  - Containment: Yellow
  - Eradication: Orange
  - Recovery: Green
  - Lessons Learned: Purple
- Clear hierarchy with borders and indentation
- Responsive layout
- Professional styling

### **Playbook Display**

**Phase View:**
- Full phase information
- Phase counter (Phase 1, Phase 2, etc.)
- Phase description
- Task count

**Task View:**
- Task title and description
- Metadata grid showing:
  - Preferred work role with icon
  - Estimated time
  - Expected outcome
- Professional card design

**Subtask View:**
- Nested under parent task
- Border-left indicator
- Sequential numbering
- All subtask details
- Compact but readable

---

## Example Playbook Structure

### **Ransomware Incident Response**

**Phase 1: Identification**
- Description: "Detect and confirm ransomware infection"
- Task 1: Initial Alert Triage
  - Role: Security Analyst
  - Time: 15 minutes
  - Outcome: Incident confirmed and categorized
  - Subtask 1.1: Review alert details
  - Subtask 1.2: Check affected systems
  - Subtask 1.3: Confirm ransomware signatures

**Phase 2: Containment**
- Description: "Isolate infected systems to prevent spread"
- Task 1: Network Isolation
  - Role: IT Director
  - Time: 10 minutes
  - Outcome: Affected systems disconnected from network
  - Subtask 1.1: Disable network adapters
  - Subtask 1.2: Block IP addresses
  - Subtask 1.3: Verify isolation

**Phase 3: Eradication**
- Description: "Remove ransomware from affected systems"
- Task 1: Malware Removal
  - Role: Security Analyst
  - Time: 2 hours
  - Outcome: All ransomware removed and verified clean

**Phase 4: Recovery**
- Description: "Restore systems to normal operation"
- Task 1: System Restoration
  - Role: IT Director
  - Time: 4 hours
  - Outcome: Systems operational and verified

**Phase 5: Lessons Learned**
- Description: "Document incident and improve processes"
- Task 1: Post-Incident Review
  - Role: Executive
  - Time: 1 hour
  - Outcome: Incident report completed with recommendations

---

## Migration Path

### **Existing Playbooks**

- Old playbooks with `steps` field continue to work
- Editor shows migration prompt for old playbooks
- Edit any playbook to convert to new structure
- No data loss during migration

### **New Playbooks**

- All new playbooks use phase-based structure
- Pre-populated with 5 standard phases
- Start with empty task lists
- Build from scratch with new interface

---

## Benefits

1. **NIST Compliance** - Follows NIST 800-61 framework
2. **Clear Structure** - Organized by incident response phases
3. **Better Accountability** - Work roles clearly defined
4. **Granular Control** - Tasks can be broken into subtasks
5. **Success Criteria** - Expected outcomes for verification
6. **Time Planning** - Estimated times for resource planning
7. **Professional Appearance** - Clean, organized interface
8. **Scalability** - Structure supports complex playbooks

---

## Next Steps

### **To Create a New Playbook:**

1. Navigate to **Playbooks** page
2. Click **"Create Playbook"**
3. Fill in basic information (name, description, incident type)
4. Expand each phase
5. Add tasks to relevant phases
6. Fill in task details (title, description, work role, time, outcome)
7. Add subtasks if needed
8. Save playbook

### **To View a Playbook:**

1. Click on any playbook from the list
2. See all phases organized visually
3. Review tasks and subtasks
4. Check work role assignments
5. View expected outcomes
6. Edit to make changes

---

## Application Access

**URL:** http://127.0.0.1:3012  
**Login:** admin@example.com / admin123  

**Navigate to:** Playbooks → Create Playbook

---

## Files Modified/Created

### **Backend:**
- ✅ `backend/src/models/Playbook.ts` - Updated model with new interfaces
- ✅ Database: Added `phases` column to `playbooks` table

### **Frontend:**
- ✅ `frontend/src/pages/PlaybookEditorNew.tsx` - New phase-based editor (NEW)
- ✅ `frontend/src/pages/PlaybookDetail.tsx` - New phase-based viewer (NEW)
- ✅ `frontend/src/App.tsx` - Updated routes

### **Documentation:**
- ✅ `PLAYBOOK_UPDATES.md` - This file

---

**The playbook system is now ready for use with the new phase-based structure!** 🎉

Go to http://127.0.0.1:3012 and try creating a new playbook to see the changes.

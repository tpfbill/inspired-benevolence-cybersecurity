# Active Playbook Execution & Tracking Feature

## Overview

The IB Cybersecurity platform now includes a comprehensive **Active Playbook Execution** system that allows teams to track incident response progress in real-time with task completion checkboxes, progress indicators, and playbook snapshots.

---

## Key Features

### ✅ **1. Playbook Snapshot Storage**

When an incident is created with a playbook, the system automatically stores a **snapshot** of the playbook at that moment:

- **Why**: Editing the playbook template doesn't affect active incidents
- **Audit Trail**: Complete record of what playbook version was used
- **Consistency**: All team members see the same playbook during response
- **Storage**: JSONB field in incidents table (`playbookSnapshot`)

### ✅ **2. Real-Time Task Completion Tracking**

Track completion status for every task and subtask during incident response:

- **Checkboxes**: Click to mark tasks complete/incomplete
- **Progress Bars**: Visual indicators at phase and overall level
- **Completion Data**: Who completed it and when
- **Persistence**: All progress saved to database
- **Real-Time Updates**: 5-second refresh interval

### ✅ **3. Active Playbook View**

Dedicated interface for executing playbooks during active incidents:

- **Phase-Based Layout**: All 5 NIST phases displayed
- **Collapsible Sections**: Expand/collapse phases and tasks
- **Progress Summary**: Overall completion percentage
- **Phase Progress**: Individual progress per phase
- **Task Metadata**: Work roles, time estimates, expected outcomes
- **Subtask Support**: Nested subtasks with completion tracking

### ✅ **4. Tabbed Interface**

Switch between two views in the incident detail page:

- **Active Playbook Tab**: Phase-based execution view with checkboxes
- **Task List Tab**: Traditional flat task list (legacy view)
- **Smart Display**: Tabs only appear if incident has playbook

### ✅ **5. Role-Based Permissions** (Implemented for future use)

Framework ready for role-based editing:

- **Active Incidents**: Anyone assigned can update progress
- **Closed Incidents**: Only admins can modify (ready to implement)
- **Audit Trail**: All changes tracked with user ID and timestamp

---

## Database Schema

### **New Table: `incident_task_progress`**

Tracks task completion for each incident:

```sql
CREATE TABLE incident_task_progress (
  id UUID PRIMARY KEY,
  "incidentId" UUID REFERENCES incidents(id),
  phase VARCHAR(50),              -- e.g., 'identification'
  "taskId" VARCHAR(100),           -- e.g., 'task-12345'
  "subtaskId" VARCHAR(100),        -- optional, e.g., 'subtask-67890'
  completed BOOLEAN DEFAULT FALSE,
  "completedBy" UUID REFERENCES users(id),
  "completedAt" TIMESTAMP,
  notes TEXT,
  "createdAt" TIMESTAMP,
  "updatedAt" TIMESTAMP
);
```

### **Updated Table: `incidents`**

Added playbook snapshot storage:

```sql
ALTER TABLE incidents 
ADD COLUMN "playbookSnapshot" JSONB DEFAULT NULL;
```

The snapshot includes:
- Playbook ID, name, description
- Full phases array with tasks and subtasks
- Version number
- Timestamp when snapshot was taken

---

## API Endpoints

### **Task Progress Endpoints**

#### **GET** `/api/task-progress/incident/:incidentId`
Get all task progress for an incident.

**Response:**
```json
[
  {
    "id": "uuid",
    "incidentId": "uuid",
    "phase": "identification",
    "taskId": "task-123",
    "subtaskId": null,
    "completed": true,
    "completedBy": "user-uuid",
    "completedAt": "2026-03-16T20:45:00Z",
    "notes": null
  }
]
```

#### **POST** `/api/task-progress`
Create or update task completion status.

**Request:**
```json
{
  "incidentId": "uuid",
  "phase": "containment",
  "taskId": "task-456",
  "subtaskId": "subtask-789",  // optional
  "completed": true,
  "notes": "Task completed successfully"
}
```

#### **GET** `/api/task-progress/incident/:incidentId/summary`
Get progress summary with percentages.

**Response:**
```json
{
  "total": 15,
  "completed": 8,
  "pending": 7,
  "percentComplete": 53,
  "byPhase": {
    "identification": { "total": 3, "completed": 3, "pending": 0 },
    "containment": { "total": 4, "completed": 2, "pending": 2 },
    "eradication": { "total": 3, "completed": 1, "pending": 2 },
    "recovery": { "total": 3, "completed": 2, "pending": 1 },
    "lessons_learned": { "total": 2, "completed": 0, "pending": 2 }
  }
}
```

---

## User Interface

### **Active Playbook View Components**

#### **1. Progress Summary Card**
Top section showing overall progress:
- Total tasks completed (e.g., "8 of 15 tasks completed")
- Percentage (e.g., "53%")
- Progress bar (visual indicator)
- Gradient blue background

#### **2. Playbook Info Card**
Displays playbook metadata:
- Playbook name
- Description
- Version number
- Snapshot timestamp (future enhancement)

#### **3. Phase Sections**
Each phase has:
- **Phase Badge**: Number (1-5) in colored circle
- **Phase Name**: Identification, Containment, etc.
- **Phase Description**: Custom description from playbook
- **Phase Progress**: Mini progress bar + percentage
- **Task Count**: "3/5 tasks"
- **Expand/Collapse**: Chevron icon

**Phase Colors:**
- 🔵 Identification: Blue (`bg-blue-500`)
- 🟡 Containment: Yellow (`bg-yellow-500`)
- 🟠 Eradication: Orange (`bg-orange-500`)
- 🟢 Recovery: Green (`bg-green-500`)
- 🟣 Lessons Learned: Purple (`bg-purple-500`)

#### **4. Task Cards**
Within each phase:
- **Checkbox**: Click to toggle completion
  - ✅ Green checkmark when complete
  - ⭕ Gray circle when pending
- **Task Badge**: "Task 1", "Task 2", etc.
- **Task Title**: Bold, strike-through when complete
- **Description**: Gray text, lighter when complete
- **Metadata Icons**:
  - 👥 Preferred work role
  - ⏱️ Estimated time
  - 🎯 Expected outcome
- **Subtask Toggle**: "Show/Hide N subtasks"

#### **5. Subtask Cards**
Nested under parent tasks:
- Smaller checkboxes
- Sequential numbering (1.1, 1.2, etc.)
- Light blue background
- Same metadata as tasks
- Indented with left border

---

## How It Works

### **Creating an Incident with Playbook**

1. User creates new incident
2. Selects a playbook from dropdown
3. **Backend automatically**:
   - Fetches full playbook from database
   - Creates snapshot object with all phases/tasks
   - Stores snapshot in `incident.playbookSnapshot`
   - Stores playbook ID in `incident.playbookId`
4. Incident saved with both reference and snapshot

### **Viewing Active Playbook**

1. User opens incident detail page
2. System checks if incident has playbook
3. **If yes**:
   - Shows tabbed interface
   - Default tab: "Active Playbook"
   - Loads progress from `incident_task_progress` table
   - Displays playbook from snapshot (not current template)
4. **If no**:
   - Hides tabs
   - Shows traditional task list only

### **Completing a Task**

1. User clicks checkbox next to task/subtask
2. **Frontend**:
   - Sends POST to `/api/task-progress`
   - Includes: incidentId, phase, taskId, subtaskId (if applicable), completed status
3. **Backend**:
   - Checks if progress record exists
   - If exists: Updates `completed`, `completedBy`, `completedAt`
   - If not: Creates new record
   - Returns updated progress
4. **Frontend**:
   - Invalidates cache
   - Refetches progress (includes all tasks)
   - Refetches summary (percentages recalculated)
   - UI updates automatically (React Query)

### **Progress Calculation**

**Overall Progress:**
```
percentComplete = (completed tasks / total tasks) * 100
```

**Phase Progress:**
- Each phase calculates its own percentage
- Counts tasks + subtasks in that phase
- Shows mini progress bar per phase

---

## Code Structure

### **Backend Files**

#### **Models:**
- `backend/src/models/Incident.ts` - Updated with `playbookSnapshot` field
- `backend/src/models/TaskProgress.ts` - New model for tracking
- `backend/src/models/Playbook.ts` - Existing, with phase structure

#### **Routes:**
- `backend/src/routes/incidents.ts` - Updated to store snapshot on creation
- `backend/src/routes/taskProgress.ts` - New routes for progress tracking

#### **Index:**
- `backend/src/index.ts` - Registered new task progress routes

### **Frontend Files**

#### **Components:**
- `frontend/src/components/ActivePlaybookView.tsx` - **NEW** - Main active playbook component

#### **Pages:**
- `frontend/src/pages/IncidentDetail.tsx` - Updated with tabbed interface
- `frontend/src/pages/PlaybookEditorNew.tsx` - Phase-based playbook editor
- `frontend/src/pages/PlaybookDetail.tsx` - Phase-based playbook viewer

---

## Usage Guide

### **For Incident Responders**

#### **1. Start Incident Response**
- Navigate to incident detail page
- Click "Active Playbook" tab (default view)
- See all phases and tasks laid out

#### **2. Work Through Tasks**
- Expand the first phase (e.g., Identification)
- Read task descriptions and expected outcomes
- Complete tasks by clicking checkboxes
- Progress bars update automatically
- Move to next phase when ready

#### **3. Track Progress**
- Top summary shows overall completion %
- Each phase shows its own progress
- Green checkmarks indicate completion
- Strike-through text for completed items

#### **4. Collaborate with Team**
- All team members see same playbook
- Progress updates visible to everyone
- Work roles guide task assignment
- Time estimates help planning

### **For Administrators**

#### **1. Create Playbooks**
- Go to Playbooks page
- Click "Create Playbook"
- Fill in phases, tasks, subtasks
- Add work roles and outcomes
- Save template

#### **2. Assign Playbooks to Incidents**
- When creating incident, select playbook
- System automatically creates snapshot
- Editing template won't affect active incidents

#### **3. Review Completed Incidents**
- Open closed incident
- View playbook that was used (snapshot preserved)
- See completion data (who, when)
- Export for audit reports (future enhancement)

---

## Benefits

### **For Teams**

✅ **Clear Structure**: NIST-based phases provide framework  
✅ **Progress Visibility**: Everyone knows what's done  
✅ **Accountability**: Track who completed what  
✅ **Consistency**: Same playbook for all responders  
✅ **Flexibility**: Edit templates without affecting active work  

### **For Management**

✅ **Real-Time Oversight**: See response progress live  
✅ **Performance Metrics**: Completion times and rates  
✅ **Compliance**: Audit trail of actions taken  
✅ **Training**: Historical data for improvement  
✅ **Reporting**: Export playbook execution data  

### **For Auditors**

✅ **Complete Record**: Snapshot of playbook used  
✅ **Timeline**: When tasks were completed  
✅ **Attribution**: Who performed each task  
✅ **Immutability**: Snapshots don't change  
✅ **Standards**: NIST framework alignment  

---

## Future Enhancements

### **Planned Features**

1. **PDF Export**: Generate playbook execution report
2. **Time Tracking**: Actual vs estimated time per task
3. **Comments**: Add notes to individual tasks
4. **Attachments**: Upload evidence to tasks
5. **Automated Status**: Auto-update incident status based on phase
6. **Notifications**: Alert assignees when tasks ready
7. **Templates**: Pre-fill common subtasks
8. **Analytics**: Playbook effectiveness metrics

### **Technical Improvements**

1. **WebSocket Updates**: Real-time progress without refresh
2. **Offline Support**: Complete tasks while disconnected
3. **Mobile App**: Native iOS/Android support
4. **API Webhooks**: Integrate with external tools
5. **Bulk Operations**: Mark multiple tasks complete
6. **Drag & Drop**: Reorder tasks during execution
7. **Keyboard Shortcuts**: Quick task completion
8. **Dark Mode**: Theme support for 24/7 operations

---

## Testing the Feature

### **Test Scenario: Ransomware Incident Response**

#### **Step 1: Create Ransomware Playbook**
1. Navigate to http://127.0.0.1:3012/playbooks
2. Click "Create Playbook"
3. Fill in:
   - Name: "Ransomware Response Playbook"
   - Description: "Standard response procedure for ransomware incidents"
   - Type: Ransomware
4. Add tasks to each phase:

**Identification Phase:**
- Task: "Initial Alert Triage"
  - Description: "Review ransomware alert and confirm infection"
  - Role: Security Analyst
  - Time: "15 minutes"
  - Outcome: "Incident confirmed and categorized"
  - Subtask: "Check alert source"
  - Subtask: "Verify ransomware signatures"

**Containment Phase:**
- Task: "Network Isolation"
  - Description: "Disconnect affected systems from network"
  - Role: IT Director
  - Time: "10 minutes"
  - Outcome: "Infected systems isolated"

**Eradication Phase:**
- Task: "Remove Ransomware"
  - Description: "Clean malware from affected systems"
  - Role: Security Analyst
  - Time: "2 hours"
  - Outcome: "All ransomware removed"

**Recovery Phase:**
- Task: "Restore from Backup"
  - Description: "Restore encrypted files from backups"
  - Role: IT Director
  - Time: "4 hours"
  - Outcome: "Systems restored and operational"

**Lessons Learned Phase:**
- Task: "Post-Incident Review"
  - Description: "Document incident and recommendations"
  - Role: Executive
  - Time: "1 hour"
  - Outcome: "Report completed"

5. Save playbook

#### **Step 2: Create Test Incident**
1. Navigate to http://127.0.0.1:3012/incidents
2. Click "Create Incident"
3. Fill in:
   - Title: "Ransomware Detected - Accounting Department"
   - Description: "Multiple workstations showing ransomware encryption"
   - Type: Ransomware
   - Severity: Critical
   - **Playbook: Select "Ransomware Response Playbook"**
4. Save incident

#### **Step 3: Execute Active Playbook**
1. Open the new incident
2. You should see "Active Playbook" tab (default)
3. See progress summary showing "0 of X tasks completed"
4. Expand "Identification" phase
5. Click checkbox next to "Initial Alert Triage"
6. Watch progress bar update
7. Expand "Check alert source" subtask
8. Click its checkbox
9. See overall progress increase
10. Continue through all phases

#### **Step 4: Verify Snapshot**
1. Edit the original playbook template
2. Change a task title
3. Go back to the incident
4. Confirm the incident still shows original task titles (snapshot)

---

## Troubleshooting

### **Issue: Tabs Not Showing**

**Cause**: Incident doesn't have playbook assigned  
**Solution**: Edit incident and assign a playbook

### **Issue: Checkboxes Not Updating**

**Cause**: Network/CORS error  
**Solution**: Check browser console, verify backend running

### **Issue: Progress Shows 0%**

**Cause**: No tasks marked complete yet  
**Solution**: This is expected for new incidents

### **Issue: Old Incidents Missing Snapshot**

**Cause**: Created before this feature  
**Solution**: Snapshot only for new incidents going forward

---

## Summary

The Active Playbook Execution system provides a **complete incident response workflow** with:

- ✅ **Playbook snapshots** stored with each incident
- ✅ **Real-time progress tracking** with checkboxes
- ✅ **Visual progress indicators** at all levels
- ✅ **Phase-based NIST structure** for consistency
- ✅ **Audit trail** of all task completions
- ✅ **Team collaboration** with shared view

**Ready to use at: http://127.0.0.1:3012** 🎉

Log in with: admin@example.com / admin123

Try creating a playbook and incident to see it in action!

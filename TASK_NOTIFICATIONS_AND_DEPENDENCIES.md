# Task Notifications & Dependencies Feature

## Overview

The IB Cybersecurity platform now includes **automated task notifications** with **dependency management**. Tasks are automatically emailed to users with the appropriate work role, and dependent tasks are only sent once their prerequisites are completed.

---

## Key Features

### ✅ **1. Task Dependencies**

Define which tasks must be completed before others can begin:

- **Dropdown Selection**: Choose predecessor tasks from all phases
- **Multiple Dependencies**: Tasks can depend on multiple predecessors
- **Smart Notifications**: Users only notified when ALL dependencies satisfied
- **Visual Editor**: Easy-to-use interface in playbook editor

### ✅ **2. Automatic Email Notifications**

Tasks are automatically emailed to the right people:

- **Work Role Based**: Emails sent to all users with the task's work role
- **Beautiful HTML Emails**: Professional, branded email templates
- **Incident Links**: Clickable links directly to incident detail page
- **Task Details**: Full description, estimated time, expected outcome

### ✅ **3. Smart Notification Timing**

Notifications sent at the right time:

- **On Incident Creation**: Tasks without dependencies emailed immediately
- **On Task Completion**: Dependent tasks emailed when prerequisites done
- **Manual Trigger**: "Send Notifications" button for manual control
- **No Duplicates**: Users never receive the same notification twice

### ✅ **4. Test Mode**

Safe testing without sending real emails:

- **Console Logging**: Emails logged to backend console
- **SMTP Optional**: Works without email configuration
- **Easy Setup**: Configure SMTP credentials when ready

---

## How It Works

### **Task Dependencies**

**In Playbook Editor:**
1. Create/edit a playbook
2. Add tasks to phases
3. For each task, use the "Task Dependencies" dropdown
4. Select which tasks must be completed first
5. Hold Ctrl/Cmd to select multiple dependencies

**Example:**
```
Phase 1: Identification
  Task 1: Analyze Alert (no dependencies)
  Task 2: Assess Impact (no dependencies)

Phase 2: Containment
  Task 3: Isolate Systems (depends on: Task 1, Task 2)
  Task 4: Preserve Evidence (depends on: Task 3)
```

**Result:**
- Tasks 1 & 2: Emailed immediately when incident created
- Task 3: Emailed only after Tasks 1 AND 2 completed
- Task 4: Emailed only after Task 3 completed

### **Email Notifications**

**Automatic Sending:**

1. **Incident Created** → System checks playbook snapshot
2. **Finds tasks without dependencies** → Emails sent to users with matching work roles
3. **User completes task** → System checks for dependent tasks
4. **Dependencies satisfied** → Emails sent for newly available tasks

**Manual Sending:**

1. Open incident detail page
2. Click **"📧 Send Task Notifications"** button
3. System sends emails for all ready tasks
4. Alert shows: "✅ Sent X notifications, Y tasks skipped"

---

## Email Configuration

### **Test Mode (Default)**

No configuration needed! Emails are logged to console:

```
📧 [TEST MODE] Email would be sent:
   To: john@example.com
   Subject: 🔔 Task Assigned: Analyze Alert
   Body: You have been assigned a task...
```

### **Production Mode (SMTP)**

Configure in `backend/.env`:

```env
# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EMAIL_FROM=IB Cybersecurity <noreply@ibcybersecurity.com>
APP_URL=http://127.0.0.1:3012
```

**For Gmail:**
1. Enable 2-Factor Authentication
2. Generate App Password: https://myaccount.google.com/apppasswords
3. Use App Password (not regular password)

**For Office 365/Outlook:**
```env
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_USER=your-email@company.com
SMTP_PASSWORD=your-password
```

**For SendGrid:**
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=your-sendgrid-api-key
```

---

## Email Template

Users receive beautiful HTML emails with:

### **Header**
- Purple gradient banner
- "🔔 New Task Assigned"
- Incident response context

### **Incident Info**
- Incident title
- Phase badge (color-coded)

### **Task Details**
- Task title (bold)
- Description
- ⏱️ Estimated Time
- 🎯 Expected Outcome
- Preferred work role

### **Call to Action**
- Blue button: "View Incident & Complete Task →"
- Clickable link to incident detail page

### **Footer**
- Branding
- Copyright notice

---

## User Workflow

### **As a Security Analyst:**

**Morning:**
1. Receive email: "🔔 Task Assigned: Analyze Alert"
2. Click link → Opens incident in browser
3. See Active Playbook tab
4. Find your task (highlighted for your role)
5. Complete the work
6. Click checkbox to mark complete ✅

**Immediately:**
- System detects completion
- Checks for dependent tasks
- IT Director receives email: "🔔 Task Assigned: Isolate Systems"
- They can now begin their task

### **As an Admin:**

**Create Incident:**
1. Fill in incident details
2. Select playbook
3. Create incident

**Automatic:**
- System sends notifications for all tasks without dependencies
- Progress tracked automatically

**Optional - Send More Notifications:**
1. Open incident
2. Click "📧 Send Task Notifications"
3. Alerts show: "Sent 3 notifications"

---

## API Endpoints

### **POST** `/api/notifications/incident/:incidentId/notify`

Send notifications for all ready tasks.

**Response:**
```json
{
  "success": true,
  "message": "Sent 5 notifications",
  "total": 10,
  "notified": 5,
  "skipped": 5
}
```

### **GET** `/api/notifications/status`

Check email service status.

**Response:**
```json
{
  "configured": false,
  "mode": "test (logs only)",
  "message": "Email service in test mode. Configure SMTP in .env to send real emails."
}
```

### **DELETE** `/api/notifications/incident/:incidentId/history`

Clear notification history (for testing).

**Response:**
```json
{
  "success": true,
  "message": "Notification history cleared"
}
```

---

## Database Schema

### **Playbook Tasks (JSONB)**

```typescript
interface PlaybookTask {
  id: string;
  title: string;
  description: string;
  workRole: 'security_analyst' | 'it_director' | 'legal' | ...;
  estimatedTime?: string;
  outcome?: string;
  dependsOn?: string[]; // Array of task IDs
  subtasks: PlaybookSubtask[];
}

interface PlaybookSubtask {
  id: string;
  title: string;
  description: string;
  workRole: string;
  estimatedTime?: string;
  outcome?: string;
  dependsOn?: string[]; // Array of subtask IDs
}
```

### **Task Progress (Existing Table)**

Used to track which tasks are completed:

```sql
SELECT * FROM incident_task_progress 
WHERE "incidentId" = 'xxx' AND completed = true;
```

---

## Code Architecture

### **Backend Services**

#### **`emailService.ts`**
- Manages SMTP connection
- Sends emails via nodemailer
- Handles test mode (logging only)
- Beautiful HTML email templates

#### **`taskNotificationService.ts`**
- Checks task dependencies
- Finds users with work roles
- Prevents duplicate notifications
- Triggers emails for ready tasks

### **Backend Routes**

#### **`notifications.ts`**
- POST endpoint to send notifications
- GET endpoint for status check
- DELETE endpoint to clear history

#### **`taskProgress.ts`**
- Updated to trigger dependent task notifications
- Checks dependencies when task marked complete

#### **`incidents.ts`**
- Updated to send initial notifications
- Triggers on incident creation

### **Frontend Components**

#### **`PlaybookEditorNew.tsx`**
- Dependency dropdown selector
- Multi-select for multiple dependencies
- Shows all tasks from all phases

#### **`IncidentDetail.tsx`**
- "Send Notifications" button
- Mutation to call notification API
- Success/error alerts

---

## Testing Guide

### **Test 1: Create Playbook with Dependencies**

1. Go to http://127.0.0.1:3012/playbooks
2. Click "Create Playbook"
3. Fill in basic info
4. Expand "Identification" phase
5. Add Task 1: "Analyze Alert" (no dependencies)
6. Add Task 2: "Assess Impact" (no dependencies)
7. Expand "Containment" phase
8. Add Task 3: "Isolate Systems"
   - In dependencies dropdown, select Task 1 and Task 2
9. Save playbook

### **Test 2: Create Incident & Check Emails**

1. Create new incident with your playbook
2. Check backend console logs:
   ```
   📧 [TEST MODE] Email would be sent:
      To: admin@example.com
      Subject: 🔔 Task Assigned: Analyze Alert
   📧 [TEST MODE] Email would be sent:
      To: admin@example.com
      Subject: 🔔 Task Assigned: Assess Impact
   ⏸️  Skipping task "Isolate Systems" - dependencies not satisfied
   ```

### **Test 3: Complete Tasks & Trigger Dependent**

1. Open the incident
2. Go to "Active Playbook" tab
3. Check Task 1: "Analyze Alert" ✅
4. Check backend console:
   ```
   ✅ Task task-1 completed, checking for dependent tasks...
   ⏸️  Task "Isolate Systems" still waiting (needs Task 2)
   ```
5. Check Task 2: "Assess Impact" ✅
6. Check backend console:
   ```
   ✅ Task "Isolate Systems" is now ready - all dependencies satisfied
   📧 [TEST MODE] Email would be sent:
      To: admin@example.com
      Subject: 🔔 Task Assigned: Isolate Systems
   ```

### **Test 4: Manual Send**

1. Open incident
2. Click "📧 Send Task Notifications" button
3. See alert: "✅ Sent X notifications, Y tasks skipped"
4. Check console logs for email details

---

## Production Deployment

### **Step 1: Configure SMTP**

Update `backend/.env`:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=incidents@yourcompany.com
SMTP_PASSWORD=your-app-password
EMAIL_FROM=IB Cybersecurity <incidents@yourcompany.com>
APP_URL=https://your-domain.com
```

### **Step 2: Test Email Sending**

1. Restart backend
2. Check logs: "✅ Email service configured successfully"
3. Create test incident
4. Verify users receive real emails

### **Step 3: Set Up Work Role Mapping**

Currently, work roles map to system roles:
- `security_analyst` → Users with role `admin` or `security_analyst`
- `it_director` → Users with role `admin` or `it_director`
- etc.

To customize, edit: `backend/src/services/taskNotificationService.ts`

### **Step 4: Monitor**

Check backend logs for:
- ✅ Email sent successfully
- ❌ Failed to send email
- ⏸️ Task skipped (dependencies)

---

## Troubleshooting

### **Emails Not Sending**

**Check 1: Email Service Status**
```bash
curl http://127.0.0.1:5012/api/notifications/status
```

**Check 2: SMTP Credentials**
- Verify SMTP_HOST, SMTP_USER, SMTP_PASSWORD in .env
- For Gmail: Use App Password, not regular password
- Check firewall/network allows outbound port 587

**Check 3: Backend Logs**
```bash
tail -f ~/factory/launcher/logs/inspired-benevolence.log
```

### **Tasks Not Notified**

**Issue**: Task has dependencies that aren't satisfied yet

**Solution**: 
1. Check Active Playbook tab
2. Complete predecessor tasks first
3. Or click "Send Notifications" to retry

### **Duplicate Emails**

**Issue**: Users receiving same email multiple times

**Solution**: Notification history prevents duplicates within session.  
If needed, clear history:
```bash
curl -X DELETE http://127.0.0.1:5012/api/notifications/incident/{id}/history
```

### **Wrong Users Receiving Emails**

**Issue**: Work role mapping incorrect

**Solution**: Update mapping in `taskNotificationService.ts`:
```typescript
const roleMapping: Record<string, string[]> = {
  'security_analyst': ['admin', 'security_analyst', 'analyst'],
  // Add your custom mappings
};
```

---

## Example Workflow

### **Ransomware Incident Response**

**Playbook Structure:**
```
Phase 1: Identification
  ├─ Task 1: Identify Variant (Security Analyst) [no dependencies]
  ├─ Task 2: Assess Impact (IT Director) [no dependencies]
  └─ Task 3: Notify Leadership (Executive) [no dependencies]

Phase 2: Containment
  ├─ Task 4: Isolate Systems (IT Director) [depends on: Task 1, Task 2]
  └─ Task 5: Preserve Evidence (Security Analyst) [depends on: Task 4]

Phase 3: Eradication
  └─ Task 6: Remove Ransomware (Security Analyst) [depends on: Task 5]

Phase 4: Recovery
  └─ Task 7: Restore Systems (IT Director) [depends on: Task 6]

Phase 5: Lessons Learned
  └─ Task 8: Post-Incident Review (Executive) [depends on: Task 7]
```

**Timeline:**

**T+0 minutes** (Incident Created):
- 📧 Security Analyst gets Task 1
- 📧 IT Director gets Task 2
- 📧 Executive gets Task 3

**T+30 minutes** (Task 1 & 2 Complete):
- ✅ Security Analyst marks Task 1 done
- ✅ IT Director marks Task 2 done
- 📧 IT Director gets Task 4 (Isolate Systems)

**T+45 minutes** (Task 4 Complete):
- ✅ IT Director marks Task 4 done
- 📧 Security Analyst gets Task 5 (Preserve Evidence)

**T+2 hours** (Task 5 Complete):
- ✅ Security Analyst marks Task 5 done
- 📧 Security Analyst gets Task 6 (Remove Ransomware)

**T+6 hours** (Task 6 Complete):
- ✅ Security Analyst marks Task 6 done
- 📧 IT Director gets Task 7 (Restore Systems)

**T+12 hours** (Task 7 Complete):
- ✅ IT Director marks Task 7 done
- 📧 Executive gets Task 8 (Post-Incident Review)

---

## Summary

### **What Was Added**

✅ **Task Dependencies**: Define prerequisites for tasks  
✅ **Email Notifications**: Automated emails to work roles  
✅ **Smart Timing**: Only notify when dependencies satisfied  
✅ **Test Mode**: Safe testing without real emails  
✅ **Manual Control**: "Send Notifications" button  
✅ **Beautiful Emails**: Professional HTML templates  
✅ **Auto-Trigger**: On incident creation & task completion  
✅ **Dependency Editor**: Dropdown in playbook editor  

### **Benefits**

**For Teams:**
- Clear task ownership via work roles
- No missed notifications
- Sequential workflow enforcement
- Reduced confusion about what to do next

**For Admins:**
- Automated communication
- Progress visibility
- Compliance documentation
- Reduced manual coordination

**For Auditors:**
- Complete email trail
- Timestamp of notifications
- Dependency compliance
- Work role assignments

---

## **Ready to Use!**

**Access:** http://127.0.0.1:3012  
**Login:** admin@example.com / admin123  

**Try it:**
1. Create a playbook with dependencies
2. Create an incident
3. Watch the console logs for notifications
4. Complete tasks and see dependent tasks trigger

**Configure SMTP when ready for production!** 📧

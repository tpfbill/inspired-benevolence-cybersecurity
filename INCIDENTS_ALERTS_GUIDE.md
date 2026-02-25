# Incidents & Alerts Management Guide

## Overview

This guide explains how to effectively use the Incidents and Alerts features with your existing ManageEngine security monitoring.

---

## 🚨 Alerts

Alerts are **raw security events** from monitoring tools that need triage and assessment.

### Alert Lifecycle

```
NEW → ACKNOWLEDGED → INVESTIGATING → ESCALATED/RESOLVED/FALSE_POSITIVE
```

### Use Cases with ManageEngine

#### 1. **Automated Alert Import** (Recommended)

Pull alerts automatically from ManageEngine into your platform:

**Setup:**
```bash
# Edit backend/.env
MANAGEENGINE_ENABLED=true
MANAGEENGINE_API_URL=https://your-manageengine-instance.com
MANAGEENGINE_API_KEY=your-api-key-here
```

**Import Alerts:**
- Via API: `POST /api/integrations/manageengine/import`
- Schedule: Use cron job for automatic imports every 5-15 minutes
- Manual: Click "Import Alerts" button in UI (to be added)

#### 2. **Manual Alert Entry**

For alerts that don't auto-import or from other sources:

**Create Alert:**
```bash
POST /api/alerts
{
  "title": "Suspicious Login Attempt",
  "description": "Multiple failed login attempts from IP 192.168.1.100",
  "source": "ManageEngine",
  "severity": "high",
  "affectedAssets": ["web-server-01", "db-server-02"]
}
```

#### 3. **Alert Triage Workflow**

**Step 1: Review New Alerts**
- Dashboard shows critical/high alerts
- Filter by severity, source, date
- Review alert details and raw data

**Step 2: Acknowledge**
- Security analyst acknowledges awareness
- Marks: "I'm looking at this"
- Prevents duplicate work

**Step 3: Investigate**
- Gather additional context
- Check threat intelligence
- Determine legitimacy

**Step 4: Decision**
- **False Positive**: Mark as such, document why
- **Real Threat**: Escalate to Incident
- **Resolved**: Mark resolved with notes

### Alert Severity Mapping

| ManageEngine | IBC Platform | Action |
|--------------|--------------|--------|
| Critical | Critical | Immediate response required |
| High | High | Respond within 1 hour |
| Medium | Medium | Respond within 4 hours |
| Low | Low | Review during business hours |
| Info | Info | Log for reference |

### Alert Best Practices

✅ **DO:**
- Set up automated imports from ManageEngine
- Acknowledge alerts promptly
- Document investigation findings
- Escalate legitimate threats to incidents
- Mark false positives with clear reasoning

❌ **DON'T:**
- Ignore low-severity alerts (they may indicate reconnaissance)
- Skip documentation
- Let alerts sit unacknowledged for hours
- Delete alerts (keep for audit trail)

---

## 🛡️ Incidents

Incidents are **confirmed security events** requiring coordinated response following a playbook.

### Incident Lifecycle

```
DETECTED → INVESTIGATING → CONTAINED → ERADICATING → RECOVERING → RESOLVED → CLOSED
```

### When to Create an Incident

Create an incident when:
1. ✅ Alert is confirmed as legitimate threat
2. ✅ Multiple related alerts indicate attack pattern
3. ✅ User reports security issue (phishing, ransomware, etc.)
4. ✅ System compromise detected
5. ✅ Data breach suspected or confirmed

### Creating Incidents from Alerts

**Option 1: Escalate Alert**
```bash
PUT /api/alerts/{id}/escalate
{
  "incidentId": "new" // or existing incident ID
}
```

**Option 2: Manual Incident Creation**
1. Navigate to Incidents → Create
2. Select incident type (matches your playbooks)
3. Choose playbook (auto-generates tasks)
4. Assign to team member
5. Set severity

### Incident Types & Playbooks

| Incident Type | Playbook | When to Use |
|---------------|----------|-------------|
| **Ransomware** | 10-step response | Files encrypted, ransom note detected |
| **Phishing** | 9-step response | Suspicious emails reported by users |
| **Data Breach** | 10-step response | Unauthorized data access/exfiltration |
| **DDoS** | 8-step response | Service degradation, traffic spikes |
| **Insider Threat** | 9-step response | Employee suspicious behavior |

### Incident Workflow Example

**Scenario: Phishing Email Reported**

1. **Detection** (Alert Phase)
   - User reports suspicious email
   - ManageEngine flags email gateway alert
   - Alert created in IBC platform

2. **Create Incident**
   - Type: Phishing
   - Severity: Medium
   - Playbook: Phishing Attack Response
   - Assigns 9 tasks automatically

3. **Execute Playbook**
   - **Task 1**: Security Analyst verifies phishing email (10-15 min)
   - **Task 2**: IT Director identifies all recipients (15-30 min)
   - **Task 3**: IT Director quarantines emails (20-30 min)
   - **Task 4**: Security Analyst blocks sender (15-20 min)
   - **Task 5**: Security Analyst checks for compromises (1-2 hours)
   - **Task 6**: IT Director resets compromised credentials (30-60 min)
   - **Task 7**: HR sends security alert to employees (30 min)
   - **Task 8**: HR conducts targeted training (2-4 hours)
   - **Task 9**: Legal reports to authorities (30 min)

4. **Timeline Tracking**
   - System auto-logs all actions
   - Team adds manual notes
   - Evidence preserved automatically

5. **Resolution**
   - All tasks completed
   - Post-mortem documented
   - Incident marked resolved

---

## 🔗 ManageEngine Integration Options

### Option 1: API Pull (Recommended)

**Pros:**
- Automated alert import
- Real-time or scheduled sync
- No changes to ManageEngine needed

**Setup:**
1. Get ManageEngine API credentials
2. Configure in `.env` file
3. Test connection: `POST /api/integrations/manageengine/test`
4. Import alerts: `POST /api/integrations/manageengine/import`

**Automated Schedule:**
```bash
# Add to crontab for every 15 minutes
*/15 * * * * cd /path/to/ibc && curl -X POST http://localhost:3001/api/integrations/manageengine/import -H "Authorization: Bearer YOUR_TOKEN"
```

### Option 2: Webhook Push

Have ManageEngine push alerts to IBC:

**Endpoint:** `POST /api/alerts/webhook/manageengine`

**ManageEngine Configuration:**
- Add webhook URL in ManageEngine alert actions
- Configure alert criteria (severity, type)
- Map fields to IBC format

### Option 3: Manual Entry

**When to use:**
- Testing the system
- One-off alerts from other sources
- ManageEngine integration not ready yet

---

## 📊 Recommended Workflow

### Daily Security Operations

**Morning (9 AM):**
1. Review overnight alerts (new alerts dashboard)
2. Acknowledge critical/high alerts
3. Check active incidents status
4. Update incident timelines

**Throughout Day:**
1. Triage new alerts as they arrive
2. Escalate confirmed threats to incidents
3. Work incident playbook tasks
4. Communicate with team via incident comments

**Evening (5 PM):**
1. Update all active incidents
2. Close resolved incidents
3. Document lessons learned
4. Plan next day's priorities

### Weekly Reviews

**Every Monday:**
1. Review metrics (Dashboard → Compliance)
2. Check alert-to-incident conversion rate
3. Review false positive patterns
4. Update playbooks if needed
5. Team sync on active incidents

---

## 🎯 KPIs & Metrics

### Alert Metrics
- **Alert Volume**: Trending up/down?
- **Mean Time to Acknowledge (MTTA)**: Target < 15 min
- **False Positive Rate**: Target < 20%
- **Escalation Rate**: % of alerts → incidents

### Incident Metrics
- **Mean Time to Detect (MTTD)**: How fast we find threats
- **Mean Time to Respond (MTTR)**: How fast we react
- **Mean Time to Resolve (MTTR)**: How fast we fix
- **Resolution Rate**: % closed successfully

**View in Dashboard:**
- Navigate to Compliance
- See incident trends, resolution times
- Export reports for management

---

## 🔧 Configuration Examples

### Example 1: High-Security Environment

**Alert Settings:**
- Import from ManageEngine every 5 minutes
- Auto-acknowledge info/low alerts
- Email notifications for critical/high
- Slack webhook for all new incidents

**Incident Settings:**
- Auto-assign based on type
- Mandatory playbook for all incidents
- Require executive approval for data breaches
- 24/7 on-call rotation

### Example 2: SMB Environment

**Alert Settings:**
- Import from ManageEngine daily
- Manual triage during business hours
- Email digest of daily alerts
- Weekend alerts queued for Monday

**Incident Settings:**
- Flexible playbook usage
- Small team = cross-functional roles
- Document everything for compliance
- Monthly review meetings

---

## 🚀 Quick Start Checklist

### Phase 1: Basic Setup (Week 1)
- [ ] Create test alert manually
- [ ] Create test incident with playbook
- [ ] Verify email notifications work
- [ ] Train team on alert triage
- [ ] Document escalation criteria

### Phase 2: ManageEngine Integration (Week 2)
- [ ] Get ManageEngine API credentials
- [ ] Configure integration in `.env`
- [ ] Test connection
- [ ] Import last 24 hours of alerts
- [ ] Verify alert mapping

### Phase 3: Automation (Week 3)
- [ ] Set up cron job for alert imports
- [ ] Configure alert routing rules
- [ ] Set up notification preferences
- [ ] Create custom playbooks if needed
- [ ] Document team procedures

### Phase 4: Optimization (Week 4+)
- [ ] Review false positive patterns
- [ ] Tune alert filters in ManageEngine
- [ ] Optimize playbook steps
- [ ] Measure KPIs
- [ ] Continuous improvement

---

## 💡 Pro Tips

### Alert Management
1. **Tune Your Sources**: Reduce noise in ManageEngine before importing
2. **Correlation**: Look for patterns across multiple alerts
3. **Context**: Enrich alerts with asset information, business impact
4. **Automation**: Auto-close known false positives

### Incident Management
1. **Use Playbooks Always**: Even for "simple" incidents
2. **Document Everything**: Timeline, decisions, evidence
3. **Communicate**: Keep stakeholders updated
4. **Learn**: Every incident improves your playbooks
5. **Speed vs. Accuracy**: Sometimes you need to contain fast, investigate thoroughly later

### Team Collaboration
1. **Clear Ownership**: Every alert/incident has an owner
2. **Handoffs**: Document when passing to another team member
3. **Status Updates**: At least twice daily for active incidents
4. **Post-Mortems**: No blame, just learning

---

## 🆘 Common Scenarios

### Scenario 1: Alert Flood
**Problem:** 100+ alerts in 1 hour from ManageEngine

**Solution:**
1. Don't panic - triage by severity first
2. Look for patterns (same source, type, asset)
3. May indicate ongoing attack - create incident
4. Acknowledge in bulk, investigate systematically
5. Tune ManageEngine filters afterward

### Scenario 2: False Positive Storm
**Problem:** Recurring false positives from specific source

**Solution:**
1. Document pattern in alert notes
2. Mark as false positive with clear reason
3. Create suppression rule in ManageEngine
4. Monitor to ensure real threats aren't missed
5. Review quarterly

### Scenario 3: After-Hours Critical Alert
**Problem:** Critical alert at 2 AM

**Solution:**
1. On-call person acknowledges immediately
2. Quick assessment: true threat or false positive?
3. If true threat: Create incident, start playbook
4. Wake appropriate team members
5. Document timeline thoroughly
6. Morning debrief with full team

### Scenario 4: Multiple Simultaneous Incidents
**Problem:** Ransomware + DDoS + Phishing at same time

**Solution:**
1. Triage by business impact first
2. Assign separate owners to each incident
3. Look for coordinated attack patterns
4. May need external help (incident response firm)
5. Activate business continuity plan
6. Regular status updates to leadership

---

## 📞 Support & Questions

**Technical Issues:**
- Check logs: `backend/logs/combined.log`
- API errors: `backend/logs/error.log`
- Test integration: `POST /api/integrations/manageengine/test`

**Process Questions:**
- Review playbooks for guidance
- Consult NIST CSF framework
- Team escalation procedures
- External IR consultants if needed

---

## 🎓 Training Resources

**For Security Analysts:**
- Alert triage procedures
- Threat intelligence lookup
- Playbook execution
- Evidence preservation

**For IT Team:**
- System containment procedures
- Credential management
- Backup/restore operations
- Network isolation

**For Management:**
- Dashboard interpretation
- Escalation criteria
- Communication protocols
- Compliance requirements

---

**Last Updated:** 2026-02-24  
**Version:** 1.0

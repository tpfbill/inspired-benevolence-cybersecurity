-- Migration script to update 5 sample playbooks to new phase-based structure

-- Ransomware Incident Response
UPDATE playbooks SET
  phases = '[
    {
      "phase": "identification",
      "description": "Detect and confirm the ransomware incident",
      "tasks": [
        {
          "id": "task-r-id-1",
          "title": "Identify Ransomware Variant",
          "description": "Analyze the ransomware to determine variant, encryption method, and potential decryption options.",
          "workRole": "security_analyst",
          "estimatedTime": "1-2 hours",
          "outcome": "Ransomware variant identified and documented",
          "subtasks": []
        },
        {
          "id": "task-r-id-2",
          "title": "Assess Impact",
          "description": "Determine scope of encryption, affected data, systems, and business impact. Identify backup status.",
          "workRole": "it_director",
          "estimatedTime": "1-2 hours",
          "outcome": "Complete impact assessment documented",
          "subtasks": [
            {
              "id": "subtask-r-id-2-1",
              "title": "Identify affected systems",
              "description": "List all systems showing encryption",
              "workRole": "security_analyst",
              "estimatedTime": "30 minutes",
              "outcome": "System inventory completed"
            },
            {
              "id": "subtask-r-id-2-2",
              "title": "Check backup status",
              "description": "Verify backup availability and integrity",
              "workRole": "it_director",
              "estimatedTime": "30 minutes",
              "outcome": "Backup status confirmed"
            }
          ]
        },
        {
          "id": "task-r-id-3",
          "title": "Notify Leadership",
          "description": "Alert CEO, CISO, and legal counsel about the incident. Initiate crisis management protocol.",
          "workRole": "executive",
          "estimatedTime": "10-15 minutes",
          "outcome": "Leadership notified and crisis protocol activated",
          "subtasks": []
        }
      ]
    },
    {
      "phase": "containment",
      "description": "Prevent the ransomware from spreading further",
      "tasks": [
        {
          "id": "task-r-cont-1",
          "title": "Isolate Affected Systems",
          "description": "Immediately disconnect affected systems from the network to prevent spread. Do not power off devices as this may destroy evidence.",
          "workRole": "it_director",
          "estimatedTime": "5-10 minutes",
          "outcome": "All infected systems isolated from network",
          "subtasks": [
            {
              "id": "subtask-r-cont-1-1",
              "title": "Disable network adapters",
              "description": "Physically or logically disconnect network connections",
              "workRole": "it_director",
              "estimatedTime": "5 minutes",
              "outcome": "Network connections disabled"
            },
            {
              "id": "subtask-r-cont-1-2",
              "title": "Block suspicious IPs",
              "description": "Add firewall rules to block command and control servers",
              "workRole": "security_analyst",
              "estimatedTime": "15 minutes",
              "outcome": "C2 servers blocked at firewall"
            }
          ]
        },
        {
          "id": "task-r-cont-2",
          "title": "Preserve Evidence",
          "description": "Take forensic images of affected systems. Document ransom notes, screen captures, and network logs.",
          "workRole": "security_analyst",
          "estimatedTime": "30-60 minutes",
          "outcome": "Forensic evidence preserved for investigation",
          "subtasks": []
        }
      ]
    },
    {
      "phase": "eradication",
      "description": "Remove the ransomware from all affected systems",
      "tasks": [
        {
          "id": "task-r-erad-1",
          "title": "Remove Ransomware",
          "description": "Use anti-malware tools to remove ransomware from affected systems. Verify complete removal.",
          "workRole": "security_analyst",
          "estimatedTime": "2-4 hours",
          "outcome": "All ransomware removed and verified clean",
          "subtasks": [
            {
              "id": "subtask-r-erad-1-1",
              "title": "Run antimalware scans",
              "description": "Full system scans on all affected machines",
              "workRole": "security_analyst",
              "estimatedTime": "2 hours",
              "outcome": "Malware removed"
            },
            {
              "id": "subtask-r-erad-1-2",
              "title": "Verify system integrity",
              "description": "Check for persistence mechanisms and backdoors",
              "workRole": "security_analyst",
              "estimatedTime": "1 hour",
              "outcome": "No persistence mechanisms found"
            }
          ]
        }
      ]
    },
    {
      "phase": "recovery",
      "description": "Restore systems and data to normal operations",
      "tasks": [
        {
          "id": "task-r-rec-1",
          "title": "Initiate System Recovery",
          "description": "Restore systems from clean backups or use decryption tools if available. Verify system integrity.",
          "workRole": "it_director",
          "estimatedTime": "4-24 hours",
          "outcome": "All systems restored and operational",
          "subtasks": [
            {
              "id": "subtask-r-rec-1-1",
              "title": "Restore from backups",
              "description": "Restore encrypted data from clean backups",
              "workRole": "it_director",
              "estimatedTime": "8 hours",
              "outcome": "Data restored from backups"
            },
            {
              "id": "subtask-r-rec-1-2",
              "title": "Test system functionality",
              "description": "Verify all systems are functioning correctly",
              "workRole": "admin",
              "estimatedTime": "4 hours",
              "outcome": "Systems tested and verified"
            }
          ]
        }
      ]
    },
    {
      "phase": "lessons_learned",
      "description": "Document the incident and improve future response",
      "tasks": [
        {
          "id": "task-r-ll-1",
          "title": "Post-Incident Review",
          "description": "Conduct lessons learned session, update security controls, and improve incident response procedures.",
          "workRole": "security_analyst",
          "estimatedTime": "4-8 hours",
          "outcome": "Incident report and recommendations completed",
          "subtasks": [
            {
              "id": "subtask-r-ll-1-1",
              "title": "Document timeline",
              "description": "Create detailed timeline of incident and response",
              "workRole": "security_analyst",
              "estimatedTime": "2 hours",
              "outcome": "Timeline documented"
            },
            {
              "id": "subtask-r-ll-1-2",
              "title": "Identify improvements",
              "description": "List security and process improvements",
              "workRole": "security_analyst",
              "estimatedTime": "2 hours",
              "outcome": "Improvement recommendations documented"
            }
          ]
        },
        {
          "id": "task-r-ll-2",
          "title": "Employee Communication",
          "description": "Notify affected employees, provide guidance on security measures, and address concerns.",
          "workRole": "hr",
          "estimatedTime": "1-2 hours",
          "outcome": "Employees notified and trained",
          "subtasks": []
        }
      ]
    }
  ]'::jsonb,
  version = '2.0.0'
WHERE name = 'Ransomware Incident Response';

-- Note: For brevity, I'm providing a shorter version for the other 4 playbooks
-- They follow the same structure with appropriate phase-specific tasks

-- Phishing Attack Response
UPDATE playbooks SET
  phases = '[{"phase":"identification","description":"Identify and analyze the phishing attack","tasks":[{"id":"task-p-id-1","title":"Analyze Phishing Email","description":"Examine the suspicious email to confirm it is a phishing attempt.","workRole":"security_analyst","estimatedTime":"15-30 minutes","outcome":"Phishing email confirmed","subtasks":[]},{"id":"task-p-id-2","title":"Identify Affected Users","description":"Search email logs to find all users who received the phishing email.","workRole":"security_analyst","estimatedTime":"30 minutes","outcome":"List of affected users compiled","subtasks":[]}]},{"phase":"containment","description":"Prevent further impact","tasks":[{"id":"task-p-cont-1","title":"Block Malicious Domains","description":"Add phishing domains to blacklists.","workRole":"security_analyst","estimatedTime":"15 minutes","outcome":"Domains blocked","subtasks":[]},{"id":"task-p-cont-2","title":"Remove Phishing Emails","description":"Remove the phishing email from all user inboxes.","workRole":"admin","estimatedTime":"30 minutes","outcome":"Emails removed","subtasks":[]}]},{"phase":"eradication","description":"Remove malware","tasks":[{"id":"task-p-erad-1","title":"Scan for Malware","description":"Run antimalware scans on affected systems.","workRole":"security_analyst","estimatedTime":"1-2 hours","outcome":"Systems cleaned","subtasks":[]},{"id":"task-p-erad-2","title":"Reset Credentials","description":"Force password reset for compromised users.","workRole":"admin","estimatedTime":"30 minutes","outcome":"Accounts secured","subtasks":[]}]},{"phase":"recovery","description":"Restore operations","tasks":[{"id":"task-p-rec-1","title":"Verify Account Security","description":"Check for unauthorized access.","workRole":"security_analyst","estimatedTime":"1-2 hours","outcome":"Accounts verified secure","subtasks":[]}]},{"phase":"lessons_learned","description":"Educate and improve","tasks":[{"id":"task-p-ll-1","title":"User Security Training","description":"Conduct phishing awareness training.","workRole":"hr","estimatedTime":"2-4 hours","outcome":"Training completed","subtasks":[]}]}]'::jsonb,
  version = '2.0.0'
WHERE name = 'Phishing Attack Response';

-- Data Breach Response
UPDATE playbooks SET
  phases = '[{"phase":"identification","description":"Identify and assess the data breach","tasks":[{"id":"task-d-id-1","title":"Confirm Data Breach","description":"Verify that unauthorized access occurred.","workRole":"security_analyst","estimatedTime":"1-2 hours","outcome":"Breach confirmed","subtasks":[]},{"id":"task-d-id-2","title":"Identify Compromised Data","description":"Determine what data was accessed.","workRole":"security_analyst","estimatedTime":"2-4 hours","outcome":"Data inventory completed","subtasks":[]}]},{"phase":"containment","description":"Stop the breach","tasks":[{"id":"task-d-cont-1","title":"Close Attack Vector","description":"Patch vulnerabilities or block attacker access.","workRole":"security_analyst","estimatedTime":"1-2 hours","outcome":"Attack vector eliminated","subtasks":[]},{"id":"task-d-cont-2","title":"Preserve Evidence","description":"Collect logs and forensic images.","workRole":"security_analyst","estimatedTime":"2-4 hours","outcome":"Evidence preserved","subtasks":[]}]},{"phase":"eradication","description":"Remove attacker access","tasks":[{"id":"task-d-erad-1","title":"Remove Attacker Presence","description":"Eliminate backdoors and malware.","workRole":"security_analyst","estimatedTime":"4-8 hours","outcome":"Attacker access removed","subtasks":[]}]},{"phase":"recovery","description":"Restore and notify","tasks":[{"id":"task-d-rec-1","title":"Notify Affected Individuals","description":"Send breach notifications.","workRole":"legal","estimatedTime":"4-8 hours","outcome":"Notifications sent","subtasks":[]},{"id":"task-d-rec-2","title":"Report to Regulators","description":"File required breach reports.","workRole":"legal","estimatedTime":"2-4 hours","outcome":"Reports filed","subtasks":[]}]},{"phase":"lessons_learned","description":"Review and strengthen","tasks":[{"id":"task-d-ll-1","title":"Post-Breach Review","description":"Analyze how breach occurred.","workRole":"executive","estimatedTime":"4-8 hours","outcome":"Review completed","subtasks":[]}]}]'::jsonb,
  version = '2.0.0'
WHERE name = 'Data Breach Response';

-- DDoS Attack Mitigation
UPDATE playbooks SET
  phases = '[{"phase":"identification","description":"Detect and characterize the DDoS attack","tasks":[{"id":"task-dd-id-1","title":"Confirm DDoS Attack","description":"Verify service degradation is due to DDoS.","workRole":"security_analyst","estimatedTime":"15-30 minutes","outcome":"DDoS confirmed","subtasks":[]},{"id":"task-dd-id-2","title":"Characterize Attack","description":"Identify attack type and sources.","workRole":"security_analyst","estimatedTime":"30 minutes","outcome":"Attack characterized","subtasks":[]}]},{"phase":"containment","description":"Mitigate the attack","tasks":[{"id":"task-dd-cont-1","title":"Activate DDoS Mitigation","description":"Enable DDoS protection service.","workRole":"it_director","estimatedTime":"15-30 minutes","outcome":"Mitigation active","subtasks":[]},{"id":"task-dd-cont-2","title":"Implement Rate Limiting","description":"Configure rate limiting and filtering.","workRole":"security_analyst","estimatedTime":"30 minutes","outcome":"Rate limiting configured","subtasks":[]}]},{"phase":"eradication","description":"Block attack sources","tasks":[{"id":"task-dd-erad-1","title":"Block Attack Sources","description":"Create firewall rules to block sources.","workRole":"security_analyst","estimatedTime":"1-2 hours","outcome":"Sources blocked","subtasks":[]}]},{"phase":"recovery","description":"Restore service","tasks":[{"id":"task-dd-rec-1","title":"Monitor Service Recovery","description":"Verify services fully restored.","workRole":"it_director","estimatedTime":"1-2 hours","outcome":"Services operational","subtasks":[]}]},{"phase":"lessons_learned","description":"Review and improve","tasks":[{"id":"task-dd-ll-1","title":"Review DDoS Response","description":"Analyze response effectiveness.","workRole":"security_analyst","estimatedTime":"2-4 hours","outcome":"Review completed","subtasks":[]}]}]'::jsonb,
  version = '2.0.0'
WHERE name = 'DDoS Attack Mitigation';

-- Insider Threat Response
UPDATE playbooks SET
  phases = '[{"phase":"identification","description":"Identify and verify the insider threat","tasks":[{"id":"task-i-id-1","title":"Verify Insider Threat","description":"Confirm suspicious activity is legitimate threat.","workRole":"security_analyst","estimatedTime":"1-2 hours","outcome":"Threat confirmed","subtasks":[]},{"id":"task-i-id-2","title":"Document Malicious Activity","description":"Collect evidence of unauthorized access.","workRole":"security_analyst","estimatedTime":"2-4 hours","outcome":"Evidence documented","subtasks":[]}]},{"phase":"containment","description":"Limit insider access","tasks":[{"id":"task-i-cont-1","title":"Disable User Access","description":"Disable the insider accounts and access.","workRole":"it_director","estimatedTime":"15-30 minutes","outcome":"Access revoked","subtasks":[]},{"id":"task-i-cont-2","title":"Notify HR and Legal","description":"Alert HR and legal teams.","workRole":"executive","estimatedTime":"30 minutes","outcome":"Teams notified","subtasks":[]},{"id":"task-i-cont-3","title":"Preserve Evidence","description":"Secure workstation and logs.","workRole":"security_analyst","estimatedTime":"1-2 hours","outcome":"Evidence preserved","subtasks":[]}]},{"phase":"eradication","description":"Remove backdoors","tasks":[{"id":"task-i-erad-1","title":"Scan for Backdoors","description":"Check for unauthorized access methods.","workRole":"security_analyst","estimatedTime":"2-4 hours","outcome":"Backdoors removed","subtasks":[]}]},{"phase":"recovery","description":"Restore security","tasks":[{"id":"task-i-rec-1","title":"Reset Shared Credentials","description":"Change passwords for shared accounts.","workRole":"admin","estimatedTime":"2-4 hours","outcome":"Credentials reset","subtasks":[]}]},{"phase":"lessons_learned","description":"Review and strengthen","tasks":[{"id":"task-i-ll-1","title":"Conduct Review","description":"Analyze how insider conducted activity.","workRole":"security_analyst","estimatedTime":"4-8 hours","outcome":"Review completed","subtasks":[]}]}]'::jsonb,
  version = '2.0.0'
WHERE name = 'Insider Threat Response';

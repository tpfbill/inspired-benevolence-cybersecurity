import { sequelize } from '../database/connection';
import Incident, { IncidentSeverity, IncidentStatus } from '../models/Incident';
import Task, { TaskStatus, TaskPriority } from '../models/Task';
import Alert from '../models/Alert';
import User from '../models/User';
import Playbook from '../models/Playbook';

async function createSampleIncidents() {
  try {
    await sequelize.authenticate();
    console.log('Database connected');

    // Find admin user
    const adminUser = await User.findOne({ where: { role: 'admin' } });
    if (!adminUser) {
      console.error('No admin user found. Please create an admin user first.');
      process.exit(1);
    }

    // Find playbooks
    const ransomwarePlaybook = await Playbook.findOne({ where: { incidentType: 'ransomware' } });
    const phishingPlaybook = await Playbook.findOne({ where: { incidentType: 'phishing' } });
    const ddosPlaybook = await Playbook.findOne({ where: { incidentType: 'ddos' } });

    console.log('Creating sample incidents...');

    // Incident 1: Ransomware Attack (Critical - In Progress)
    const ransomwareIncident = await Incident.create({
      title: 'Lockbit 3.0 Ransomware Attack on Production File Server',
      description: 'Critical ransomware infection detected on FS-PROD-01. 1,247 files have been encrypted. Immediate containment and recovery efforts underway.',
      incidentType: 'ransomware',
      severity: IncidentSeverity.CRITICAL,
      status: IncidentStatus.CONTAINED,
      playbookId: ransomwarePlaybook?.id,
      detectedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      reportedBy: adminUser.id,
      assignedTo: adminUser.id,
      affectedSystems: ['FS-PROD-01', 'File Share //prod/documents', 'Backup Server'],
      evidence: [
        {
          type: 'file',
          name: 'README_FOR_DECRYPT.txt',
          description: 'Ransom note found on infected server',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000)
        },
        {
          type: 'screenshot',
          name: 'encrypted_files.png',
          description: 'Screenshot showing .lockbit extension on files',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000)
        }
      ],
      timeline: [
        {
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          userId: adminUser.id,
          action: 'Incident Created',
          description: 'Ransomware detected by endpoint protection'
        },
        {
          timestamp: new Date(Date.now() - 115 * 60 * 1000),
          userId: adminUser.id,
          action: 'System Isolated',
          description: 'FS-PROD-01 disconnected from network'
        },
        {
          timestamp: new Date(Date.now() - 100 * 60 * 1000),
          userId: adminUser.id,
          action: 'Evidence Preserved',
          description: 'Forensic images captured of affected systems'
        },
        {
          timestamp: new Date(Date.now() - 80 * 60 * 1000),
          userId: adminUser.id,
          action: 'Containment Complete',
          description: 'All affected systems isolated, spread halted'
        }
      ]
    });

    // Create tasks for ransomware incident
    if (ransomwarePlaybook) {
      for (let i = 0; i < Math.min(5, ransomwarePlaybook.steps.length); i++) {
        const step = ransomwarePlaybook.steps[i];
        await Task.create({
          incidentId: ransomwareIncident.id,
          title: step.title,
          description: step.description,
          assignedRole: step.assignedRole,
          priority: step.criticalStep ? TaskPriority.CRITICAL : TaskPriority.HIGH,
          stepNumber: step.stepNumber,
          status: i < 3 ? TaskStatus.COMPLETED : i === 3 ? TaskStatus.IN_PROGRESS : TaskStatus.PENDING,
          completedAt: i < 3 ? new Date(Date.now() - (5 - i) * 30 * 60 * 1000) : undefined,
          completedBy: i < 3 ? adminUser.id : undefined
        });
      }
    }

    console.log('✓ Created: Ransomware Incident (Critical - Contained)');

    // Incident 2: Phishing Campaign (High - Investigating)
    const phishingIncident = await Incident.create({
      title: 'Executive Impersonation Phishing Campaign',
      description: 'Widespread phishing campaign impersonating CEO. 45 emails blocked, 3 delivered, 7 users clicked malicious links. Investigating extent of compromise.',
      incidentType: 'phishing',
      severity: IncidentSeverity.HIGH,
      status: IncidentStatus.INVESTIGATING,
      playbookId: phishingPlaybook?.id,
      detectedAt: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
      reportedBy: adminUser.id,
      assignedTo: adminUser.id,
      affectedSystems: ['Email Gateway', 'Exchange Server', '48 user mailboxes'],
      evidence: [
        {
          type: 'email',
          name: 'phishing_sample.eml',
          description: 'Sample phishing email with malicious link',
          timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000)
        }
      ],
      timeline: [
        {
          timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
          userId: adminUser.id,
          action: 'Incident Created',
          description: 'Email gateway flagged suspicious campaign'
        },
        {
          timestamp: new Date(Date.now() - 170 * 60 * 1000),
          userId: adminUser.id,
          action: 'Emails Quarantined',
          description: 'All 45 phishing emails removed from mailboxes'
        },
        {
          timestamp: new Date(Date.now() - 150 * 60 * 1000),
          userId: adminUser.id,
          action: 'Users Identified',
          description: '7 users confirmed to have clicked malicious links'
        }
      ]
    });

    // Create tasks for phishing incident
    if (phishingPlaybook) {
      for (let i = 0; i < Math.min(4, phishingPlaybook.steps.length); i++) {
        const step = phishingPlaybook.steps[i];
        await Task.create({
          incidentId: phishingIncident.id,
          title: step.title,
          description: step.description,
          assignedRole: step.assignedRole,
          priority: step.criticalStep ? TaskPriority.CRITICAL : TaskPriority.HIGH,
          stepNumber: step.stepNumber,
          status: i < 2 ? TaskStatus.COMPLETED : i === 2 ? TaskStatus.IN_PROGRESS : TaskStatus.PENDING,
          completedAt: i < 2 ? new Date(Date.now() - (4 - i) * 40 * 60 * 1000) : undefined,
          completedBy: i < 2 ? adminUser.id : undefined
        });
      }
    }

    console.log('✓ Created: Phishing Campaign Incident (High - Investigating)');

    // Incident 3: DDoS Attack (Critical - Recovering)
    const ddosIncident = await Incident.create({
      title: 'HTTP Flood DDoS Attack on Web Infrastructure',
      description: 'Large-scale DDoS attack targeting web servers. 45,000 requests/second from 15,000 IPs across 45 countries. Mitigation active, services recovering.',
      incidentType: 'ddos',
      severity: IncidentSeverity.CRITICAL,
      status: IncidentStatus.RECOVERING,
      playbookId: ddosPlaybook?.id,
      detectedAt: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
      reportedBy: adminUser.id,
      assignedTo: adminUser.id,
      affectedSystems: ['web-server-01', 'web-server-02', 'load-balancer', 'CDN'],
      evidence: [
        {
          type: 'logs',
          name: 'traffic_spike_logs.txt',
          description: 'Web server logs showing traffic spike',
          timestamp: new Date(Date.now() - 45 * 60 * 1000)
        }
      ],
      timeline: [
        {
          timestamp: new Date(Date.now() - 45 * 60 * 1000),
          userId: adminUser.id,
          action: 'Incident Created',
          description: 'Abnormal traffic detected on web servers'
        },
        {
          timestamp: new Date(Date.now() - 40 * 60 * 1000),
          userId: adminUser.id,
          action: 'DDoS Confirmed',
          description: 'Attack pattern identified as HTTP flood'
        },
        {
          timestamp: new Date(Date.now() - 35 * 60 * 1000),
          userId: adminUser.id,
          action: 'Mitigation Activated',
          description: 'CloudFlare DDoS protection enabled'
        },
        {
          timestamp: new Date(Date.now() - 20 * 60 * 1000),
          userId: adminUser.id,
          action: 'Services Stabilizing',
          description: 'Traffic normalized, services coming back online'
        }
      ]
    });

    // Create tasks for DDoS incident
    if (ddosPlaybook) {
      for (let i = 0; i < Math.min(6, ddosPlaybook.steps.length); i++) {
        const step = ddosPlaybook.steps[i];
        await Task.create({
          incidentId: ddosIncident.id,
          title: step.title,
          description: step.description,
          assignedRole: step.assignedRole,
          priority: step.criticalStep ? TaskPriority.CRITICAL : TaskPriority.MEDIUM,
          stepNumber: step.stepNumber,
          status: i < 4 ? TaskStatus.COMPLETED : i === 4 ? TaskStatus.IN_PROGRESS : TaskStatus.PENDING,
          completedAt: i < 4 ? new Date(Date.now() - (6 - i) * 10 * 60 * 1000) : undefined,
          completedBy: i < 4 ? adminUser.id : undefined
        });
      }
    }

    console.log('✓ Created: DDoS Attack Incident (Critical - Recovering)');

    // Incident 4: Insider Threat (Medium - Resolved)
    const insiderIncident = await Incident.create({
      title: 'Contractor Unauthorized Data Access Attempt',
      description: 'Temporary contractor attempted to access Domain Admin privileges and export customer database. Access denied, account disabled, incident resolved.',
      incidentType: 'insider_threat',
      severity: IncidentSeverity.MEDIUM,
      status: IncidentStatus.RESOLVED,
      detectedAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 24 hours ago
      reportedBy: adminUser.id,
      assignedTo: adminUser.id,
      affectedSystems: ['DC-01', 'Active Directory', 'customer-db'],
      resolvedAt: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
      evidence: [
        {
          type: 'logs',
          name: 'privilege_escalation_attempt.log',
          description: 'Security logs showing privilege escalation attempts',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000)
        }
      ],
      timeline: [
        {
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
          userId: adminUser.id,
          action: 'Incident Created',
          description: 'Suspicious privilege escalation attempt detected'
        },
        {
          timestamp: new Date(Date.now() - 23 * 60 * 60 * 1000),
          userId: adminUser.id,
          action: 'Account Disabled',
          description: 'Contractor account immediately disabled'
        },
        {
          timestamp: new Date(Date.now() - 20 * 60 * 60 * 1000),
          userId: adminUser.id,
          action: 'Investigation Complete',
          description: 'No data exfiltration occurred, access attempts blocked'
        },
        {
          timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
          userId: adminUser.id,
          action: 'Incident Resolved',
          description: 'HR notified, contractor terminated, security measures reviewed'
        }
      ],
      postMortem: 'Contractor account had excessive privileges. Implemented stricter access controls for temporary staff. Enhanced monitoring for privilege escalation attempts. No data was compromised.'
    });

    console.log('✓ Created: Insider Threat Incident (Medium - Resolved)');

    // Link some alerts to incidents
    const ransomwareAlert = await Alert.findOne({ where: { title: 'Ransomware Signature Detected' } });
    if (ransomwareAlert) {
      await ransomwareAlert.update({ 
        incidentId: ransomwareIncident.id,
        status: 'escalated'
      });
      console.log('✓ Linked ransomware alert to incident');
    }

    const phishingAlert = await Alert.findOne({ where: { title: 'Phishing Email Campaign Detected' } });
    if (phishingAlert) {
      await phishingAlert.update({ 
        incidentId: phishingIncident.id,
        status: 'escalated'
      });
      console.log('✓ Linked phishing alert to incident');
    }

    const ddosAlert = await Alert.findOne({ where: { title: 'DDoS Attack in Progress' } });
    if (ddosAlert) {
      await ddosAlert.update({ 
        incidentId: ddosIncident.id,
        status: 'escalated'
      });
      console.log('✓ Linked DDoS alert to incident');
    }

    const insiderAlert = await Alert.findOne({ where: { title: 'Privilege Escalation Attempt' } });
    if (insiderAlert) {
      await insiderAlert.update({ 
        incidentId: insiderIncident.id,
        status: 'resolved'
      });
      console.log('✓ Linked insider threat alert to incident');
    }

    console.log('\n✅ Sample incidents creation complete!');
    
    const totalIncidents = await Incident.count();
    const totalTasks = await Task.count();
    
    console.log(`   Total incidents in database: ${totalIncidents}`);
    console.log(`   Total tasks generated: ${totalTasks}`);
    
    // Show status breakdown
    const activeIncidents = await Incident.count({ 
      where: { 
        status: ['detected', 'investigating', 'contained', 'eradicating', 'recovering'] 
      } 
    });
    const resolvedIncidents = await Incident.count({ where: { status: 'resolved' } });
    
    console.log(`\n📊 Incidents by Status:`);
    console.log(`   Active: ${activeIncidents}`);
    console.log(`   Resolved: ${resolvedIncidents}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating sample incidents:', error);
    process.exit(1);
  }
}

createSampleIncidents();

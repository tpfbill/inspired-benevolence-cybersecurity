import { sequelize } from '../database/connection';
import Playbook from '../models/Playbook';

// Map old steps to new phase-based structure
const migratePlaybooks = async () => {
  try {
    console.log('Starting playbook migration to phase-based structure...');

    // Ransomware Incident Response
    await Playbook.update(
      {
        phases: [
          {
            phase: 'identification',
            description: 'Detect and confirm the ransomware incident',
            tasks: [
              {
                id: 'task-r-id-1',
                title: 'Identify Ransomware Variant',
                description: 'Analyze the ransomware to determine variant, encryption method, and potential decryption options.',
                workRole: 'security_analyst',
                estimatedTime: '1-2 hours',
                outcome: 'Ransomware variant identified and documented',
                subtasks: []
              },
              {
                id: 'task-r-id-2',
                title: 'Assess Impact',
                description: 'Determine scope of encryption, affected data, systems, and business impact. Identify backup status.',
                workRole: 'it_director',
                estimatedTime: '1-2 hours',
                outcome: 'Complete impact assessment documented',
                subtasks: [
                  {
                    id: 'subtask-r-id-2-1',
                    title: 'Identify affected systems',
                    description: 'List all systems showing encryption',
                    workRole: 'security_analyst',
                    estimatedTime: '30 minutes',
                    outcome: 'System inventory completed'
                  },
                  {
                    id: 'subtask-r-id-2-2',
                    title: 'Check backup status',
                    description: 'Verify backup availability and integrity',
                    workRole: 'it_director',
                    estimatedTime: '30 minutes',
                    outcome: 'Backup status confirmed'
                  }
                ]
              },
              {
                id: 'task-r-id-3',
                title: 'Notify Leadership',
                description: 'Alert CEO, CISO, and legal counsel about the incident. Initiate crisis management protocol.',
                workRole: 'executive',
                estimatedTime: '10-15 minutes',
                outcome: 'Leadership notified and crisis protocol activated',
                subtasks: []
              }
            ]
          },
          {
            phase: 'containment',
            description: 'Prevent the ransomware from spreading further',
            tasks: [
              {
                id: 'task-r-cont-1',
                title: 'Isolate Affected Systems',
                description: 'Immediately disconnect affected systems from the network to prevent spread. Do not power off devices as this may destroy evidence.',
                workRole: 'it_director',
                estimatedTime: '5-10 minutes',
                outcome: 'All infected systems isolated from network',
                subtasks: [
                  {
                    id: 'subtask-r-cont-1-1',
                    title: 'Disable network adapters',
                    description: 'Physically or logically disconnect network connections',
                    workRole: 'it_director',
                    estimatedTime: '5 minutes',
                    outcome: 'Network connections disabled'
                  },
                  {
                    id: 'subtask-r-cont-1-2',
                    title: 'Block suspicious IPs',
                    description: 'Add firewall rules to block command and control servers',
                    workRole: 'security_analyst',
                    estimatedTime: '15 minutes',
                    outcome: 'C2 servers blocked at firewall'
                  }
                ]
              },
              {
                id: 'task-r-cont-2',
                title: 'Preserve Evidence',
                description: 'Take forensic images of affected systems. Document ransom notes, screen captures, and network logs.',
                workRole: 'security_analyst',
                estimatedTime: '30-60 minutes',
                outcome: 'Forensic evidence preserved for investigation',
                subtasks: []
              }
            ]
          },
          {
            phase: 'eradication',
            description: 'Remove the ransomware from all affected systems',
            tasks: [
              {
                id: 'task-r-erad-1',
                title: 'Remove Ransomware',
                description: 'Use anti-malware tools to remove ransomware from affected systems. Verify complete removal.',
                workRole: 'security_analyst',
                estimatedTime: '2-4 hours',
                outcome: 'All ransomware removed and verified clean',
                subtasks: [
                  {
                    id: 'subtask-r-erad-1-1',
                    title: 'Run antimalware scans',
                    description: 'Full system scans on all affected machines',
                    workRole: 'security_analyst',
                    estimatedTime: '2 hours',
                    outcome: 'Malware removed'
                  },
                  {
                    id: 'subtask-r-erad-1-2',
                    title: 'Verify system integrity',
                    description: 'Check for persistence mechanisms and backdoors',
                    workRole: 'security_analyst',
                    estimatedTime: '1 hour',
                    outcome: 'No persistence mechanisms found'
                  }
                ]
              },
              {
                id: 'task-r-erad-2',
                title: 'Evaluate Payment Decision',
                description: 'Consult with legal, insurance, and executive team on whether to pay ransom. Document decision rationale.',
                workRole: 'executive',
                estimatedTime: '2-4 hours',
                outcome: 'Payment decision made and documented',
                subtasks: []
              }
            ]
          },
          {
            phase: 'recovery',
            description: 'Restore systems and data to normal operations',
            tasks: [
              {
                id: 'task-r-rec-1',
                title: 'Initiate System Recovery',
                description: 'Restore systems from clean backups or use decryption tools if available. Verify system integrity.',
                workRole: 'it_director',
                estimatedTime: '4-24 hours',
                outcome: 'All systems restored and operational',
                subtasks: [
                  {
                    id: 'subtask-r-rec-1-1',
                    title: 'Restore from backups',
                    description: 'Restore encrypted data from clean backups',
                    workRole: 'it_director',
                    estimatedTime: '8 hours',
                    outcome: 'Data restored from backups'
                  },
                  {
                    id: 'subtask-r-rec-1-2',
                    title: 'Test system functionality',
                    description: 'Verify all systems are functioning correctly',
                    workRole: 'admin',
                    estimatedTime: '4 hours',
                    outcome: 'Systems tested and verified'
                  }
                ]
              },
              {
                id: 'task-r-rec-2',
                title: 'Contact Law Enforcement',
                description: 'Report incident to FBI, local law enforcement, and cybersecurity authorities.',
                workRole: 'legal',
                estimatedTime: '30 minutes',
                outcome: 'Incident reported to authorities',
                subtasks: []
              }
            ]
          },
          {
            phase: 'lessons_learned',
            description: 'Document the incident and improve future response',
            tasks: [
              {
                id: 'task-r-ll-1',
                title: 'Post-Incident Review',
                description: 'Conduct lessons learned session, update security controls, and improve incident response procedures.',
                workRole: 'security_analyst',
                estimatedTime: '4-8 hours',
                outcome: 'Incident report and recommendations completed',
                subtasks: [
                  {
                    id: 'subtask-r-ll-1-1',
                    title: 'Document timeline',
                    description: 'Create detailed timeline of incident and response',
                    workRole: 'security_analyst',
                    estimatedTime: '2 hours',
                    outcome: 'Timeline documented'
                  },
                  {
                    id: 'subtask-r-ll-1-2',
                    title: 'Identify improvements',
                    description: 'List security and process improvements',
                    workRole: 'security_analyst',
                    estimatedTime: '2 hours',
                    outcome: 'Improvement recommendations documented'
                  }
                ]
              },
              {
                id: 'task-r-ll-2',
                title: 'Employee Communication',
                description: 'Notify affected employees, provide guidance on security measures, and address concerns.',
                workRole: 'hr',
                estimatedTime: '1-2 hours',
                outcome: 'Employees notified and trained',
                subtasks: []
              }
            ]
          }
        ],
        version: '2.0.0'
      },
      {
        where: { name: 'Ransomware Incident Response' }
      }
    );
    console.log('✓ Migrated: Ransomware Incident Response');

    // Phishing Attack Response
    await Playbook.update(
      {
        phases: [
          {
            phase: 'identification',
            description: 'Identify and analyze the phishing attack',
            tasks: [
              {
                id: 'task-p-id-1',
                title: 'Analyze Phishing Email',
                description: 'Examine the suspicious email headers, content, links, and attachments to confirm it is a phishing attempt.',
                workRole: 'security_analyst',
                estimatedTime: '15-30 minutes',
                outcome: 'Phishing email confirmed and characterized',
                subtasks: [
                  {
                    id: 'subtask-p-id-1-1',
                    title: 'Check email headers',
                    description: 'Verify sender authenticity and routing',
                    workRole: 'security_analyst',
                    estimatedTime: '10 minutes',
                    outcome: 'Headers analyzed'
                  }
                ]
              },
              {
                id: 'task-p-id-2',
                title: 'Identify Affected Users',
                description: 'Search email logs to find all users who received the phishing email.',
                workRole: 'security_analyst',
                estimatedTime: '30 minutes',
                outcome: 'List of affected users compiled',
                subtasks: []
              }
            ]
          },
          {
            phase: 'containment',
            description: 'Prevent further impact from the phishing attack',
            tasks: [
              {
                id: 'task-p-cont-1',
                title: 'Block Malicious Domains',
                description: 'Add phishing domains/URLs to firewall, proxy, and email gateway blacklists.',
                workRole: 'security_analyst',
                estimatedTime: '15 minutes',
                outcome: 'Malicious domains blocked',
                subtasks: []
              },
              {
                id: 'task-p-cont-2',
                title: 'Remove Phishing Emails',
                description: 'Use email admin tools to remove the phishing email from all user inboxes.',
                workRole: 'admin',
                estimatedTime: '30 minutes',
                outcome: 'Phishing emails removed from all inboxes',
                subtasks: []
              }
            ]
          },
          {
            phase: 'eradication',
            description: 'Remove any malware or compromised credentials',
            tasks: [
              {
                id: 'task-p-erad-1',
                title: 'Scan for Malware',
                description: 'Run antimalware scans on systems of users who clicked links or opened attachments.',
                workRole: 'security_analyst',
                estimatedTime: '1-2 hours',
                outcome: 'All systems scanned and cleaned',
                subtasks: []
              },
              {
                id: 'task-p-erad-2',
                title: 'Reset Compromised Credentials',
                description: 'Force password reset for users who entered credentials on phishing site.',
                workRole: 'admin',
                estimatedTime: '30 minutes',
                outcome: 'All compromised accounts secured',
                subtasks: []
              }
            ]
          },
          {
            phase: 'recovery',
            description: 'Restore normal operations and secure accounts',
            tasks: [
              {
                id: 'task-p-rec-1',
                title: 'Verify Account Security',
                description: 'Check for unauthorized access, suspicious activities, or data exfiltration from compromised accounts.',
                workRole: 'security_analyst',
                estimatedTime: '1-2 hours',
                outcome: 'All accounts verified secure',
                subtasks: []
              }
            ]
          },
          {
            phase: 'lessons_learned',
            description: 'Educate users and improve defenses',
            tasks: [
              {
                id: 'task-p-ll-1',
                title: 'User Security Training',
                description: 'Conduct phishing awareness training for all affected users and broader organization.',
                workRole: 'hr',
                estimatedTime: '2-4 hours',
                outcome: 'Training completed for all users',
                subtasks: []
              },
              {
                id: 'task-p-ll-2',
                title: 'Update Email Filters',
                description: 'Improve email filtering rules based on phishing characteristics identified.',
                workRole: 'admin',
                estimatedTime: '1 hour',
                outcome: 'Email filters updated',
                subtasks: []
              }
            ]
          }
        ],
        version: '2.0.0'
      },
      {
        where: { name: 'Phishing Attack Response' }
      }
    );
    console.log('✓ Migrated: Phishing Attack Response');

    // Data Breach Response
    await Playbook.update(
      {
        phases: [
          {
            phase: 'identification',
            description: 'Identify and assess the data breach',
            tasks: [
              {
                id: 'task-d-id-1',
                title: 'Confirm Data Breach',
                description: 'Verify that unauthorized access occurred and data was exposed or exfiltrated.',
                workRole: 'security_analyst',
                estimatedTime: '1-2 hours',
                outcome: 'Breach confirmed and scope understood',
                subtasks: []
              },
              {
                id: 'task-d-id-2',
                title: 'Identify Compromised Data',
                description: 'Determine what data was accessed, types of information, and number of records affected.',
                workRole: 'security_analyst',
                estimatedTime: '2-4 hours',
                outcome: 'Complete inventory of compromised data',
                subtasks: []
              }
            ]
          },
          {
            phase: 'containment',
            description: 'Stop the breach and prevent further data loss',
            tasks: [
              {
                id: 'task-d-cont-1',
                title: 'Close Attack Vector',
                description: 'Patch vulnerabilities, disable compromised accounts, or block attacker access.',
                workRole: 'security_analyst',
                estimatedTime: '1-2 hours',
                outcome: 'Attack vector eliminated',
                subtasks: []
              },
              {
                id: 'task-d-cont-2',
                title: 'Preserve Evidence',
                description: 'Collect logs, forensic images, and other evidence for investigation and legal purposes.',
                workRole: 'security_analyst',
                estimatedTime: '2-4 hours',
                outcome: 'All evidence preserved',
                subtasks: []
              }
            ]
          },
          {
            phase: 'eradication',
            description: 'Remove attacker access and secure systems',
            tasks: [
              {
                id: 'task-d-erad-1',
                title: 'Remove Attacker Presence',
                description: 'Eliminate backdoors, unauthorized accounts, and malware left by attackers.',
                workRole: 'security_analyst',
                estimatedTime: '4-8 hours',
                outcome: 'All attacker access removed',
                subtasks: []
              }
            ]
          },
          {
            phase: 'recovery',
            description: 'Restore operations and notify stakeholders',
            tasks: [
              {
                id: 'task-d-rec-1',
                title: 'Notify Affected Individuals',
                description: 'Send breach notifications to affected customers/employees per regulatory requirements.',
                workRole: 'legal',
                estimatedTime: '4-8 hours',
                outcome: 'All required notifications sent',
                subtasks: []
              },
              {
                id: 'task-d-rec-2',
                title: 'Report to Regulators',
                description: 'File required breach reports with regulators (e.g., HHS for HIPAA, state AG for state laws).',
                workRole: 'legal',
                estimatedTime: '2-4 hours',
                outcome: 'Regulatory reports filed',
                subtasks: []
              }
            ]
          },
          {
            phase: 'lessons_learned',
            description: 'Review breach and strengthen security',
            tasks: [
              {
                id: 'task-d-ll-1',
                title: 'Conduct Post-Breach Review',
                description: 'Analyze how breach occurred, response effectiveness, and security improvements needed.',
                workRole: 'executive',
                estimatedTime: '4-8 hours',
                outcome: 'Comprehensive review completed',
                subtasks: []
              },
              {
                id: 'task-d-ll-2',
                title: 'Implement Security Enhancements',
                description: 'Deploy improved controls, monitoring, and processes based on lessons learned.',
                workRole: 'security_analyst',
                estimatedTime: '40-80 hours',
                outcome: 'Security enhancements deployed',
                subtasks: []
              }
            ]
          }
        ],
        version: '2.0.0'
      },
      {
        where: { name: 'Data Breach Response' }
      }
    );
    console.log('✓ Migrated: Data Breach Response');

    // DDoS Attack Mitigation
    await Playbook.update(
      {
        phases: [
          {
            phase: 'identification',
            description: 'Detect and characterize the DDoS attack',
            tasks: [
              {
                id: 'task-dd-id-1',
                title: 'Confirm DDoS Attack',
                description: 'Verify that service degradation is due to DDoS attack by analyzing traffic patterns and server loads.',
                workRole: 'security_analyst',
                estimatedTime: '15-30 minutes',
                outcome: 'DDoS attack confirmed',
                subtasks: []
              },
              {
                id: 'task-dd-id-2',
                title: 'Characterize Attack',
                description: 'Identify attack type (volumetric, protocol, application layer), source IPs, and target endpoints.',
                workRole: 'security_analyst',
                estimatedTime: '30 minutes',
                outcome: 'Attack characteristics documented',
                subtasks: []
              }
            ]
          },
          {
            phase: 'containment',
            description: 'Mitigate the DDoS attack and restore service',
            tasks: [
              {
                id: 'task-dd-cont-1',
                title: 'Activate DDoS Mitigation',
                description: 'Enable DDoS protection service (e.g., Cloudflare, Akamai) or activate ISP-level filtering.',
                workRole: 'it_director',
                estimatedTime: '15-30 minutes',
                outcome: 'DDoS mitigation active',
                subtasks: []
              },
              {
                id: 'task-dd-cont-2',
                title: 'Implement Rate Limiting',
                description: 'Configure rate limiting, CAPTCHA challenges, or geo-blocking to reduce attack traffic.',
                workRole: 'security_analyst',
                estimatedTime: '30 minutes',
                outcome: 'Rate limiting configured',
                subtasks: []
              }
            ]
          },
          {
            phase: 'eradication',
            description: 'Fine-tune defenses and block attack sources',
            tasks: [
              {
                id: 'task-dd-erad-1',
                title: 'Block Attack Sources',
                description: 'Create firewall rules to block confirmed attack source IPs and networks.',
                workRole: 'security_analyst',
                estimatedTime: '1-2 hours',
                outcome: 'Attack sources blocked',
                subtasks: []
              }
            ]
          },
          {
            phase: 'recovery',
            description: 'Restore full service and verify stability',
            tasks: [
              {
                id: 'task-dd-rec-1',
                title: 'Monitor Service Recovery',
                description: 'Verify that services are fully restored and performance is back to normal levels.',
                workRole: 'it_director',
                estimatedTime: '1-2 hours',
                outcome: 'Services fully operational',
                subtasks: []
              }
            ]
          },
          {
            phase: 'lessons_learned',
            description: 'Review attack and improve defenses',
            tasks: [
              {
                id: 'task-dd-ll-1',
                title: 'Review DDoS Response',
                description: 'Analyze attack patterns, response time, and effectiveness of mitigation measures.',
                workRole: 'security_analyst',
                estimatedTime: '2-4 hours',
                outcome: 'Response review completed',
                subtasks: []
              },
              {
                id: 'task-dd-ll-2',
                title: 'Enhance DDoS Defenses',
                description: 'Improve DDoS protection based on attack characteristics and lessons learned.',
                workRole: 'it_director',
                estimatedTime: '4-8 hours',
                outcome: 'DDoS defenses enhanced',
                subtasks: []
              }
            ]
          }
        ],
        version: '2.0.0'
      },
      {
        where: { name: 'DDoS Attack Mitigation' }
      }
    );
    console.log('✓ Migrated: DDoS Attack Mitigation');

    // Insider Threat Response
    await Playbook.update(
      {
        phases: [
          {
            phase: 'identification',
            description: 'Identify and verify the insider threat',
            tasks: [
              {
                id: 'task-i-id-1',
                title: 'Verify Insider Threat',
                description: 'Confirm that suspicious activity is legitimate insider threat through log analysis and behavior patterns.',
                workRole: 'security_analyst',
                estimatedTime: '1-2 hours',
                outcome: 'Insider threat confirmed',
                subtasks: []
              },
              {
                id: 'task-i-id-2',
                title: 'Document Malicious Activity',
                description: 'Collect evidence of unauthorized access, data theft, or sabotage attempts.',
                workRole: 'security_analyst',
                estimatedTime: '2-4 hours',
                outcome: 'Complete evidence documented',
                subtasks: []
              }
            ]
          },
          {
            phase: 'containment',
            description: 'Limit the insider\'s access and prevent further damage',
            tasks: [
              {
                id: 'task-i-cont-1',
                title: 'Disable User Access',
                description: 'Immediately disable the insider\'s accounts, network access, and physical access cards.',
                workRole: 'it_director',
                estimatedTime: '15-30 minutes',
                outcome: 'All insider access revoked',
                subtasks: []
              },
              {
                id: 'task-i-cont-2',
                title: 'Notify HR and Legal',
                description: 'Alert HR and legal teams about the insider threat for employment and legal action.',
                workRole: 'executive',
                estimatedTime: '30 minutes',
                outcome: 'HR and legal notified',
                subtasks: []
              },
              {
                id: 'task-i-cont-3',
                title: 'Preserve Evidence',
                description: 'Secure the insider\'s workstation, emails, files, and system logs for investigation.',
                workRole: 'security_analyst',
                estimatedTime: '1-2 hours',
                outcome: 'All evidence preserved',
                subtasks: []
              }
            ]
          },
          {
            phase: 'eradication',
            description: 'Remove any backdoors or malicious tools',
            tasks: [
              {
                id: 'task-i-erad-1',
                title: 'Scan for Backdoors',
                description: 'Check systems for unauthorized access methods, hidden accounts, or malicious tools installed by insider.',
                workRole: 'security_analyst',
                estimatedTime: '2-4 hours',
                outcome: 'All backdoors identified and removed',
                subtasks: []
              }
            ]
          },
          {
            phase: 'recovery',
            description: 'Restore compromised systems and secure data',
            tasks: [
              {
                id: 'task-i-rec-1',
                title: 'Recover Stolen Data',
                description: 'Attempt to recover or secure stolen data. Assess what data may have been exfiltrated.',
                workRole: 'it_director',
                estimatedTime: '4-8 hours',
                outcome: 'Data recovery assessment completed',
                subtasks: []
              },
              {
                id: 'task-i-rec-2',
                title: 'Reset Shared Credentials',
                description: 'Change passwords for shared accounts, service accounts, and systems the insider had access to.',
                workRole: 'admin',
                estimatedTime: '2-4 hours',
                outcome: 'All shared credentials reset',
                subtasks: []
              }
            ]
          },
          {
            phase: 'lessons_learned',
            description: 'Review incident and strengthen insider threat program',
            tasks: [
              {
                id: 'task-i-ll-1',
                title: 'Conduct Insider Threat Review',
                description: 'Analyze how insider was able to conduct malicious activity and what controls failed.',
                workRole: 'security_analyst',
                estimatedTime: '4-8 hours',
                outcome: 'Review completed with recommendations',
                subtasks: []
              },
              {
                id: 'task-i-ll-2',
                title: 'Enhance Monitoring',
                description: 'Implement improved user behavior analytics, DLP, and access controls.',
                workRole: 'security_analyst',
                estimatedTime: '40-80 hours',
                outcome: 'Enhanced monitoring deployed',
                subtasks: []
              }
            ]
          }
        ],
        version: '2.0.0'
      },
      {
        where: { name: 'Insider Threat Response' }
      }
    );
    console.log('✓ Migrated: Insider Threat Response');

    console.log('\n✅ All 5 sample playbooks successfully migrated to phase-based structure!');
    console.log('All playbooks updated to version 2.0.0\n');
    
  } catch (error) {
    console.error('Migration error:', error);
  } finally {
    await sequelize.close();
  }
};

migratePlaybooks();

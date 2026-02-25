import { sequelize } from '../database/connection';
import Alert, { AlertSeverity, AlertStatus } from '../models/Alert';

const sampleAlerts = [
  {
    title: 'Multiple Failed Login Attempts Detected',
    description: 'User account "jsmith" has experienced 15 failed login attempts from IP 203.0.113.45 in the last 5 minutes. This may indicate a brute force attack.',
    source: 'ManageEngine',
    severity: AlertSeverity.HIGH,
    affectedAssets: ['web-server-01', 'auth-service'],
    rawData: {
      externalId: 'ME-2024-001',
      timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      sourceIP: '203.0.113.45',
      targetAccount: 'jsmith',
      attemptCount: 15,
      protocol: 'HTTPS'
    }
  },
  {
    title: 'Suspicious Outbound Traffic to Unknown Domain',
    description: 'Workstation WS-FINANCE-12 is communicating with suspicious domain "malicious-domain.xyz" on port 443. Possible data exfiltration or C2 communication.',
    source: 'ManageEngine',
    severity: AlertSeverity.CRITICAL,
    affectedAssets: ['WS-FINANCE-12'],
    rawData: {
      externalId: 'ME-2024-002',
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      sourceHost: 'WS-FINANCE-12',
      sourceIP: '192.168.1.105',
      destinationDomain: 'malicious-domain.xyz',
      destinationIP: '185.220.101.45',
      port: 443,
      dataTransferred: '2.3 GB',
      threatIntel: 'Known APT infrastructure'
    }
  },
  {
    title: 'Ransomware Signature Detected',
    description: 'Endpoint protection detected ransomware signature on file server FS-PROD-01. Multiple files are being encrypted. Immediate action required.',
    source: 'ManageEngine',
    severity: AlertSeverity.CRITICAL,
    affectedAssets: ['FS-PROD-01', 'File Share //prod/documents'],
    rawData: {
      externalId: 'ME-2024-003',
      timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      malwareFamily: 'Lockbit 3.0',
      filesEncrypted: 1247,
      ransomNote: 'README_FOR_DECRYPT.txt found',
      processName: 'svchost.exe',
      processPath: 'C:\\Windows\\Temp\\svchost.exe'
    }
  },
  {
    title: 'Phishing Email Campaign Detected',
    description: 'Email gateway has blocked 45 emails from sender "ceo@inspiredbenev0lence.com" (note typo) with subject "Urgent: Wire Transfer Required". Multiple employees attempted to click malicious links.',
    source: 'ManageEngine',
    severity: AlertSeverity.HIGH,
    affectedAssets: ['email-gateway', 'Exchange Server'],
    rawData: {
      externalId: 'ME-2024-004',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      emailsBlocked: 45,
      emailsDelivered: 3,
      clicksDetected: 7,
      senderDomain: 'inspiredbenev0lence.com',
      legitimateDomain: 'inspiredbenevolence.com',
      maliciousURL: 'hxxp://phishing-site[.]com/login',
      recipientCount: 48
    }
  },
  {
    title: 'Privilege Escalation Attempt',
    description: 'User "contractor_temp" attempted to access Domain Admin privileges on DC-01. Access was denied but indicates possible insider threat or compromised account.',
    source: 'ManageEngine',
    severity: AlertSeverity.HIGH,
    affectedAssets: ['DC-01', 'Active Directory'],
    rawData: {
      externalId: 'ME-2024-005',
      timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      userName: 'contractor_temp',
      sourceIP: '192.168.1.87',
      targetPrivilege: 'Domain Admin',
      method: 'Token Manipulation',
      currentPrivilege: 'Standard User',
      accountCreated: '2024-01-15'
    }
  },
  {
    title: 'SQL Injection Attempt Blocked',
    description: 'Web Application Firewall blocked SQL injection attempt targeting customer database. Attack came from TOR exit node.',
    source: 'ManageEngine',
    severity: AlertSeverity.MEDIUM,
    affectedAssets: ['web-app-01', 'customer-db'],
    rawData: {
      externalId: 'ME-2024-006',
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      sourceIP: '185.220.101.15',
      sourceCountry: 'Unknown (TOR)',
      targetURL: '/api/customers/search',
      injectionPayload: "'; DROP TABLE users; --",
      attackType: 'SQLi',
      blocked: true
    }
  },
  {
    title: 'Unusual Database Access Pattern',
    description: 'Service account "svc_backup" accessed customer database during non-business hours (3:24 AM) and exported 50,000 customer records.',
    source: 'ManageEngine',
    severity: AlertSeverity.MEDIUM,
    affectedAssets: ['customer-db', 'DB-SERVER-02'],
    rawData: {
      externalId: 'ME-2024-007',
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      account: 'svc_backup',
      accessTime: '03:24:17 AM',
      recordsAccessed: 50000,
      operation: 'EXPORT',
      normalAccessHours: '9 AM - 5 PM',
      lastSimilarActivity: '2023-12-01'
    }
  },
  {
    title: 'Suspicious PowerShell Execution',
    description: 'Encoded PowerShell command executed on marketing workstation. Command attempts to download payload from external site.',
    source: 'ManageEngine',
    severity: AlertSeverity.HIGH,
    affectedAssets: ['WS-MARKETING-05'],
    rawData: {
      externalId: 'ME-2024-008',
      timestamp: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
      host: 'WS-MARKETING-05',
      user: 'mktg_user',
      command: 'powershell.exe -enc [base64_encoded_command]',
      parentProcess: 'outlook.exe',
      downloadURL: 'hxxp://malicious-cdn[.]com/payload.exe',
      commandLine: 'powershell -WindowStyle Hidden -ExecutionPolicy Bypass'
    }
  },
  {
    title: 'Unauthorized VPN Connection',
    description: 'VPN connection established from unusual location (Romania) for executive account that typically connects from US. Possible account compromise.',
    source: 'ManageEngine',
    severity: AlertSeverity.CRITICAL,
    affectedAssets: ['VPN-Gateway', 'Executive Network'],
    rawData: {
      externalId: 'ME-2024-009',
      timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
      userName: 'ceo_account',
      sourceIP: '93.115.28.44',
      sourceCountry: 'Romania',
      typicalCountry: 'United States',
      typicalIP: '72.21.91.0/24',
      deviceFingerprint: 'Unknown - New Device',
      mfaStatus: 'Bypassed'
    }
  },
  {
    title: 'DDoS Attack in Progress',
    description: 'Distributed Denial of Service attack detected against web servers. Traffic volume increased 400% from 15,000 IPs across 45 countries.',
    source: 'ManageEngine',
    severity: AlertSeverity.CRITICAL,
    affectedAssets: ['web-server-01', 'web-server-02', 'load-balancer'],
    rawData: {
      externalId: 'ME-2024-010',
      timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
      attackType: 'HTTP Flood',
      requestsPerSecond: 45000,
      normalRPS: 1200,
      sourceIPs: 15000,
      sourceCountries: 45,
      targetURL: '/api/public',
      mitigation: 'Rate limiting enabled'
    }
  },
  {
    title: 'USB Device Policy Violation',
    description: 'Unauthorized USB storage device connected to secure workstation in R&D department. Auto-run disabled, device quarantined.',
    source: 'ManageEngine',
    severity: AlertSeverity.MEDIUM,
    affectedAssets: ['WS-RND-03'],
    rawData: {
      externalId: 'ME-2024-011',
      timestamp: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
      host: 'WS-RND-03',
      user: 'research_eng',
      deviceType: 'USB Storage',
      deviceName: 'Generic USB 3.0',
      serialNumber: 'ABC123456',
      action: 'Blocked',
      dataClassification: 'Confidential'
    }
  },
  {
    title: 'Certificate Expiration Warning',
    description: 'SSL certificate for main website will expire in 7 days. Renewal required to avoid service disruption.',
    source: 'ManageEngine',
    severity: AlertSeverity.LOW,
    affectedAssets: ['web-server-01', 'www.inspiredbenevolence.com'],
    rawData: {
      externalId: 'ME-2024-012',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      domain: 'www.inspiredbenevolence.com',
      expirationDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      issuer: 'Let\'s Encrypt',
      certType: 'TLS/SSL',
      impact: 'Website will show security warnings'
    }
  },
  {
    title: 'Malware Detected in Email Attachment',
    description: 'Email attachment "Invoice_Q4.pdf.exe" contains trojan malware. Email quarantined, sender blacklisted.',
    source: 'ManageEngine',
    severity: AlertSeverity.HIGH,
    affectedAssets: ['email-gateway'],
    rawData: {
      externalId: 'ME-2024-013',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      sender: 'accounts@fake-vendor.com',
      recipient: 'accounting@inspiredbenevolence.com',
      subject: 'Q4 Invoice - Urgent Payment Required',
      attachmentName: 'Invoice_Q4.pdf.exe',
      malwareType: 'Trojan.GenericKD.12345',
      action: 'Quarantined'
    }
  },
  {
    title: 'Patch Management Alert',
    description: 'Critical Windows security update KB5012345 missing on 12 servers. Vulnerability allows remote code execution.',
    source: 'ManageEngine',
    severity: AlertSeverity.MEDIUM,
    affectedAssets: ['Multiple Servers'],
    rawData: {
      externalId: 'ME-2024-014',
      timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      patchName: 'KB5012345',
      severity: 'Critical',
      cveIds: ['CVE-2024-1234', 'CVE-2024-5678'],
      affectedServers: 12,
      patchReleaseDate: '2024-01-10',
      vulnerability: 'Remote Code Execution',
      exploitAvailable: 'Yes'
    }
  },
  {
    title: 'Firewall Rule Change Detected',
    description: 'Firewall rule modified to allow inbound RDP (port 3389) from any source. Change not approved through change management process.',
    source: 'ManageEngine',
    severity: AlertSeverity.MEDIUM,
    affectedAssets: ['FW-PERIMETER-01'],
    rawData: {
      externalId: 'ME-2024-015',
      timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
      changeBy: 'admin_user2',
      ruleAction: 'Allow',
      protocol: 'TCP',
      port: 3389,
      source: 'Any',
      destination: 'Internal Network',
      changeTicket: 'None',
      previousRule: 'RDP allowed from VPN only'
    }
  }
];

async function createSampleAlerts() {
  try {
    await sequelize.authenticate();
    console.log('Database connected');

    console.log(`Creating ${sampleAlerts.length} sample alerts...`);

    let created = 0;
    let skipped = 0;

    for (const alertData of sampleAlerts) {
      // Check if alert already exists
      const existing = await Alert.findOne({
        where: {
          title: alertData.title
        }
      });

      if (existing) {
        console.log(`⊘ Skipped: ${alertData.title} (already exists)`);
        skipped++;
        continue;
      }

      await Alert.create(alertData);
      console.log(`✓ Created: ${alertData.title} [${alertData.severity.toUpperCase()}]`);
      created++;
    }

    console.log(`\n✅ Sample alerts creation complete!`);
    console.log(`   Created: ${created}`);
    console.log(`   Skipped: ${skipped}`);
    console.log(`   Total alerts in database: ${await Alert.count()}`);
    
    // Show severity breakdown
    const criticalCount = await Alert.count({ where: { severity: AlertSeverity.CRITICAL } });
    const highCount = await Alert.count({ where: { severity: AlertSeverity.HIGH } });
    const mediumCount = await Alert.count({ where: { severity: AlertSeverity.MEDIUM } });
    const lowCount = await Alert.count({ where: { severity: AlertSeverity.LOW } });

    console.log(`\n📊 Alerts by Severity:`);
    console.log(`   Critical: ${criticalCount}`);
    console.log(`   High: ${highCount}`);
    console.log(`   Medium: ${mediumCount}`);
    console.log(`   Low: ${lowCount}`);

    process.exit(0);
  } catch (error) {
    console.error('Error creating sample alerts:', error);
    process.exit(1);
  }
}

createSampleAlerts();

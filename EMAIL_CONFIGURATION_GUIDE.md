# Email Configuration Guide

## Overview

The IB Cybersecurity platform uses **SMTP** (Simple Mail Transfer Protocol) to send task notification emails. By default, it runs in **TEST MODE** where emails are logged to the console instead of being sent.

---

## Configuration Location

**File:** `/Users/william/factory/inspired-benevolence-cybersecurity/backend/.env`

**Email Settings Section:**
```env
# Email Configuration (SMTP)
SMTP_HOST=
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASSWORD=
EMAIL_FROM=IB Cybersecurity <noreply@ibcybersecurity.com>
APP_URL=http://127.0.0.1:3012
```

---

## Test Mode (Default)

### **Current Status: TEST MODE**

When SMTP credentials are **not configured**, the system runs in test mode:

✅ **All functionality works** (notifications, dependencies, etc.)  
✅ **No real emails sent** (safe for development/testing)  
✅ **Emails logged to console** (you can see what would be sent)  

### **How to See Test Emails**

Check the backend console logs:
```bash
tail -f ~/factory/launcher/logs/inspired-benevolence.log
```

You'll see:
```
📧 [TEST MODE] Email would be sent:
   To: admin@example.com
   Subject: 🔔 Task Assigned: Analyze Alert
   Body: You have been assigned a task for incident: Ransomware Attack
```

---

## Production Mode (Real Emails)

### **Step 1: Choose Email Provider**

You have several options:

#### **Option 1: Gmail (Easy, Free)**
- ✅ Easy to set up
- ✅ Free for low volume
- ⚠️ Requires App Password (2FA needed)
- ⚠️ Daily sending limits (~500/day)

#### **Option 2: Office 365 / Outlook (Business)**
- ✅ Professional email addresses
- ✅ Good for organizations already using Microsoft
- ⚠️ Requires paid Microsoft 365 account

#### **Option 3: SendGrid (Scalable)**
- ✅ High volume sending
- ✅ Reliable delivery
- ✅ Free tier available (100 emails/day)
- ✅ Detailed analytics

#### **Option 4: AWS SES (Enterprise)**
- ✅ Very scalable
- ✅ Low cost
- ⚠️ Requires AWS account
- ⚠️ More complex setup

---

## Configuration Examples

### **Gmail Setup**

**Step 1: Enable 2-Factor Authentication**
1. Go to https://myaccount.google.com/security
2. Enable "2-Step Verification"

**Step 2: Generate App Password**
1. Go to https://myaccount.google.com/apppasswords
2. Select "Mail" and your device
3. Click "Generate"
4. Copy the 16-character password

**Step 3: Update .env**
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=xxxx xxxx xxxx xxxx
EMAIL_FROM=IB Cybersecurity <your-email@gmail.com>
APP_URL=http://127.0.0.1:3012
```

**Step 4: Restart Backend**
```bash
export PATH="$HOME/bin:$PATH" && factory restart inspired-benevolence
```

**Step 5: Verify**
Check logs for:
```
✅ Email service configured successfully
```

---

### **Office 365 / Outlook Setup**

**Update .env:**
```env
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@company.com
SMTP_PASSWORD=your-password
EMAIL_FROM=IB Cybersecurity <your-email@company.com>
APP_URL=http://127.0.0.1:3012
```

**Notes:**
- Use your regular Microsoft account password
- If using MFA, you may need an app password
- Modern Authentication must be enabled

---

### **SendGrid Setup**

**Step 1: Create SendGrid Account**
1. Go to https://sendgrid.com
2. Sign up (free tier available)
3. Verify your email

**Step 2: Create API Key**
1. Go to Settings → API Keys
2. Click "Create API Key"
3. Give it a name (e.g., "IB Cybersecurity")
4. Select "Full Access"
5. Copy the API key

**Step 3: Update .env**
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASSWORD=SG.xxxxxxxxxxxxxxxxxxxxx
EMAIL_FROM=IB Cybersecurity <noreply@yourdomain.com>
APP_URL=http://127.0.0.1:3012
```

**Note:** SMTP_USER is literally "apikey", not your username

**Step 4: Verify Sender**
- SendGrid requires sender verification
- Go to Settings → Sender Authentication
- Verify your sender email address

---

### **AWS SES Setup**

**Step 1: Set Up AWS SES**
1. Go to AWS Console → SES
2. Verify your email address or domain
3. Request production access (if needed)

**Step 2: Create SMTP Credentials**
1. In SES console, go to "SMTP Settings"
2. Click "Create My SMTP Credentials"
3. Download/copy the credentials

**Step 3: Update .env**
```env
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=AKIA...  (your SMTP username)
SMTP_PASSWORD=your-smtp-password
EMAIL_FROM=IB Cybersecurity <verified@yourdomain.com>
APP_URL=http://127.0.0.1:3012
```

**Note:** Replace region (us-east-1) with your AWS region

---

## Testing Email Configuration

### **Method 1: Check Service Status**

**API Request:**
```bash
curl http://127.0.0.1:5012/api/notifications/status
```

**Response (Test Mode):**
```json
{
  "configured": false,
  "mode": "test (logs only)",
  "message": "Email service in test mode. Configure SMTP in .env to send real emails."
}
```

**Response (Production Mode):**
```json
{
  "configured": true,
  "mode": "production",
  "message": "Email service is configured and ready"
}
```

### **Method 2: Send Test Notification**

1. Create a test incident with a playbook
2. Click "📧 Send Task Notifications" button
3. Check if you receive emails

### **Method 3: Check Backend Logs**

```bash
tail -f ~/factory/launcher/logs/inspired-benevolence.log
```

**Success:**
```
✅ Email service configured successfully
✅ Email sent successfully to user@example.com: <message-id>
```

**Error:**
```
❌ Failed to send email to user@example.com: Error message
```

---

## Troubleshooting

### **Issue: "Email service not configured"**

**Check:**
1. Verify SMTP_HOST, SMTP_USER, and SMTP_PASSWORD are set in `.env`
2. Restart the backend after editing `.env`
3. Check for typos in email addresses

### **Issue: "Connection refused" or "Connection timeout"**

**Possible Causes:**
- Incorrect SMTP_HOST or SMTP_PORT
- Firewall blocking outbound port 587
- VPN interfering with connection

**Solutions:**
- Try port 465 with `SMTP_SECURE=true`
- Check firewall rules
- Disable VPN temporarily to test

### **Issue: "Authentication failed"**

**Gmail:**
- Verify you're using App Password (not regular password)
- Ensure 2FA is enabled

**Office 365:**
- Check if Modern Authentication is enabled
- Verify password is correct
- Try generating app password if MFA enabled

**SendGrid:**
- Verify SMTP_USER is exactly "apikey"
- Check API key has "Mail Send" permission
- Ensure sender email is verified

### **Issue: Emails going to spam**

**Solutions:**
1. **SPF Record:** Add to DNS
   ```
   v=spf1 include:_spf.google.com ~all  (for Gmail)
   v=spf1 include:sendgrid.net ~all     (for SendGrid)
   ```

2. **DKIM:** Configure with your email provider

3. **From Address:** Use verified domain email

4. **Content:** Avoid spam trigger words

---

## Security Best Practices

### **1. Use App Passwords**
- Never use your main account password
- Generate app-specific passwords
- Rotate passwords periodically

### **2. Secure .env File**
```bash
# Make sure .env is not in git
echo "backend/.env" >> .gitignore

# Set restrictive permissions
chmod 600 backend/.env
```

### **3. Use Environment-Specific Configs**

**Development:**
```env
NODE_ENV=development
SMTP_HOST=  # Empty = test mode
```

**Production:**
```env
NODE_ENV=production
SMTP_HOST=smtp.sendgrid.net
SMTP_USER=apikey
SMTP_PASSWORD=SG.xxxxx
```

### **4. Monitor for Abuse**
- Set up alerts for high email volume
- Monitor bounce rates
- Check spam complaints

---

## Email Quotas & Limits

### **Gmail**
- **Free:** ~500 emails/day
- **Limit:** Per account, not per app
- **Reset:** Daily at midnight GMT

### **Office 365**
- **Business Basic:** 10,000 recipients/day
- **Business Standard:** 10,000 recipients/day
- **Per user limits**

### **SendGrid**
- **Free Tier:** 100 emails/day
- **Essentials ($19.95/mo):** 50,000/month
- **Pro ($89.95/mo):** 100,000/month

### **AWS SES**
- **First 62,000:** Free (with EC2)
- **After:** $0.10 per 1,000 emails
- **Very high limits**

---

## Production Checklist

Before going live with real emails:

- [ ] SMTP credentials configured in `.env`
- [ ] Backend restarted after configuration
- [ ] Email service status shows "configured: true"
- [ ] Test email sent successfully
- [ ] Emails not going to spam
- [ ] From address verified (if using SendGrid/SES)
- [ ] SPF/DKIM records configured (for custom domain)
- [ ] `.env` file permissions secured (chmod 600)
- [ ] `.env` file not in git repository
- [ ] Email quotas sufficient for expected volume
- [ ] Monitoring/alerts set up for failures

---

## Quick Reference

### **File Location**
```
/Users/william/factory/inspired-benevolence-cybersecurity/backend/.env
```

### **Required Variables**
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EMAIL_FROM=IB Cybersecurity <your-email@gmail.com>
APP_URL=http://127.0.0.1:3012
```

### **Restart Command**
```bash
export PATH="$HOME/bin:$PATH" && factory restart inspired-benevolence
```

### **Check Status**
```bash
curl http://127.0.0.1:5012/api/notifications/status
```

### **View Logs**
```bash
tail -f ~/factory/launcher/logs/inspired-benevolence.log
```

---

## Summary

**Current Status:** 🧪 **TEST MODE** (emails logged only)

**To Enable Real Emails:**
1. Edit `/Users/william/factory/inspired-benevolence-cybersecurity/backend/.env`
2. Add SMTP credentials (see examples above)
3. Restart backend: `factory restart inspired-benevolence`
4. Verify: Check logs for "✅ Email service configured"
5. Test: Create incident and send notifications

**Recommended for Production:** SendGrid or AWS SES (reliable, scalable)

**Recommended for Testing:** Gmail (easy setup)

---

**Need help? Check the logs at `~/factory/launcher/logs/inspired-benevolence.log`** 📧

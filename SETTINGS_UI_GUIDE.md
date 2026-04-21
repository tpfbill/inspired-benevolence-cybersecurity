# Settings UI - Configuration Guide

## Overview

The IB Cybersecurity platform now includes a **Settings** page accessible from the navigation menu where admins can configure system settings through a user-friendly interface.

**No more editing `.env` files manually!** ✨

---

## Accessing Settings

### **Navigation Menu**

Look for the **⚙️ Settings** icon in the main navigation:

```
Dashboard | Playbooks | Incidents | Alerts | Users | Roles | Compliance | ⚙️ Settings
```

**URL:** http://127.0.0.1:3012/settings

**Permission:** Admin role required

---

## Email Configuration Tab

### **Configuration Interface**

The Settings page provides a complete email configuration interface with:

✅ **Status Indicator** - Shows if email is configured or in test mode  
✅ **SMTP Server Settings** - Host, port, SSL/TLS options  
✅ **Authentication** - Username and password fields  
✅ **Email Preferences** - From address and app URL  
✅ **Test Email** - Send test email to verify configuration  
✅ **Quick Setup Guides** - Example configurations for popular providers  
✅ **Save Button** - Persist settings to database  

---

## Step-by-Step: Configure Gmail

### **Step 1: Access Settings**
1. Login as admin (admin@example.com / admin123)
2. Click **⚙️ Settings** in navigation
3. You'll see the Email Configuration tab

### **Step 2: Enable Gmail 2FA**
1. Go to https://myaccount.google.com/security
2. Click "2-Step Verification"
3. Follow the prompts to enable

### **Step 3: Generate App Password**
1. Go to https://myaccount.google.com/apppasswords
2. Select "Mail" and your device
3. Click "Generate"
4. **Copy the 16-character password** (e.g., "abcd efgh ijkl mnop")

### **Step 4: Fill in Settings**

**SMTP Server Settings:**
- SMTP Host: `smtp.gmail.com`
- SMTP Port: `587`
- Use SSL/TLS: `No (TLS - Port 587)`

**SMTP Authentication:**
- SMTP Username: `your-email@gmail.com`
- SMTP Password: `abcd efgh ijkl mnop` (the App Password)

**Email Preferences:**
- From Email Address: `IB Cybersecurity <your-email@gmail.com>`
- Application URL: `http://127.0.0.1:3012` (or your domain)

### **Step 5: Test Configuration**
1. Scroll to "Test Email Configuration" section
2. Enter your email address
3. Click "🧪 Send Test" button
4. Check your inbox for test email

### **Step 6: Save Settings**
1. Click green "💾 Save Settings" button at bottom
2. See success message: "✅ Settings saved successfully!"
3. Email service is now configured!

---

## Step-by-Step: Configure Office 365

### **Fill in Settings:**

**SMTP Server Settings:**
- SMTP Host: `smtp.office365.com`
- SMTP Port: `587`
- Use SSL/TLS: `No (TLS - Port 587)`

**SMTP Authentication:**
- SMTP Username: `your-email@company.com`
- SMTP Password: `your-password`

**Note:** If your account has MFA enabled, you may need to generate an app password.

---

## Step-by-Step: Configure SendGrid

### **Step 1: Create SendGrid Account**
1. Go to https://sendgrid.com
2. Sign up (free tier available)
3. Verify your email

### **Step 2: Create API Key**
1. In SendGrid dashboard, go to Settings → API Keys
2. Click "Create API Key"
3. Name it (e.g., "IB Cybersecurity")
4. Select "Full Access"
5. **Copy the API key** (starts with "SG.")

### **Step 3: Verify Sender**
1. Go to Settings → Sender Authentication
2. Click "Verify Single Sender"
3. Enter your email and verify

### **Step 4: Fill in Settings:**

**SMTP Server Settings:**
- SMTP Host: `smtp.sendgrid.net`
- SMTP Port: `587`
- Use SSL/TLS: `No (TLS - Port 587)`

**SMTP Authentication:**
- SMTP Username: `apikey` (literally "apikey", not your email)
- SMTP Password: `SG.xxxxxxxxxxxxxxxxxxxxx` (your API key)

**Email Preferences:**
- From Email Address: `IB Cybersecurity <verified@yourdomain.com>`

---

## Features

### **Status Indicator**

Shows current configuration status at the top:

**✅ Configured (Green):**
```
┌────────────────────────────────────────────┐
│ ✓ Email Service Configured                │
│   SMTP is configured and ready to send... │
└────────────────────────────────────────────┘
```

**⚠️ Not Configured (Yellow):**
```
┌────────────────────────────────────────────┐
│ ⚠ Email Service Not Configured            │
│   Running in TEST MODE - emails logged... │
└────────────────────────────────────────────┘
```

### **Password Security**

- Passwords are **encrypted** in database
- Displayed as `••••••••` in the UI
- Only updated when you enter new value
- Uses AES-256 encryption

### **Test Email**

Send a test email to verify configuration:

1. Enter email address in test field
2. Click "🧪 Send Test"
3. Receive test email with configuration details:
   ```
   Subject: 🧪 IB Cybersecurity - Test Email
   
   Test Email Successful!
   
   If you're reading this, your email configuration is working correctly.
   
   Configuration Details:
   • SMTP Host: smtp.gmail.com
   • SMTP Port: 587
   • From: IB Cybersecurity <your-email@gmail.com>
   ```

### **Quick Setup Guides**

Built-in reference for popular providers:

- **Gmail:** smtp.gmail.com:587
- **Office 365:** smtp.office365.com:587
- **SendGrid:** smtp.sendgrid.net:587

---

## Database Storage

Settings are stored in the `system_settings` table:

```sql
SELECT * FROM system_settings WHERE "settingKey" LIKE 'email_%';
```

**Settings Stored:**
- `email_smtp_host` - SMTP server hostname
- `email_smtp_port` - SMTP port number
- `email_smtp_secure` - SSL/TLS flag
- `email_smtp_user` - SMTP username
- `email_smtp_password` - SMTP password (encrypted)
- `email_from` - From email address
- `app_url` - Application URL for links

---

## API Endpoints

### **GET** `/api/settings/email`
Get current email settings.

**Response:**
```json
{
  "settings": {
    "email_smtp_host": "smtp.gmail.com",
    "email_smtp_port": "587",
    "email_smtp_secure": "false",
    "email_smtp_user": "your-email@gmail.com",
    "email_smtp_password": "••••••••",
    "email_from": "IB Cybersecurity <your-email@gmail.com>",
    "app_url": "http://127.0.0.1:3012"
  },
  "isConfigured": true
}
```

### **POST** `/api/settings/bulk`
Save multiple settings at once.

**Request:**
```json
{
  "settings": {
    "email_smtp_host": "smtp.gmail.com",
    "email_smtp_user": "your-email@gmail.com",
    ...
  }
}
```

### **POST** `/api/settings/email/test`
Send test email.

**Request:**
```json
{
  "testEmail": "test@example.com"
}
```

---

## Priority Order

Email service checks for configuration in this order:

1. **Database Settings** (from Settings page) - **Highest Priority**
2. **Environment Variables** (.env file) - Fallback
3. **Test Mode** - If nothing configured

This means:
- Settings page overrides `.env` file
- You can use either method
- Database settings take precedence

---

## Troubleshooting

### **Issue: "Failed to save settings"**

**Possible Causes:**
- Not logged in as admin
- Network error
- Database connection issue

**Solution:**
- Verify you're admin role
- Check browser console for errors
- Check backend logs

### **Issue: "Test email failed to send"**

**Check:**
1. SMTP Host is correct
2. SMTP Port is correct (usually 587)
3. Username is your full email
4. Password is App Password (for Gmail), not regular password
5. From address matches SMTP username (for most providers)

**View Logs:**
```bash
tail -f ~/factory/launcher/logs/inspired-benevolence.log
```

### **Issue: Settings not taking effect**

**Solution:**
- Click "💾 Save Settings" button
- Backend automatically reinitializes email service
- No restart required!

---

## Security Best Practices

### **1. Access Control**
- ✅ Only admins can access Settings page
- ✅ Non-admins see 403 Forbidden
- ✅ API endpoints require admin role

### **2. Password Encryption**
- ✅ SMTP passwords encrypted in database (AES-256)
- ✅ Never displayed in plain text
- ✅ Shown as `••••••••` in UI

### **3. Audit Trail**
- ✅ `updatedBy` field tracks who changed settings
- ✅ `updatedAt` timestamp for each change
- ✅ View history:
  ```sql
  SELECT "settingKey", "updatedBy", "updatedAt" 
  FROM system_settings 
  ORDER BY "updatedAt" DESC;
  ```

### **4. Environment Isolation**
- Development: Test mode by default
- Production: Configure via Settings page
- Separate configs per environment

---

## Migration from .env File

### **If you already have .env configured:**

Settings page will automatically show:
- ⚠️ "Email Service Not Configured" (because database is empty)
- But emails still work (using .env as fallback)

### **To migrate to Settings page:**

1. Open `.env` file and copy your SMTP values
2. Go to Settings page
3. Paste values into form
4. Click "Save Settings"
5. Settings now stored in database!
6. Database settings now take priority

### **Keep or remove .env?**

**Option 1: Keep as fallback**
- Leave SMTP settings in `.env`
- Database settings take priority
- Falls back to `.env` if database cleared

**Option 2: Remove from .env**
- Clear SMTP settings from `.env`
- Only database settings used
- Cleaner separation

---

## Benefits

### **For Administrators**

✅ **No SSH required** - Configure from web UI  
✅ **No restart needed** - Changes apply immediately  
✅ **Visual feedback** - See if configured or test mode  
✅ **Test before saving** - Verify configuration works  
✅ **User-friendly** - No need to remember SMTP settings  
✅ **Secure** - Passwords encrypted automatically  

### **For Teams**

✅ **Shared configuration** - All instances use same settings  
✅ **Audit trail** - Track who changed what  
✅ **No file editing** - Reduce configuration errors  
✅ **Quick setup** - Built-in guides for popular providers  

---

## Quick Reference

### **Access Settings**
1. Login as admin
2. Click ⚙️ Settings in navigation
3. Configure email settings
4. Test configuration
5. Save settings

### **Gmail Setup**
```
Host: smtp.gmail.com
Port: 587
User: your-email@gmail.com
Pass: App Password (16 chars)
```

### **SendGrid Setup**
```
Host: smtp.sendgrid.net
Port: 587
User: apikey
Pass: SG.your-api-key
```

### **Test Email**
```
1. Enter email address
2. Click "Send Test"
3. Check inbox
```

---

## Summary

✅ **Settings page created** - Accessible from navigation menu  
✅ **Email configuration UI** - Full SMTP setup interface  
✅ **Database storage** - Settings persisted to database  
✅ **Password encryption** - Secure storage of credentials  
✅ **Test email feature** - Verify configuration works  
✅ **Admin-only access** - Secure configuration management  
✅ **No restart needed** - Changes apply immediately  
✅ **Quick setup guides** - Built-in provider examples  

**URL:** http://127.0.0.1:3012/settings  
**Login:** admin@example.com / admin123  

**Configure your email settings through the UI - no more editing files!** ⚙️✨

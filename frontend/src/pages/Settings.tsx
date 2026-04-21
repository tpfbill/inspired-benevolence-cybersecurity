import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Settings as SettingsIcon, Mail, Save, TestTube, CheckCircle, XCircle } from 'lucide-react';
import apiClient from '../api/client';

export default function Settings() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'email'>('email');
  const [emailSettings, setEmailSettings] = useState({
    email_smtp_host: '',
    email_smtp_port: '587',
    email_smtp_secure: 'false',
    email_smtp_user: '',
    email_smtp_password: '',
    email_from: 'IB Cybersecurity <noreply@ibcybersecurity.com>',
    app_url: 'http://127.0.0.1:3012'
  });
  const [testEmail, setTestEmail] = useState('');

  const { data: emailData, isLoading } = useQuery({
    queryKey: ['settings', 'email'],
    queryFn: async () => {
      const response = await apiClient.get('/api/settings/email');
      return response.data;
    },
    onSuccess: (data) => {
      if (data.settings) {
        setEmailSettings(prev => ({
          ...prev,
          ...data.settings
        }));
      }
    }
  });

  const saveSettingsMutation = useMutation({
    mutationFn: async (settings: Record<string, string>) => {
      return apiClient.post('/api/settings/bulk', { settings });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      alert('✅ Settings saved successfully!');
    },
    onError: (error: any) => {
      alert(`❌ Failed to save settings: ${error.response?.data?.message || error.message}`);
    }
  });

  const testEmailMutation = useMutation({
    mutationFn: async (email: string) => {
      return apiClient.post('/api/settings/email/test', { testEmail: email });
    },
    onSuccess: () => {
      alert(`✅ Test email sent to ${testEmail}! Check your inbox.`);
      setTestEmail('');
    },
    onError: (error: any) => {
      alert(`❌ Failed to send test email: ${error.response?.data?.message || error.message}`);
    }
  });

  const handleSave = () => {
    saveSettingsMutation.mutate(emailSettings);
  };

  const handleTestEmail = () => {
    if (!testEmail) {
      alert('Please enter an email address');
      return;
    }
    testEmailMutation.mutate(testEmail);
  };

  if (isLoading) {
    return <div className="text-center py-12">Loading settings...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <SettingsIcon className="w-8 h-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
          <p className="text-gray-600 mt-1">Configure system-wide settings and preferences</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('email')}
            className={`px-4 py-2 font-medium transition-colors flex items-center gap-2 ${
              activeTab === 'email'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Mail className="w-4 h-4" />
            Email Configuration
          </button>
        </div>
      </div>

      {/* Email Configuration Tab */}
      {activeTab === 'email' && (
        <div className="space-y-6">
          {/* Status Card */}
          <div className={`card border-l-4 ${emailData?.isConfigured ? 'border-green-500 bg-green-50' : 'border-yellow-500 bg-yellow-50'}`}>
            <div className="flex items-center gap-3">
              {emailData?.isConfigured ? (
                <>
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <div>
                    <h3 className="font-semibold text-green-900">Email Service Configured</h3>
                    <p className="text-sm text-green-700">SMTP is configured and ready to send emails</p>
                  </div>
                </>
              ) : (
                <>
                  <XCircle className="w-6 h-6 text-yellow-600" />
                  <div>
                    <h3 className="font-semibold text-yellow-900">Email Service Not Configured</h3>
                    <p className="text-sm text-yellow-700">Running in TEST MODE - emails logged to console only</p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* SMTP Settings */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">SMTP Server Settings</h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SMTP Host *
                  </label>
                  <input
                    type="text"
                    className="input w-full"
                    value={emailSettings.email_smtp_host}
                    onChange={(e) => setEmailSettings({...emailSettings, email_smtp_host: e.target.value})}
                    placeholder="smtp.gmail.com"
                  />
                  <p className="text-xs text-gray-500 mt-1">SMTP server hostname</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SMTP Port *
                  </label>
                  <input
                    type="number"
                    className="input w-full"
                    value={emailSettings.email_smtp_port}
                    onChange={(e) => setEmailSettings({...emailSettings, email_smtp_port: e.target.value})}
                    placeholder="587"
                  />
                  <p className="text-xs text-gray-500 mt-1">Usually 587 (TLS) or 465 (SSL)</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Use SSL/TLS
                </label>
                <select
                  className="input w-full"
                  value={emailSettings.email_smtp_secure}
                  onChange={(e) => setEmailSettings({...emailSettings, email_smtp_secure: e.target.value})}
                >
                  <option value="false">No (TLS - Port 587)</option>
                  <option value="true">Yes (SSL - Port 465)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SMTP Username *
                </label>
                <input
                  type="text"
                  className="input w-full"
                  value={emailSettings.email_smtp_user}
                  onChange={(e) => setEmailSettings({...emailSettings, email_smtp_user: e.target.value})}
                  placeholder="your-email@gmail.com"
                />
                <p className="text-xs text-gray-500 mt-1">Your email address or SMTP username</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SMTP Password *
                </label>
                <input
                  type="password"
                  className="input w-full"
                  value={emailSettings.email_smtp_password}
                  onChange={(e) => setEmailSettings({...emailSettings, email_smtp_password: e.target.value})}
                  placeholder={emailSettings.email_smtp_password === '••••••••' ? 'Password unchanged' : 'Enter password or app password'}
                />
                <p className="text-xs text-gray-500 mt-1">
                  For Gmail: Use App Password (not regular password). <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Generate here</a>
                </p>
              </div>
            </div>
          </div>

          {/* Email Settings */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Email Preferences</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  From Email Address *
                </label>
                <input
                  type="email"
                  className="input w-full"
                  value={emailSettings.email_from}
                  onChange={(e) => setEmailSettings({...emailSettings, email_from: e.target.value})}
                  placeholder="IB Cybersecurity <noreply@yourcompany.com>"
                />
                <p className="text-xs text-gray-500 mt-1">Format: "Display Name &lt;email@domain.com&gt;"</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Application URL *
                </label>
                <input
                  type="url"
                  className="input w-full"
                  value={emailSettings.app_url}
                  onChange={(e) => setEmailSettings({...emailSettings, app_url: e.target.value})}
                  placeholder="http://127.0.0.1:3012"
                />
                <p className="text-xs text-gray-500 mt-1">Used for links in email notifications</p>
              </div>
            </div>
          </div>

          {/* Test Email */}
          <div className="card bg-blue-50 border-l-4 border-blue-500">
            <h2 className="text-lg font-semibold text-blue-900 mb-3 flex items-center gap-2">
              <TestTube className="w-5 h-5" />
              Test Email Configuration
            </h2>
            <p className="text-sm text-blue-700 mb-4">
              Send a test email to verify your configuration is working correctly.
            </p>
            <div className="flex gap-3">
              <input
                type="email"
                className="input flex-1"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="Enter email address to test"
              />
              <button
                onClick={handleTestEmail}
                disabled={testEmailMutation.isPending}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center gap-2"
              >
                {testEmailMutation.isPending ? (
                  <>⏳ Sending...</>
                ) : (
                  <>
                    <TestTube className="w-4 h-4" />
                    Send Test
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end gap-3 sticky bottom-0 bg-white p-4 border-t shadow-lg">
            <button
              onClick={handleSave}
              disabled={saveSettingsMutation.isPending}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 flex items-center gap-2 font-medium"
            >
              {saveSettingsMutation.isPending ? (
                <>⏳ Saving...</>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save Settings
                </>
              )}
            </button>
          </div>

          {/* Help Section */}
          <div className="card bg-gray-50">
            <h3 className="font-semibold text-gray-900 mb-3">📚 Quick Setup Guides</h3>
            <div className="space-y-2 text-sm text-gray-700">
              <div>
                <strong>Gmail:</strong> SMTP Host: <code className="bg-gray-200 px-2 py-1 rounded">smtp.gmail.com</code>, Port: 587, 
                Generate App Password at <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google Account</a>
              </div>
              <div>
                <strong>Office 365:</strong> SMTP Host: <code className="bg-gray-200 px-2 py-1 rounded">smtp.office365.com</code>, Port: 587
              </div>
              <div>
                <strong>SendGrid:</strong> SMTP Host: <code className="bg-gray-200 px-2 py-1 rounded">smtp.sendgrid.net</code>, Port: 587, 
                Username: <code className="bg-gray-200 px-2 py-1 rounded">apikey</code>, Password: Your SendGrid API Key
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

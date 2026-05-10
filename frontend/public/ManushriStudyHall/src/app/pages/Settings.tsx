import { Header } from '../components/Header';
import { User, Bell, Lock, Palette, Globe, HelpCircle } from 'lucide-react';

export function Settings() {
  const settingsGroups = [
    {
      title: 'Account',
      items: [
        { icon: User, label: 'Profile Settings', description: 'Manage your account details' },
        { icon: Lock, label: 'Security', description: 'Password and authentication' },
      ],
    },
    {
      title: 'Preferences',
      items: [
        { icon: Bell, label: 'Notifications', description: 'Manage notification preferences' },
        { icon: Palette, label: 'Appearance', description: 'Theme and display settings' },
        { icon: Globe, label: 'Language', description: 'Select your preferred language' },
      ],
    },
    {
      title: 'Support',
      items: [
        { icon: HelpCircle, label: 'Help Center', description: 'Get help and support' },
      ],
    },
  ];

  return (
    <div className="min-h-screen">
      <Header title="Settings" />

      <div className="p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-slate-900">Settings</h3>
            <p className="text-sm text-slate-600 mt-1">Manage your account and preferences</p>
          </div>

          <div className="space-y-8">
            {settingsGroups.map((group) => (
              <div key={group.title}>
                <h4 className="text-sm font-semibold text-slate-900 mb-3 uppercase tracking-wider">
                  {group.title}
                </h4>
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                  {group.items.map((item, idx) => (
                    <button
                      key={item.label}
                      className={`w-full flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors ${
                        idx !== group.items.length - 1 ? 'border-b border-slate-200' : ''
                      }`}
                    >
                      <div className="p-2 bg-slate-100 rounded-lg">
                        <item.icon size={20} className="text-slate-600" />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-sm font-medium text-slate-900">{item.label}</p>
                        <p className="text-xs text-slate-600 mt-0.5">{item.description}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

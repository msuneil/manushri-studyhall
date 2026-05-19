import { useState } from 'react';
import { Header } from '../../components/Header';
import { useToast } from '../../components/Toast';
import { useConfirmation } from '../../components/Confirmation';
import { SettingsHeroCard } from './components/SettingsHeroCard';
import { SettingsSection } from './components/SettingsSection';
import { SettingsGroupCard } from './components/SettingsGroupCard';
import { SettingsChevronRow } from './components/SettingsChevronRow';
import { SettingsDangerAction } from './components/SettingsDangerAction';
import { SettingsVersionFooter } from './components/SettingsVersionFooter';
import { settingsSections } from './mock/settingsData';

// Sheets
import { HallDetailsSheet } from './sheets/HallDetailsSheet';
import { RoomDefaultsSheet } from './sheets/RoomDefaultsSheet';
import { SeatPricingSheet } from './sheets/SeatPricingSheet';
import { AttendanceSettingsSheet } from './sheets/AttendanceSettingsSheet';
import { ReminderSettingsSheet } from './sheets/ReminderSettingsSheet';
import { FeeSettingsSheet } from './sheets/FeeSettingsSheet';
import { AdminAccessSheet } from './sheets/AdminAccessSheet';
import { OwnerProfileSheet } from './sheets/OwnerProfileSheet';
import { ExportDataSheet } from './sheets/ExportDataSheet';
import { BackupConfirmationSheet } from './sheets/BackupConfirmationSheet';
import { NotificationPreferencesSheet } from './sheets/NotificationPreferencesSheet';

export function SettingsView() {
  const { showToast } = useToast();
  const { confirm } = useConfirmation();
  const [activeSheet, setActiveSheet] = useState<string | null>(null);

  const handleSignOut = async () => {
    const confirmed = await confirm({
      title: "Sign Out?",
      description: "Are you sure you want to sign out? You will need to re-authenticate to access the Study Hall dashboard.",
      severity: "destructive",
      confirmLabel: "Sign Out",
      cancelLabel: "Cancel"
    });
    if (confirmed) {
      showToast('Signed out successfully', 'success');
    }
  };

  const handleSave = (sheetName: string) => {
    showToast(`${sheetName} saved successfully`, 'success');
    setActiveSheet(null);
  };

  const handleExportSuccess = () => {
    showToast('Data exported successfully. Download starting.', 'success');
    setActiveSheet(null);
  };

  const handleBackupSuccess = () => {
    showToast('Cloud backup completed successfully.', 'success');
    setActiveSheet(null);
  };

  return (
    <div className="flex flex-col min-h-full">
      <Header title="Settings" subtitle="Manage Operations" showBack />

      <div className="p-4 md:p-8 max-w-3xl mx-auto w-full space-y-8 pb-32">
        {/* Study Hall Hero Card */}
        <SettingsHeroCard 
          onExport={() => setActiveSheet('export-data')} 
          onBackup={() => setActiveSheet('backup-confirmation')} 
        />

        {/* Setting Sections */}
        <div className="space-y-8">
          {settingsSections.map((section) => (
            <SettingsSection key={section.title} title={section.title}>
              <SettingsGroupCard>
                {section.items.map((item) => (
                  <SettingsChevronRow
                    key={item.label}
                    icon={item.icon}
                    label={item.label}
                    sub={item.sub}
                    color={item.color}
                    bg={item.bg}
                    onClick={() => setActiveSheet(item.id)}
                  />
                ))}
              </SettingsGroupCard>
            </SettingsSection>
          ))}
        </div>

        {/* Account Actions */}
        <SettingsDangerAction 
          label="Sign Out of Account" 
          onClick={handleSignOut} 
        />

        {/* Version Info */}
        <SettingsVersionFooter />
      </div>

      {/* Forms & Configuration Sheets */}
      <HallDetailsSheet 
        isOpen={activeSheet === 'hall-details'} 
        onClose={() => setActiveSheet(null)}
        onSave={() => handleSave('Hall Details')}
      />
      <RoomDefaultsSheet 
        isOpen={activeSheet === 'room-defaults'} 
        onClose={() => setActiveSheet(null)}
        onSave={() => handleSave('Room Defaults')}
      />
      <SeatPricingSheet 
        isOpen={activeSheet === 'seat-pricing'} 
        onClose={() => setActiveSheet(null)}
        onSave={() => handleSave('Seat Pricing')}
      />
      <AttendanceSettingsSheet 
        isOpen={activeSheet === 'attendance-settings'} 
        onClose={() => setActiveSheet(null)}
        onSave={() => handleSave('Attendance Settings')}
      />
      <ReminderSettingsSheet 
        isOpen={activeSheet === 'reminder-settings'} 
        onClose={() => setActiveSheet(null)}
        onSave={() => handleSave('Reminder Settings')}
      />
      <FeeSettingsSheet 
        isOpen={activeSheet === 'fee-settings'} 
        onClose={() => setActiveSheet(null)}
        onSave={() => handleSave('Fee Settings')}
      />
      <AdminAccessSheet 
        isOpen={activeSheet === 'admin-access'} 
        onClose={() => setActiveSheet(null)}
        onSave={() => handleSave('Admin Access')}
      />
      <OwnerProfileSheet 
        isOpen={activeSheet === 'owner-profile'} 
        onClose={() => setActiveSheet(null)}
        onSave={() => handleSave('Owner Profile')}
      />
      
      {/* Operational Actions Sheets */}
      <ExportDataSheet
        isOpen={activeSheet === 'export-data'}
        onClose={() => setActiveSheet(null)}
        onExport={handleExportSuccess}
      />
      <BackupConfirmationSheet
        isOpen={activeSheet === 'backup-confirmation'}
        onClose={() => setActiveSheet(null)}
        onBackup={handleBackupSuccess}
      />

      {/* Placeholders */}
      <NotificationPreferencesSheet
        isOpen={activeSheet === 'notification-preferences'}
        onClose={() => setActiveSheet(null)}
      />
    </div>
  );
}

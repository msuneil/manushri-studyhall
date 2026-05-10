import { Header } from '../components/Header';
import { Bell, DollarSign, UserPlus, AlertCircle } from 'lucide-react';

export function Notifications() {
  const notifications = [
    {
      id: 1,
      type: 'payment',
      icon: DollarSign,
      title: 'Payment Received',
      message: 'Rahul Sharma paid ₹2,000 for AC-12',
      time: '2 hours ago',
      isRead: false,
    },
    {
      id: 2,
      type: 'new',
      icon: UserPlus,
      title: 'New Occupant',
      message: 'Divya Iyer joined seat AC-19',
      time: '5 hours ago',
      isRead: false,
    },
    {
      id: 3,
      type: 'reminder',
      icon: AlertCircle,
      title: 'Payment Reminder',
      message: '12 occupants have pending payments',
      time: '1 day ago',
      isRead: true,
    },
    {
      id: 4,
      type: 'payment',
      icon: DollarSign,
      title: 'Payment Received',
      message: 'Priya Patel paid ₹1,500 for NAC-23',
      time: '1 day ago',
      isRead: true,
    },
    {
      id: 5,
      type: 'new',
      icon: UserPlus,
      title: 'New Occupant',
      message: 'Arjun Rao joined seat NAC-08',
      time: '2 days ago',
      isRead: true,
    },
  ];

  const getIconColor = (type: string) => {
    switch (type) {
      case 'payment':
        return 'bg-green-100 text-green-600';
      case 'new':
        return 'bg-indigo-100 text-indigo-600';
      case 'reminder':
        return 'bg-amber-100 text-amber-600';
      default:
        return 'bg-slate-100 text-slate-600';
    }
  };

  return (
    <div className="min-h-screen">
      <Header title="Notifications" />

      <div className="p-4 md:p-8">
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden max-w-4xl mx-auto">
          <div className="p-6 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">All Notifications</h3>
              <p className="text-sm text-slate-600 mt-1">Stay updated with all activities</p>
            </div>
            <button className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
              Mark all as read
            </button>
          </div>

          <div className="divide-y divide-slate-200">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-6 hover:bg-slate-50 transition-colors ${
                  !notification.isRead ? 'bg-indigo-50/30' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl ${getIconColor(notification.type)}`}>
                    <notification.icon size={20} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold text-slate-900 mb-1">
                          {notification.title}
                        </h4>
                        <p className="text-sm text-slate-600">{notification.message}</p>
                      </div>
                      {!notification.isRead && (
                        <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-2">{notification.time}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 bg-slate-50 text-center">
            <button className="text-sm font-medium text-slate-600 hover:text-slate-900">
              Load more notifications
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

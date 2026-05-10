import { Header } from '../components/Header';
import { Modal } from '../components/Modal';
import { Mail, Phone, Calendar, Upload, IndianRupee, Percent } from 'lucide-react';
import { useState } from 'react';

export function Occupants() {
  const [showAddOccupant, setShowAddOccupant] = useState(false);
  const [selectedOccupant, setSelectedOccupant] = useState<any>(null);

  const occupants = [
    { id: 1, name: 'Rahul Sharma', seat: 'AC-12', email: 'rahul@email.com', phone: '+91 98765 43210', joinDate: '2026-01-15', status: 'Active', attendance: 92, monthlyFee: 2000 },
    { id: 2, name: 'Priya Patel', seat: 'NAC-23', email: 'priya@email.com', phone: '+91 98765 43211', joinDate: '2026-02-01', status: 'Active', attendance: 88, monthlyFee: 1500 },
    { id: 3, name: 'Amit Kumar', seat: 'AC-05', email: 'amit@email.com', phone: '+91 98765 43212', joinDate: '2026-01-20', status: 'Active', attendance: 95, monthlyFee: 2000 },
    { id: 4, name: 'Sneha Reddy', seat: 'AC-34', email: 'sneha@email.com', phone: '+91 98765 43213', joinDate: '2026-03-10', status: 'Active', attendance: 85, monthlyFee: 2000 },
    { id: 5, name: 'Vikram Singh', seat: 'NAC-45', email: 'vikram@email.com', phone: '+91 98765 43214', joinDate: '2026-02-15', status: 'Active', attendance: 90, monthlyFee: 1500 },
    { id: 6, name: 'Anjali Mehta', seat: 'AC-28', email: 'anjali@email.com', phone: '+91 98765 43215', joinDate: '2026-01-25', status: 'Active', attendance: 87, monthlyFee: 2000 },
  ];

  const paymentHistory = [
    { month: 'May 2026', amount: '₹2,000', status: 'Paid', date: '2026-05-01' },
    { month: 'April 2026', amount: '₹2,000', status: 'Paid', date: '2026-04-01' },
    { month: 'March 2026', amount: '₹2,000', status: 'Paid', date: '2026-03-01' },
  ];

  return (
    <div className="min-h-screen">
      <Header title="Occupants" />

      <div className="p-4 md:p-8">
        <div className="mb-4 md:mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h3 className="text-lg md:text-xl font-semibold text-slate-900">All Occupants</h3>
            <p className="text-sm text-slate-600 mt-1">Total {occupants.length} active occupants</p>
          </div>
          <button
            onClick={() => setShowAddOccupant(true)}
            className="w-full md:w-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors shadow-sm active:scale-95"
          >
            Add Occupant
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {occupants.map((occupant) => (
            <div
              key={occupant.id}
              className="bg-white rounded-2xl p-4 md:p-6 border border-slate-200 hover:shadow-xl transition-all duration-200"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                    {occupant.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900">{occupant.name}</h4>
                    <span className="inline-flex mt-1 px-2.5 py-0.5 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">
                      {occupant.seat}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Mail size={16} className="text-slate-400" />
                  <span>{occupant.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Phone size={16} className="text-slate-400" />
                  <span>{occupant.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Calendar size={16} className="text-slate-400" />
                  <span>Joined {occupant.joinDate}</span>
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t border-slate-200">
                <button className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-medium transition-colors active:scale-95">
                  Contact
                </button>
                <button
                  onClick={() => setSelectedOccupant(occupant)}
                  className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition-colors active:scale-95"
                >
                  View Profile
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Modal
        isOpen={showAddOccupant}
        onClose={() => setShowAddOccupant(false)}
        title="Add New Occupant"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Upload Photo</label>
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-indigo-400 transition-colors cursor-pointer">
              <Upload className="mx-auto text-slate-400 mb-2" size={32} />
              <p className="text-sm text-slate-600">Click to upload photo</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
            <input
              type="text"
              placeholder="Enter full name"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
            <input
              type="email"
              placeholder="email@example.com"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Phone Number</label>
            <input
              type="tel"
              placeholder="+91 98765 43210"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Seat Number</label>
            <select className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm">
              <option>Select seat</option>
              <option>AC-01</option>
              <option>AC-02</option>
              <option>NAC-01</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={() => setShowAddOccupant(false)}
              className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors">
              Add Occupant
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={!!selectedOccupant}
        onClose={() => setSelectedOccupant(null)}
        title="Occupant Profile"
        maxWidth="max-w-4xl"
      >
        {selectedOccupant && (
          <div className="space-y-6">
            <div className="flex items-start gap-6">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-3xl font-semibold flex-shrink-0">
                {selectedOccupant.name.split(' ').map((n: string) => n[0]).join('')}
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-semibold text-slate-900">{selectedOccupant.name}</h3>
                <div className="flex items-center gap-4 mt-2 text-sm text-slate-600">
                  <span className="flex items-center gap-1">
                    <Mail size={14} />
                    {selectedOccupant.email}
                  </span>
                  <span className="flex items-center gap-1">
                    <Phone size={14} />
                    {selectedOccupant.phone}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4">
              <div className="p-4 bg-indigo-50 rounded-lg">
                <p className="text-xs text-slate-600 mb-1">Seat Number</p>
                <p className="text-lg font-semibold text-slate-900">{selectedOccupant.seat}</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-xs text-slate-600 mb-1 flex items-center gap-1">
                  <Percent size={12} />
                  Attendance
                </p>
                <p className="text-lg font-semibold text-green-600">{selectedOccupant.attendance}%</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <p className="text-xs text-slate-600 mb-1 flex items-center gap-1">
                  <IndianRupee size={12} />
                  Monthly Fee
                </p>
                <p className="text-lg font-semibold text-slate-900">₹{selectedOccupant.monthlyFee}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-600 mb-1 flex items-center gap-1">
                  <Calendar size={12} />
                  Join Date
                </p>
                <p className="text-sm font-semibold text-slate-900">{selectedOccupant.joinDate}</p>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-slate-900 mb-3">Payment History</h4>
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-slate-600">Month</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-slate-600">Amount</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-slate-600">Status</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-slate-600">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {paymentHistory.map((payment, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="px-4 py-2 text-sm text-slate-900">{payment.month}</td>
                        <td className="px-4 py-2 text-sm font-semibold text-slate-900">{payment.amount}</td>
                        <td className="px-4 py-2">
                          <span className="inline-flex px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                            {payment.status}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-sm text-slate-600">{payment.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-slate-200">
              <button className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors">
                Edit Profile
              </button>
              <button className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors">
                Send Message
              </button>
              <button className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors ml-auto">
                Remove Occupant
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

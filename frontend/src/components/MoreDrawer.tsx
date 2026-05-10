import {
  Users,
  TrendingDown,
  CheckSquare,
  Bell,
  Settings,
  LogOut,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { Modal } from "./Modal";

interface MoreDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MoreDrawer({ isOpen, onClose }: MoreDrawerProps) {
  const menuItems = [
    { icon: Users, label: "Occupants", path: "/occupants" },
    { icon: TrendingDown, label: "Expenses", path: "/expenses" },
    { icon: CheckSquare, label: "Tasks", path: "/tasks" },
    { icon: Bell, label: "Notifications", path: "/notifications" },
    { icon: Settings, label: "Settings", path: "/settings" },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="More" isMenu={true}>
      <div className="grid grid-cols-2 gap-3 pb-4">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={onClose}
            className={({ isActive }) => `
              flex flex-col items-center gap-3 p-4 rounded-2xl border transition-all duration-200
              ${
                isActive
                  ? "bg-indigo-50 border-indigo-200 text-indigo-700"
                  : "bg-white border-slate-100 text-slate-700 hover:border-indigo-100 hover:bg-slate-50"
              }
            `}
          >
            <div
              className={`p-3 rounded-xl ${item.path === "/settings" ? "bg-slate-100" : "bg-indigo-100 text-indigo-600"}`}
            >
              <item.icon size={24} />
            </div>
            <span className="text-sm font-bold">{item.label}</span>
          </NavLink>
        ))}

        <button className="flex flex-col items-center gap-3 p-4 rounded-2xl border border-red-50 bg-red-50/30 text-red-600 col-span-2 mt-2">
          <div className="p-3 bg-red-100 rounded-xl">
            <LogOut size={24} />
          </div>
          <span className="text-sm font-bold">Logout</span>
        </button>
      </div>
    </Modal>
  );
}

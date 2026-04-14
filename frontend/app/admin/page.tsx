'use client';

import { useState } from 'react';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { VerificationDashboard } from '@/components/admin/VerificationDashboard';
import { DisputeManagement } from '@/components/admin/DisputeManagement';
import {
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  Menu,
  X,
} from 'lucide-react';

type AdminTab = 'dashboard' | 'verifications' | 'disputes';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const tabs = [
    {
      id: 'dashboard' as AdminTab,
      label: 'Dashboard',
      icon: <BarChart3 size={20} />,
    },
    {
      id: 'verifications' as AdminTab,
      label: 'Verifications',
      icon: <CheckCircle2 size={20} />,
    },
    {
      id: 'disputes' as AdminTab,
      label: 'Disputes',
      icon: <AlertTriangle size={20} />,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-100 rounded lg:hidden"
            >
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-600">
              <p className="font-semibold">Admin User</p>
              <p>Last login: Today at 10:30 AM</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div
          className={`${
            sidebarOpen ? 'w-64' : 'w-0'
          } bg-white shadow transition-all duration-300 overflow-hidden`}
        >
          <nav className="p-4 space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {tab.icon}
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-4 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'dashboard' && <AdminDashboard />}
            {activeTab === 'verifications' && <VerificationDashboard />}
            {activeTab === 'disputes' && <DisputeManagement />}
          </div>
        </div>
      </div>
    </div>
  );
}

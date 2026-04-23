// layouts/portal/MainLayout.jsx
import React from 'react';
import Header from './Header';
import PortalDashboardSidebar from '@/components/portal/PortalDashboardSidebar';

const MainLayout = ({ children }) => {
  return (
    <div className="h-screen w-full bg-gray-50 overflow-hidden">
      {/* Sidebar - fixed on the left */}
      <aside className="fixed left-0 top-0 z-40 h-screen w-[300px] overflow-hidden border-r border-gray-200">
        <PortalDashboardSidebar />
      </aside>

      {/* Main Content Area - only this section scrolls */}
      <div className="ml-[300px] flex h-screen flex-col overflow-hidden">
        <div className="flex-shrink-0">
          <Header />
        </div>

        <main className="flex-grow overflow-y-auto" style={{ backgroundColor: '#E3EED4' }}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
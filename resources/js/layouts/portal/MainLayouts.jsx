// layouts/portal/MainLayout.jsx
import React, { useEffect, useState } from 'react';
import { usePage } from '@inertiajs/react';
import Header from './Header';
import PortalDashboardSidebar from '@/components/portal/PortalDashboardSidebar';

const MainLayout = ({ children }) => {
  const { props } = usePage();
  const [sidebarOpen, setSidebarOpen] = useState(props?.sidebarOpen ?? true);
  const sidebarWidth = sidebarOpen ? 300 : 88;

  useEffect(() => {
    document.cookie = `sidebar_state=${sidebarOpen ? 'true' : 'false'}; path=/; max-age=31536000`;
  }, [sidebarOpen]);

  return (
    <div className="h-screen w-full overflow-hidden" style={{ backgroundColor: 'rgb(227, 238, 212)' }}>
      {/* Sidebar - fixed on the left */}
      <aside
        className="fixed left-0 top-0 z-40 h-screen overflow-hidden border-r border-gray-200 transition-[width] duration-200"
        style={{ width: `${sidebarWidth}px` }}
      >
        <PortalDashboardSidebar
          collapsed={!sidebarOpen}
          onToggleCollapsed={() => setSidebarOpen((prev) => !prev)}
        />
      </aside>

      {/* Main Content Area - only this section scrolls */}
      <div
        className="flex h-screen flex-col overflow-hidden transition-[margin] duration-200"
        style={{ marginLeft: `${sidebarWidth}px` }}
      >
        <div className="flex-shrink-0">
          <Header />
        </div>

        <main className="flex-grow overflow-y-auto" style={{ backgroundColor: 'rgb(227, 238, 212)' }}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
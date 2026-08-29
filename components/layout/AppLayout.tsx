import React from 'react';
import MainSidebar from './MainSidebar';
import HeaderNav from './HeaderNav';
import RightSidebar from './RightSidebar';
import { Page, User } from '../../types';

interface AppLayoutProps {
  children?: React.ReactNode;
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
  handleLogout: () => void;
  currentUser: User;
  handleRequestActivation: () => void;
}

export default function AppLayout({ children, currentPage, setCurrentPage, handleLogout, currentUser, handleRequestActivation }: AppLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-[#FAF8F5] dark:bg-[#080B14] text-[#1C1917] dark:text-slate-100 selection:bg-indigo-500/20 selection:text-indigo-900 dark:selection:bg-indigo-500/30 dark:selection:text-indigo-200 transition-colors duration-200">
      {/* Sidebar Navigation */}
      <MainSidebar currentPage={currentPage} setCurrentPage={setCurrentPage} currentUser={currentUser} />
      
      {/* Main App Canvas */}
      <div className="flex flex-col flex-1 overflow-hidden min-w-0 bg-[#FAF8F5] dark:bg-[#080B14] transition-colors duration-200">
        <HeaderNav 
          setCurrentPage={setCurrentPage} 
          handleLogout={handleLogout} 
          currentUser={currentUser} 
          handleRequestActivation={handleRequestActivation} 
        />
        
        <div className="flex flex-1 overflow-hidden min-w-0 relative">
          {/* Scrollable Work Area */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 min-w-0 bg-grid-pattern scrollbar-thin" id="printable-content">
            <div className="max-w-7xl mx-auto space-y-6">
              {children}
            </div>
          </main>
          
          <RightSidebar />
        </div>
      </div>
    </div>
  );
}

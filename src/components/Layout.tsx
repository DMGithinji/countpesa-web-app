import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronLeft, LayoutDashboard, BarChart2, Users, Tags } from 'lucide-react';
import { Button } from './ui/button';
import UploadStatementButton from './UploadStatementButton';

type MainLayoutProps = {
  children: React.ReactNode;
};

const MainLayout = ({ children }: MainLayoutProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };


  const navItems = [
    { path: '/', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { path: '/transactions', icon: <BarChart2 size={20} />, label: 'Transactions' },
    { path: '/accounts', icon: <Users size={20} />, label: 'Senders/Receivers' },
    { path: '/categories', icon: <Tags size={20} />, label: 'Categories' },
  ];

  return (
    <div className={`flex h-screen overflow-hidden  text-gray-800`}>
      {/* Sidebar */}
      <div
        className={`bg-gray-800 flex flex-col bg-dark-card border-r border-gray-800 transition-all duration-300 ${
          collapsed ? 'w-16' : 'w-64'
        }`}
      >
        {/* Logo */}
        <div className="p-4 flex items-center justify-between border-b border-gray-800 h-16">
          <Link to="/" className="flex items-center">
            {!collapsed && (
              <div className="bg-green-primary text-white font-bold px-2 py-1 rounded">
                CheckPesa
              </div>
            )}
            {collapsed && (
              <div className="bg-green-primary text-white font-bold px-2 py-1 rounded">
                CP
              </div>
            )}
          </Link>
          <Button variant={'link'} size={'sm'} onClick={toggleSidebar} className="bg-gray-600 text-white cursor-pointer w-6 h-6">
            <ChevronLeft size={20} className={`transform transition-transform ${collapsed ? 'rotate-180' : ''}`} />
          </Button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-2 px-2">
            {navItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center px-3 py-2 rounded-lg transition-colors ${
                    location.pathname === item.path
                      ? 'bg-gray-800 text-white'
                      : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <span className="mr-3">{item.icon}</span>
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top header area */}
        <header className="bg-dark-card shadow-xs py-4 px-6 h-16">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <h1 className="text-xl font-medium">Transactions from M-Pesa</h1>
            </div>
            <div className="flex items-center space-x-4">
              <UploadStatementButton />
            </div>
          </div>
        </header>

        {/* Content area */}
        <main className="flex-1 overflow-y-auto p-6 py-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
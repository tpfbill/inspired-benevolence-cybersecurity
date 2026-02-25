import { Outlet, Link, useLocation } from 'react-router-dom';
import { Shield, BookOpen, AlertTriangle, FileText, BarChart3, LogOut } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';

export default function Layout() {
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: BarChart3 },
    { name: 'Playbooks', href: '/playbooks', icon: BookOpen },
    { name: 'Incidents', href: '/incidents', icon: Shield },
    { name: 'Alerts', href: '/alerts', icon: AlertTriangle },
    { name: 'Compliance', href: '/compliance', icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex flex-1 overflow-hidden">
              <div className="flex-shrink-0 flex items-center min-w-0">
                <Shield className="h-8 w-8 text-primary-600 flex-shrink-0" />
                <span className="ml-2 text-lg lg:text-xl font-bold text-gray-900 truncate hidden sm:block">
                  IB CyberSecurity
                </span>
              </div>
              <div className="hidden lg:ml-8 lg:flex lg:space-x-4 xl:space-x-6">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.href || 
                    (item.href !== '/' && location.pathname.startsWith(item.href));
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium whitespace-nowrap ${
                        isActive
                          ? 'border-primary-500 text-gray-900'
                          : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                      }`}
                    >
                      <Icon className="h-4 w-4 mr-1.5" />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </div>
            <div className="flex items-center space-x-2 flex-shrink-0">
              <div className="hidden md:flex items-center space-x-2">
                <span className="text-sm text-gray-700 whitespace-nowrap">
                  {user?.firstName} {user?.lastName}
                </span>
                <span className="text-xs text-gray-500 px-2 py-1 bg-gray-100 rounded whitespace-nowrap">
                  {user?.role.replace('_', ' ').toUpperCase()}
                </span>
              </div>
              <button
                onClick={logout}
                className="p-2 text-gray-500 hover:text-gray-700 flex-shrink-0"
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile Navigation */}
        <div className="lg:hidden border-t border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href || 
                (item.href !== '/' && location.pathname.startsWith(item.href));
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                    isActive
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-3" />
                  {item.name}
                </Link>
              );
            })}
          </div>
          <div className="pt-3 pb-3 border-t border-gray-200 px-4 md:hidden">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-700">
                  {user?.firstName} {user?.lastName}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {user?.role.replace('_', ' ').toUpperCase()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}

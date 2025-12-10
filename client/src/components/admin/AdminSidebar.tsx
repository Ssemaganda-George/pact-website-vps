import { Link, useRoute } from 'wouter';
import { useState } from 'react';
import { 
  LayoutDashboard,
  FileText, 
  Award, 
  Briefcase, 
  Users,
  FolderArchive,
  ListTodo,
  Mail,
  UserCircle,
  Image,
  Info,
  BarChart4,
  Menu,
  Building2,
  X,
  LogOut
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import pactLogo from '@/assets/pact-logo.png';

interface MenuItem {
  name: string;
  path: string;
  icon: React.ReactNode;
}

interface AdminSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const AdminSidebar = ({ isOpen, onToggle }: AdminSidebarProps) => {
  const { logout, user } = useAuth();
  const menuItems: MenuItem[] = [
    {
      name: 'Dashboard',
      path: '/admin/dashboard',
      icon: <LayoutDashboard className="w-5 h-5 mr-2" />
    },
    {
      name: 'Hero Slides',
      path: '/admin/content/hero-slides',
      icon: <Image className="w-5 h-5 mr-2" />
    },
    {
      name: 'About Section',
      path: '/admin/content/about',
      icon: <Info className="w-5 h-5 mr-2" />
    },
    {
      name: 'Impact Statistics',
      path: '/admin/content/impact',
      icon: <BarChart4 className="w-5 h-5 mr-2" />
    },
    {
      name: 'Team Members',
      path: '/admin/content/team',
      icon: <UserCircle className="w-5 h-5 mr-2" />
    },
    {
      name: 'Expertise Areas',
      path: '/admin/content/expertise',
      icon: <Award className="w-5 h-5 mr-2" />
    },
    {
      name: 'Services',
      path: '/admin/content/services',
      icon: <Briefcase className="w-5 h-5 mr-2" />
    },
    {
      name: 'Clients & Partners',
      path: '/admin/content/clients',
      icon: <Users className="w-5 h-5 mr-2" />
    },
    {
      name: 'Projects',
      path: '/admin/content/projects',
      icon: <FolderArchive className="w-5 h-5 mr-2" />
    },
    {
      name: 'Blog Articles',
      path: '/admin/content/blog',
      icon: <FileText className="w-5 h-5 mr-2" />
    },
    {
      name: 'Footer Settings',
      path: '/admin/content/footer',
      icon: <Menu className="w-5 h-5 mr-2" />
    },
    {
      name: 'Contact Messages',
      path: '/admin/messages',
      icon: <Mail className="w-5 h-5 mr-2" />
    },
    {
      name: 'Locations',
      path: '/admin/locations',
      icon: <Building2 className="w-5 h-5 mr-2" />
    }
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full bg-white border-r border-gray-200 z-50 transition-transform duration-300 ease-in-out flex flex-col
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        w-64 lg:w-64
      `}>
        <div className="p-4 border-b flex items-center justify-between">
          <Link href="/admin/dashboard">
            <div className="flex items-center font-semibold text-lg text-primary cursor-pointer">
              <img src={pactLogo} alt="PACT Logo" className="w-16 h-14 mr-2 -mt-1" />
              <span className="text-xl font-bold text-primary self-end mt-3">CMS</span>
            </div>
          </Link>
          <button
            onClick={onToggle}
            className="lg:hidden p-1 rounded-md hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <nav className="p-4 overflow-y-auto flex-1">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              // We need to lift this hook outside the map function
              const ActiveLink = () => {
                const [isActive] = useRoute(item.path);
                return (
                  <Link href={item.path}>
                    <div 
                      className={`flex items-center py-2 px-3 rounded-md transition-colors cursor-pointer ${
                        isActive 
                          ? 'bg-primary text-white hover:bg-primary-dark' 
                          : 'text-gray-700 hover:bg-gray-100 hover:text-primary'
                      }`}
                      onClick={() => {
                        // Close mobile menu when item is clicked
                        if (window.innerWidth < 1024) {
                          onToggle();
                        }
                      }}
                    >
                      {item.icon}
                      <span>{item.name}</span>
                    </div>
                  </Link>
                );
              };
              
              return (
                <li key={item.path}>
                  <ActiveLink />
                </li>
              );
            })}
          </ul>
        </nav>
        
        {/* Logout section - Fixed at bottom */}
        <div className="p-4 border-t border-gray-200">
          <div className="px-3 py-2 text-sm text-gray-600 mb-2">
            User Name: <span className="font-medium">{user?.username || 'Admin'}</span>
          </div>
          <button
            onClick={() => {
              if (confirm('Are you sure you want to logout?')) {
                logout();
              }
            }}
            className="flex items-center w-full py-2 px-3 rounded-md text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut className="w-5 h-5 mr-2" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default AdminSidebar;

import React from 'react';
import { Menu } from 'antd';
import { 
  DashboardOutlined, 
  MessageOutlined, 
  UserOutlined, 
  BarChartOutlined, 
  SettingOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: '/conversations',
      icon: <MessageOutlined />,
      label: 'Conversations',
    },
    {
      key: '/users',
      icon: <UserOutlined />,
      label: 'User Management',
    },
    {
      key: '/analytics',
      icon: <BarChartOutlined />,
      label: 'Analytics',
    },
    {
      key: '/settings',
      icon: <SettingOutlined />,
      label: 'Settings',
    },
  ];

  const handleMenuClick = (e: any) => {
    navigate(e.key);
  };

  return (
    <div 
      className={`bg-white shadow-lg transition-all duration-300 ${
        isOpen ? 'w-64' : 'w-20'
      }`}
    >
      <div className="flex items-center justify-between p-4 border-b">
        {isOpen && (
          <h1 className="text-xl font-bold text-gray-800">Admin Panel</h1>
        )}
        <button 
          onClick={onToggle}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          {isOpen ? <MenuFoldOutlined /> : <MenuUnfoldOutlined />}
        </button>
      </div>
      
      <Menu
        mode="inline"
        selectedKeys={[location.pathname]}
        items={menuItems}
        onClick={handleMenuClick}
        className="border-0"
        inlineCollapsed={!isOpen}
      />
      
      <div className="absolute bottom-0 w-full p-4 border-t">
        <Menu
          mode="inline"
          items={[
            {
              key: 'logout',
              icon: <LogoutOutlined />,
              label: 'Logout',
              onClick: () => {
                // Handle logout logic
                console.log('Logout clicked');
              },
            },
          ]}
          inlineCollapsed={!isOpen}
        />
      </div>
    </div>
  );
};

export default Sidebar;
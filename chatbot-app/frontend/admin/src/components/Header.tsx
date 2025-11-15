import React from 'react';
import { 
  Input, 
  Button, 
  Avatar, 
  Dropdown, 
  Badge, 
  Space,
  Typography
} from 'antd';
import { 
  BellOutlined, 
  SearchOutlined, 
  UserOutlined, 
  SettingOutlined,
  LogoutOutlined,
  QuestionCircleOutlined
} from '@ant-design/icons';

const { Text } = Typography;

interface HeaderProps {
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Profile',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Settings',
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
    },
  ];

  const notificationItems = [
    {
      key: '1',
      label: 'New conversation assigned to you',
    },
    {
      key: '2',
      label: 'System maintenance scheduled',
    },
    {
      key: '3',
      label: 'Performance report ready',
    },
  ];

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button 
            type="text" 
            icon={<SearchOutlined />}
            onClick={onMenuClick}
            className="lg:hidden"
          />
          
          <div className="relative">
            <Input
              placeholder="Search conversations, users..."
              prefix={<SearchOutlined />}
              className="w-64"
              size="large"
            />
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <Badge count={3} size="small">
            <Button 
              type="text" 
              icon={<BellOutlined />}
              className="relative"
            />
          </Badge>

          <Dropdown 
            menu={{ items: notificationItems }} 
            placement="bottomRight"
            arrow
          >
            <Button type="text" icon={<QuestionCircleOutlined />} />
          </Dropdown>

          <Dropdown 
            menu={{ items: userMenuItems }} 
            placement="bottomRight"
            arrow
          >
            <Space className="cursor-pointer">
              <Avatar 
                size="small" 
                icon={<UserOutlined />} 
                className="bg-blue-500 text-white"
              />
              <Text className="hidden sm:inline">Admin User</Text>
            </Space>
          </Dropdown>
        </div>
      </div>
    </header>
  );
};

export default Header;
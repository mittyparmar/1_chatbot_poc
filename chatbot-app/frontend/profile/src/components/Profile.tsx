import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Avatar, 
  Typography, 
  Button, 
  Space, 
  Divider,
  Tag,
  List,
  Timeline,
  Statistic,
  Progress,
  Alert
} from '@shared-ui';
import { 
  UserOutlined, 
  EditOutlined, 
  ClockCircleOutlined, 
  MessageOutlined,
  TrophyOutlined,
  StarOutlined,
  SettingOutlined,
  LockOutlined,
  BellOutlined,
  HeartOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;

interface UserProfile {
  name: string;
  email: string;
  avatar: string;
  joinDate: string;
  totalConversations: number;
  satisfaction: number;
  membershipLevel: string;
  preferences: {
    notifications: boolean;
    darkMode: boolean;
    language: string;
  };
}

interface Activity {
  id: string;
  type: 'conversation' | 'achievement' | 'preference' | 'security';
  title: string;
  description: string;
  date: string;
  icon: React.ReactNode;
}

const Profile: React.FC = () => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);

  useEffect(() => {
    fetchUserProfile();
    fetchRecentActivities();
  }, []);

  const fetchUserProfile = async () => {
    setLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockProfile: UserProfile = {
      name: 'John Doe',
      email: 'john.doe@example.com',
      avatar: 'https://ui-avatars.com/api/?name=John+Doe&background=3B82F6&color=fff',
      joinDate: '2024-01-15',
      totalConversations: 45,
      satisfaction: 4.6,
      membershipLevel: 'Premium',
      preferences: {
        notifications: true,
        darkMode: false,
        language: 'en'
      }
    };

    setUserProfile(mockProfile);
    setLoading(false);
  };

  const fetchRecentActivities = async () => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const mockActivities: Activity[] = [
      {
        id: '1',
        type: 'conversation',
        title: 'New Conversation Started',
        description: 'You initiated a conversation about account setup',
        date: '2 hours ago',
        icon: <MessageOutlined className="text-blue-500" />
      },
      {
        id: '2',
        type: 'achievement',
        title: 'Achievement Unlocked',
        description: 'Completed 10 conversations successfully',
        date: '1 day ago',
        icon: <TrophyOutlined className="text-yellow-500" />
      },
      {
        id: '3',
        type: 'preference',
        title: 'Settings Updated',
        description: 'Changed notification preferences',
        date: '3 days ago',
        icon: <SettingOutlined className="text-green-500" />
      },
      {
        id: '4',
        type: 'security',
        title: 'Security Enhanced',
        description: 'Two-factor authentication enabled',
        date: '1 week ago',
        icon: <LockOutlined className="text-red-500" />
      }
    ];

    setRecentActivities(mockActivities);
  };

  const getMembershipColor = (level: string) => {
    switch (level) {
      case 'Premium': return 'gold';
      case 'Basic': return 'blue';
      case 'Enterprise': return 'purple';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <Title level={2}>My Profile</Title>
        <Button type="primary" icon={<EditOutlined />}>
          Edit Profile
        </Button>
      </div>

      {/* Profile Overview */}
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={8}>
          <Card>
            <div className="text-center">
              <Avatar 
                size={80} 
                src={userProfile?.avatar}
                className="mx-auto mb-4"
              />
              <Title level={3} className="mb-2">{userProfile?.name}</Title>
              <Text type="secondary" className="block mb-4">{userProfile?.email}</Text>
              
              <Tag color={getMembershipColor(userProfile?.membershipLevel || '')} className="mb-4">
                {userProfile?.membershipLevel} Member
              </Tag>
              
              <Divider />
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Member Since</span>
                  <span>{new Date(userProfile?.joinDate || '').toLocaleDateString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Language</span>
                  <span>{userProfile?.preferences.language?.toUpperCase()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Dark Mode</span>
                  <span>{userProfile?.preferences.darkMode ? 'Enabled' : 'Disabled'}</span>
                </div>
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={16}>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12}>
              <Card>
                <Statistic
                  title="Total Conversations"
                  value={userProfile?.totalConversations || 0}
                  prefix={<MessageOutlined />}
                  valueStyle={{ color: '#3f8600' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12}>
              <Card>
                <Statistic
                  title="Satisfaction Rating"
                  value={userProfile?.satisfaction || 0}
                  prefix={<StarOutlined />}
                  suffix="/ 5.0"
                  valueStyle={{ color: '#1890ff' }}
                />
                <Progress 
                  percent={(userProfile?.satisfaction || 0) * 20} 
                  size="small" 
                  showInfo={false}
                  className="mt-2"
                />
              </Card>
            </Col>
          </Row>

          <Card title="Quick Actions" className="mt-6">
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12}>
                <Button 
                  block 
                  icon={<SettingOutlined />}
                  className="h-12"
                >
                  Account Settings
                </Button>
              </Col>
              <Col xs={24} sm={12}>
                <Button 
                  block 
                  icon={<LockOutlined />}
                  className="h-12"
                >
                  Security Settings
                </Button>
              </Col>
              <Col xs={24} sm={12}>
                <Button 
                  block 
                  icon={<BellOutlined />}
                  className="h-12"
                >
                  Notification Preferences
                </Button>
              </Col>
              <Col xs={24} sm={12}>
                <Button 
                  block 
                  icon={<HeartOutlined />}
                  className="h-12"
                >
                  Favorite Conversations
                </Button>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {/* Recent Activity */}
      <Card title="Recent Activity">
        <Timeline>
          {recentActivities.map((activity) => (
            <Timeline.Item 
              key={activity.id} 
              dot={activity.icon}
              color={
                activity.type === 'conversation' ? 'blue' :
                activity.type === 'achievement' ? 'gold' :
                activity.type === 'preference' ? 'green' : 'red'
              }
            >
              <div>
                <Title level={5}>{activity.title}</Title>
                <Text type="secondary">{activity.description}</Text>
                <div className="text-sm text-gray-500 mt-1">{activity.date}</div>
              </div>
            </Timeline.Item>
          ))}
        </Timeline>
      </Card>

      {/* Account Summary */}
      <Card title="Account Summary">
        <Row gutter={[16, 16]}>
          <Col xs={24} md={8}>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <UserOutlined className="text-3xl text-blue-500 mb-2" />
              <Title level={4} className="mb-1">Active Account</Title>
              <Text type="secondary">Your account is in good standing</Text>
            </div>
          </Col>
          <Col xs={24} md={8}>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <ClockCircleOutlined className="text-3xl text-green-500 mb-2" />
              <Title level={4} className="mb-1">Recent Activity</Title>
              <Text type="secondary">Last active 2 hours ago</Text>
            </div>
          </Col>
          <Col xs={24} md={8}>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <TrophyOutlined className="text-3xl text-purple-500 mb-2" />
              <Title level={4} className="mb-1">Premium Status</Title>
              <Text type="secondary">Enjoy premium features</Text>
            </div>
          </Col>
        </Row>
      </Card>

      {/* Important Information */}
      <Alert
        message="Account Security"
        description="We recommend enabling two-factor authentication for enhanced security. You can update your security settings in the Security section."
        type="info"
        showIcon
        action={
          <Button size="small" type="link">
            Enable Now
          </Button>
        }
      />
    </div>
  );
};

export default Profile;
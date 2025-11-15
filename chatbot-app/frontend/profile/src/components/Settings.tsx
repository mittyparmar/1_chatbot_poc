import React, { useState } from 'react';
import { 
  Card, 
  Form, 
  Input, 
  Button, 
  Switch, 
  Select, 
  Typography, 
  Space, 
  Divider,
  Row,
  Col,
  message,
  Alert
} from '@shared-ui';
import { 
  SaveOutlined, 
  ReloadOutlined, 
  UserOutlined,
  LockOutlined,
  BellOutlined,
  GlobalOutlined,
  MoonOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;

interface SettingsData {
  profile: {
    name: string;
    email: string;
    bio: string;
    location: string;
    timezone: string;
  };
  preferences: {
    language: string;
    theme: 'light' | 'dark' | 'auto';
    notifications: {
      email: boolean;
      push: boolean;
      sms: boolean;
    };
    privacy: {
      profileVisibility: 'public' | 'private' | 'friends';
      activityStatus: boolean;
      readReceipts: boolean;
    };
  };
}

const Settings: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  const initialSettings: SettingsData = {
    profile: {
      name: 'John Doe',
      email: 'john.doe@example.com',
      bio: 'Customer service enthusiast and tech lover',
      location: 'Mumbai, India',
      timezone: 'Asia/Calcutta'
    },
    preferences: {
      language: 'en',
      theme: 'light',
      notifications: {
        email: true,
        push: true,
        sms: false
      },
      privacy: {
        profileVisibility: 'public',
        activityStatus: true,
        readReceipts: true
      }
    }
  };

  const handleSave = async (values: any) => {
    setLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      message.success('Settings saved successfully');
    } catch (error) {
      message.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    form.setFieldsValue(initialSettings);
    message.info('Settings reset to default values');
  };

  const tabItems = [
    {
      key: 'profile',
      label: (
        <span>
          <UserOutlined />
          Profile
        </span>
      ),
      children: (
        <Form
          name="profile"
          initialValues={initialSettings.profile}
          onFinish={(values) => handleSave({ ...initialSettings, profile: values })}
        >
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="name"
                label="Full Name"
                rules={[{ required: true, message: 'Please enter your name' }]}
              >
                <Input placeholder="Enter your full name" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="email"
                label="Email Address"
                rules={[
                  { required: true, message: 'Please enter email address' },
                  { type: 'email', message: 'Please enter a valid email' }
                ]}
              >
                <Input placeholder="Enter email address" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="bio"
            label="Bio"
            rules={[{ max: 200, message: 'Bio must be less than 200 characters' }]}
          >
            <Input.TextArea rows={3} placeholder="Tell us about yourself" />
          </Form.Item>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="location"
                label="Location"
              >
                <Input placeholder="Enter your location" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="timezone"
                label="Timezone"
                rules={[{ required: true, message: 'Please select timezone' }]}
              >
                <Select placeholder="Select timezone">
                  <Option value="Asia/Calcutta">Asia/Calcutta (UTC+5:30)</Option>
                  <Option value="UTC">UTC</Option>
                  <Option value="America/New_York">America/New_York (UTC-5)</Option>
                  <Option value="Europe/London">Europe/London (UTC+0)</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      ),
    },
    {
      key: 'preferences',
      label: (
        <span>
          <BellOutlined />
          Preferences
        </span>
      ),
      children: (
        <Form
          name="preferences"
          initialValues={initialSettings.preferences}
          onFinish={(values) => handleSave({ ...initialSettings, preferences: values })}
        >
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="language"
                label="Language"
                rules={[{ required: true, message: 'Please select language' }]}
              >
                <Select placeholder="Select language">
                  <Option value="en">English</Option>
                  <Option value="es">Spanish</Option>
                  <Option value="fr">French</Option>
                  <Option value="de">German</Option>
                  <Option value="hi">Hindi</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="theme"
                label="Theme"
                rules={[{ required: true, message: 'Please select theme' }]}
              >
                <Select placeholder="Select theme">
                  <Option value="light">Light</Option>
                  <Option value="dark">Dark</Option>
                  <Option value="auto">Auto (System)</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Divider />

          <Title level={4}>Notifications</Title>
          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item
                name={['notifications', 'email']}
                label="Email Notifications"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                name={['notifications', 'push']}
                label="Push Notifications"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                name={['notifications', 'sms']}
                label="SMS Notifications"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>
          </Row>

          <Divider />

          <Title level={4}>Privacy Settings</Title>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name={['privacy', 'profileVisibility']}
                label="Profile Visibility"
                rules={[{ required: true, message: 'Please select visibility' }]}
              >
                <Select placeholder="Select visibility">
                  <Option value="public">Public</Option>
                  <Option value="friends">Friends Only</Option>
                  <Option value="private">Private</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name={['privacy', 'activityStatus']}
                label="Show Activity Status"
                valuePropName="checked"
                valueOptions={{ valuePropName: 'checked' }}
              >
                <Switch />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name={['privacy', 'readReceipts']}
                label="Send Read Receipts"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <Title level={2}>Settings</Title>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={handleReset}>
            Reset to Default
          </Button>
          <Button 
            type="primary" 
            icon={<SaveOutlined />} 
            onClick={() => form.submit()}
            loading={loading}
          >
            Save Changes
          </Button>
        </Space>
      </div>

      <Alert
        message="Settings Changes"
        description="Some changes may take a few minutes to take effect. Your preferences will be applied on your next login."
        type="info"
        showIcon
        className="mb-6"
      />

      <Card>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          type="card"
        />
      </Card>

      <Card title="Account Information">
        <Space direction="vertical" size="middle" className="w-full">
          <div className="flex items-center space-x-3">
            <CheckCircleOutlined className="text-green-500 text-xl" />
            <div>
              <Text strong>Account Status: Active</Text>
              <br />
              <Text type="secondary">Your account is in good standing</Text>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <UserOutlined className="text-blue-500 text-xl" />
            <div>
              <Text strong>Member Since: January 15, 2024</Text>
              <br />
              <Text type="secondary">You've been with us for 45 days</Text>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <LockOutlined className="text-orange-500 text-xl" />
            <div>
              <Text strong>Security: Enhanced</Text>
              <br />
              <Text type="secondary">Two-factor authentication enabled</Text>
            </div>
          </div>
        </Space>
      </Card>
    </div>
  );
};

export default Settings;
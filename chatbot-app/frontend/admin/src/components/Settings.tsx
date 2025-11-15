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
  Alert,
  Tabs,
  Row,
  Col,
  message
} from '@shared-ui';
import { 
  SaveOutlined, 
  ReloadOutlined, 
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  UserOutlined,
  LockOutlined,
  BellOutlined,
  SettingOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;

interface SettingsData {
  general: {
    siteName: string;
    description: string;
    timezone: string;
    language: string;
  };
  security: {
    passwordPolicy: string;
    sessionTimeout: number;
    twoFactorAuth: boolean;
    loginAttempts: number;
  };
  notifications: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    smsNotifications: boolean;
    notificationFrequency: string;
  };
  chat: {
    autoResponse: boolean;
    responseTimeout: number;
    fileUpload: boolean;
    maxFileSize: number;
  };
}

const Settings: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  const initialSettings: SettingsData = {
    general: {
      siteName: 'Chatbot Admin Panel',
      description: 'Advanced customer service chatbot management system',
      timezone: 'Asia/Calcutta',
      language: 'en'
    },
    security: {
      passwordPolicy: 'medium',
      sessionTimeout: 30,
      twoFactorAuth: false,
      loginAttempts: 5
    },
    notifications: {
      emailNotifications: true,
      pushNotifications: true,
      smsNotifications: false,
      notificationFrequency: 'immediate'
    },
    chat: {
      autoResponse: true,
      responseTimeout: 30,
      fileUpload: true,
      maxFileSize: 10
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
      key: 'general',
      label: (
        <span>
          <SettingOutlined />
          General
        </span>
      ),
      children: (
        <Form
          name="general"
          initialValues={initialSettings.general}
          onFinish={(values) => handleSave({ ...initialSettings, general: values })}
        >
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="siteName"
                label="Site Name"
                rules={[{ required: true, message: 'Please enter site name' }]}
              >
                <Input placeholder="Enter site name" />
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

          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: 'Please enter description' }]}
          >
            <Input.TextArea rows={4} placeholder="Enter site description" />
          </Form.Item>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="language"
                label="Default Language"
                rules={[{ required: true, message: 'Please select language' }]}
              >
                <Select placeholder="Select language">
                  <Option value="en">English</Option>
                  <Option value="es">Spanish</Option>
                  <Option value="fr">French</Option>
                  <Option value="de">German</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      ),
    },
    {
      key: 'security',
      label: (
        <span>
          <LockOutlined />
          Security
        </span>
      ),
      children: (
        <Form
          name="security"
          initialValues={initialSettings.security}
          onFinish={(values) => handleSave({ ...initialSettings, security: values })}
        >
          <Alert
            message="Security Settings"
            description="Configure security policies to protect your admin panel and user data."
            type="info"
            showIcon
            className="mb-4"
          />

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="passwordPolicy"
                label="Password Policy"
                rules={[{ required: true, message: 'Please select password policy' }]}
              >
                <Select placeholder="Select password policy">
                  <Option value="weak">Weak (6+ characters)</Option>
                  <Option value="medium">Medium (8+ characters, mixed case)</Option>
                  <Option value="strong">Strong (12+ characters, numbers, symbols)</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="sessionTimeout"
                label="Session Timeout (minutes)"
                rules={[{ required: true, message: 'Please enter session timeout' }]}
              >
                <Input type="number" placeholder="30" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="loginAttempts"
                label="Max Login Attempts"
                rules={[{ required: true, message: 'Please enter max login attempts' }]}
              >
                <Input type="number" placeholder="5" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="twoFactorAuth"
                label="Two-Factor Authentication"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      ),
    },
    {
      key: 'notifications',
      label: (
        <span>
          <BellOutlined />
          Notifications
        </span>
      ),
      children: (
        <Form
          name="notifications"
          initialValues={initialSettings.notifications}
          onFinish={(values) => handleSave({ ...initialSettings, notifications: values })}
        >
          <Alert
            message="Notification Settings"
            description="Configure how and when you receive notifications."
            type="info"
            showIcon
            className="mb-4"
          />

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="emailNotifications"
                label="Email Notifications"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="pushNotifications"
                label="Push Notifications"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="smsNotifications"
                label="SMS Notifications"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="notificationFrequency"
                label="Notification Frequency"
                rules={[{ required: true, message: 'Please select frequency' }]}
              >
                <Select placeholder="Select frequency">
                  <Option value="immediate">Immediate</Option>
                  <Option value="hourly">Hourly Digest</Option>
                  <Option value="daily">Daily Summary</Option>
                  <Option value="weekly">Weekly Report</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      ),
    },
    {
      key: 'chat',
      label: (
        <span>
          <UserOutlined />
          Chat Settings
        </span>
      ),
      children: (
        <Form
          name="chat"
          initialValues={initialSettings.chat}
          onFinish={(values) => handleSave({ ...initialSettings, chat: values })}
        >
          <Alert
            message="Chat Configuration"
            description="Configure chat behavior and features for your users."
            type="info"
            showIcon
            className="mb-4"
          />

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="autoResponse"
                label="Auto-Response"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="responseTimeout"
                label="Response Timeout (seconds)"
                rules={[{ required: true, message: 'Please enter response timeout' }]}
              >
                <Input type="number" placeholder="30" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="fileUpload"
                label="Enable File Upload"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="maxFileSize"
                label="Max File Size (MB)"
                rules={[{ required: true, message: 'Please enter max file size' }]}
              >
                <Input type="number" placeholder="10" />
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

      <Card>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          type="card"
        />
      </Card>

      <Alert
        message="Configuration Changes"
        description="Some changes may require a system restart to take effect. Please save your changes and restart the services if needed."
        type="warning"
        showIcon
        action={
          <Button size="small" type="link">
            Learn More
          </Button>
        }
      />
    </div>
  );
};

export default Settings;
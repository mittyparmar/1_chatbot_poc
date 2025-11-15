import React, { useState } from 'react';
import { 
  Card, 
  Typography, 
  Button, 
  Space, 
  Divider,
  Row,
  Col,
  Alert,
  List,
  Tag,
  Progress,
  Modal,
  Form,
  Input,
  Switch,
  message,
  QRCode
} from '@shared-ui';
import { 
  LockOutlined, 
  EyeOutlined, 
  EyeInvisibleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  MobileOutlined,
  MailOutlined,
  SafetyOutlined,
  QrcodeOutlined,
  HistoryOutlined,
  GlobalOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

interface SecurityLog {
  id: string;
  action: string;
  device: string;
  location: string;
  time: string;
  status: 'success' | 'failed';
}

interface SecurityDevice {
  id: string;
  name: string;
  type: 'mobile' | 'desktop' | 'tablet';
  lastActive: string;
  location: string;
  trusted: boolean;
}

const Security: React.FC = () => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [twoFactorModalVisible, setTwoFactorModalVisible] = useState(false);
  const [activeSessions, setActiveSessions] = useState<SecurityDevice[]>([
    {
      id: '1',
      name: 'Chrome on MacBook Pro',
      type: 'desktop',
      lastActive: '2 hours ago',
      location: 'Mumbai, India',
      trusted: true
    },
    {
      id: '2',
      name: 'Safari on iPhone 13',
      type: 'mobile',
      lastActive: '1 day ago',
      location: 'Mumbai, India',
      trusted: true
    },
    {
      id: '3',
      name: 'Chrome on Windows PC',
      type: 'desktop',
      lastActive: '3 days ago',
      location: 'Pune, India',
      trusted: false
    }
  ]);

  const [securityLogs, setSecurityLogs] = useState<SecurityLog[]>([
    {
      id: '1',
      action: 'Login successful',
      device: 'Chrome on MacBook Pro',
      location: 'Mumbai, India',
      time: '2 hours ago',
      status: 'success'
    },
    {
      id: '2',
      action: 'Password changed',
      device: 'Chrome on MacBook Pro',
      location: 'Mumbai, India',
      time: '1 week ago',
      status: 'success'
    },
    {
      id: '3',
      action: 'Failed login attempt',
      device: 'Unknown browser',
      location: 'New York, USA',
      time: '2 weeks ago',
      status: 'failed'
    }
  ]);

  const [form] = Form.useForm();

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const toggleConfirmPasswordVisibility = () => {
    setConfirmPasswordVisible(!confirmPasswordVisible);
  };

  const handlePasswordChange = async (values: any) => {
    try {
      // Simulate password change
      await new Promise(resolve => setTimeout(resolve, 1500));
      message.success('Password changed successfully');
      form.resetFields();
    } catch (error) {
      message.error('Failed to change password');
    }
  };

  const handleTwoFactorSetup = async () => {
    try {
      // Simulate 2FA setup
      await new Promise(resolve => setTimeout(resolve, 2000));
      message.success('Two-factor authentication enabled successfully');
      setTwoFactorModalVisible(false);
    } catch (error) {
      message.error('Failed to setup two-factor authentication');
    }
  };

  const revokeSession = (id: string) => {
    setActiveSessions(prev => prev.filter(session => session.id !== id));
    message.success('Session revoked successfully');
  };

  const trustDevice = (id: string) => {
    setActiveSessions(prev => 
      prev.map(session => 
        session.id === id 
          ? { ...session, trusted: !session.trusted }
          : session
      )
    );
  };

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'mobile': return <MobileOutlined />;
      case 'desktop': return <GlobalOutlined />;
      case 'tablet': return <MobileOutlined />;
      default: return <GlobalOutlined />;
    }
  };

  const getDeviceColor = (type: string) => {
    switch (type) {
      case 'mobile': return 'blue';
      case 'desktop': return 'green';
      case 'tablet': return 'purple';
      default: return 'default';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <Title level={2}>Security</Title>

      {/* Security Overview */}
      <Row gutter={[24, 24]}>
        <Col xs={24} md={8}>
          <Card>
            <div className="text-center">
              <SafetyOutlined className="text-4xl text-green-500 mb-4" />
              <Title level={4} className="mb-2">Security Score</Title>
              <Progress percent={92} size="large" strokeColor="#52c41a" />
              <Text type="secondary" className="block mt-2">Excellent security</Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card>
            <div className="text-center">
              <CheckCircleOutlined className="text-4xl text-blue-500 mb-4" />
              <Title level={4} className="mb-2">2FA Status</Title>
              <Tag color="green" className="mb-2">Enabled</Tag>
              <Text type="secondary" className="block">
                Extra protection active
              </Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card>
            <div className="text-center">
              <HistoryOutlined className="text-4xl text-orange-500 mb-4" />
              <Title level={4} className="mb-2">Active Sessions</Title>
              <Text type="secondary" className="block">
                {activeSessions.filter(s => s.trusted).length} trusted devices
              </Text>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Password Management */}
      <Card title="Password Management">
        <Form
          form={form}
          onFinish={handlePasswordChange}
          layout="vertical"
        >
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="currentPassword"
                label="Current Password"
                rules={[{ required: true, message: 'Please enter current password' }]}
              >
                <Input.Password
                  placeholder="Enter current password"
                  visibilityToggle={{
                    visible: passwordVisible,
                    onVisibleChange: setPasswordVisible
                  }}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="newPassword"
                label="New Password"
                rules={[
                  { required: true, message: 'Please enter new password' },
                  { min: 8, message: 'Password must be at least 8 characters' }
                ]}
              >
                <Input.Password
                  placeholder="Enter new password"
                  visibilityToggle={{
                    visible: confirmPasswordVisible,
                    onVisibleChange: setConfirmPasswordVisible
                  }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="confirmPassword"
            label="Confirm New Password"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: 'Please confirm new password' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Passwords do not match'));
                },
              }),
            ]}
          >
            <Input.Password placeholder="Confirm new password" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              Change Password
            </Button>
          </Form.Item>
        </Form>
      </Card>

      {/* Two-Factor Authentication */}
      <Card title="Two-Factor Authentication">
        <Space direction="vertical" size="large" className="w-full">
          <div className="flex items-center justify-between">
            <div>
              <Title level={5}>Two-Factor Authentication</Title>
              <Text type="secondary">
                Add an extra layer of security to your account
              </Text>
            </div>
            <Button 
              type="primary" 
              onClick={() => setTwoFactorModalVisible(true)}
            >
              Setup 2FA
            </Button>
          </div>

          <Alert
            message="Security Tip"
            description="We recommend using an authenticator app for two-factor authentication. It provides better security than SMS."
            type="info"
            showIcon
          />
        </Space>
      </Card>

      {/* Active Sessions */}
      <Card title="Active Sessions">
        <List
          dataSource={activeSessions}
          renderItem={(item) => (
            <List.Item
              actions={[
                <Button
                  key="trust"
                  size="small"
                  type={item.trusted ? 'default' : 'primary'}
                  onClick={() => trustDevice(item.id)}
                >
                  {item.trusted ? 'Trusted' : 'Trust'}
                </Button>,
                <Button
                  key="revoke"
                  size="small"
                  danger
                  onClick={() => revokeSession(item.id)}
                >
                  Revoke
                </Button>
              ]}
            >
              <List.Item.Meta
                avatar={
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    {getDeviceIcon(item.type)}
                  </div>
                }
                title={
                  <div className="flex items-center space-x-2">
                    <span>{item.name}</span>
                    <Tag color={getDeviceColor(item.type)} size="small">
                      {item.type}
                    </Tag>
                    {item.trusted && <Tag color="green">Trusted</Tag>}
                  </div>
                }
                description={
                  <div>
                    <Text type="secondary">{item.location}</Text>
                    <div className="text-xs text-gray-500 mt-1">
                      Last active: {item.lastActive}
                    </div>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      </Card>

      {/* Security Logs */}
      <Card title="Recent Security Activity">
        <List
          dataSource={securityLogs}
          renderItem={(item) => (
            <List.Item>
              <List.Item.Meta
                avatar={
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    item.status === 'success' ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    {item.status === 'success' ? 
                      <CheckCircleOutlined className="text-green-600" /> : 
                      <ExclamationCircleOutlined className="text-red-600" />
                    }
                  </div>
                }
                title={
                  <div className="flex items-center space-x-2">
                    <span>{item.action}</span>
                    <Tag color={item.status === 'success' ? 'green' : 'red'}>
                      {item.status}
                    </Tag>
                  </div>
                }
                description={
                  <div>
                    <Text type="secondary">{item.device}</Text>
                    <div className="text-xs text-gray-500 mt-1">
                      {item.location} • {item.time}
                    </div>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      </Card>

      {/* Two-Factor Authentication Modal */}
      <Modal
        title="Setup Two-Factor Authentication"
        open={twoFactorModalVisible}
        onCancel={() => setTwoFactorModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setTwoFactorModalVisible(false)}>
            Cancel
          </Button>,
          <Button key="setup" type="primary" onClick={handleTwoFactorSetup}>
            Setup 2FA
          </Button>
        ]}
        width={600}
      >
        <div className="text-center">
          <Paragraph>
            Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
          </Paragraph>
          
          <div className="my-6">
            <QRCode 
              value="https://chatbot-app.com/2fa-setup" 
              size={200}
              className="mx-auto"
            />
          </div>
          
          <Paragraph>
            <Text type="secondary">
              Don't have an authenticator app? Download one from your app store.
            </Text>
          </Paragraph>
          
          <Alert
            message="Important"
            description="After scanning, enter the 6-digit code from your authenticator app to complete the setup."
            type="warning"
            showIcon
            className="mt-4"
          />
        </div>
      </Modal>
    </div>
  );
};

export default Security;
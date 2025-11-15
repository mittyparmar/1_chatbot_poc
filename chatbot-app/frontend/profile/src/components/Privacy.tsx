import React, { useState } from 'react';
import { 
  Card, 
  Typography, 
  Switch, 
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
  message
} from '@shared-ui';
import { 
  LockOutlined, 
  EyeOutlined, 
  DownloadOutlined, 
  DeleteOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  UserOutlined,
  ClockCircleOutlined,
  ShieldOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

interface PrivacySetting {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
  level: 'high' | 'medium' | 'low';
  lastUpdated: string;
}

const Privacy: React.FC = () => {
  const [privacySettings, setPrivacySettings] = useState<PrivacySetting[]>([
    {
      id: '1',
      title: 'Profile Visibility',
      description: 'Control who can see your profile information',
      enabled: true,
      level: 'high',
      lastUpdated: '2024-01-10'
    },
    {
      id: '2',
      title: 'Activity Status',
      description: 'Show when you are online and active',
      enabled: true,
      level: 'medium',
      lastUpdated: '2024-01-08'
    },
    {
      id: '3',
      title: 'Read Receipts',
      description: 'Notify others when you read their messages',
      enabled: true,
      level: 'low',
      lastUpdated: '2024-01-05'
    },
    {
      id: '4',
      title: 'Data Collection',
      description: 'Allow collection of usage data for improvement',
      enabled: false,
      level: 'high',
      lastUpdated: '2024-01-01'
    }
  ]);

  const [exportModalVisible, setExportModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [form] = Form.useForm();

  const toggleSetting = (id: string) => {
    setPrivacySettings(prev => 
      prev.map(setting => 
        setting.id === id 
          ? { ...setting, enabled: !setting.enabled }
          : setting
      )
    );
  };

  const handleExportData = async () => {
    try {
      // Simulate data export
      await new Promise(resolve => setTimeout(resolve, 2000));
      message.success('Your data has been exported successfully');
      setExportModalVisible(false);
    } catch (error) {
      message.error('Failed to export data');
    }
  };

  const handleDeleteAccount = async (values: any) => {
    try {
      // Simulate account deletion
      await new Promise(resolve => setTimeout(resolve, 3000));
      message.success('Account deletion request submitted');
      setDeleteModalVisible(false);
      form.resetFields();
    } catch (error) {
      message.error('Failed to delete account');
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'high': return 'red';
      case 'medium': return 'orange';
      case 'low': return 'green';
      default: return 'default';
    }
  };

  const getLevelText = (level: string) => {
    switch (level) {
      case 'high': return 'High Priority';
      case 'medium': return 'Medium Priority';
      case 'low': return 'Low Priority';
      default: return 'Standard';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <Title level={2}>Privacy & Security</Title>
        <Space>
          <Button icon={<DownloadOutlined />} onClick={() => setExportModalVisible(true)}>
            Export My Data
          </Button>
          <Button danger icon={<DeleteOutlined />} onClick={() => setDeleteModalVisible(true)}>
            Delete Account
          </Button>
        </Space>
      </div>

      {/* Privacy Overview */}
      <Row gutter={[24, 24]}>
        <Col xs={24} md={8}>
          <Card>
            <div className="text-center">
              <ShieldOutlined className="text-4xl text-blue-500 mb-4" />
              <Title level={4} className="mb-2">Privacy Score</Title>
              <Progress percent={85} size="large" strokeColor="#52c41a" />
              <Text type="secondary" className="block mt-2">Good privacy protection</Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card>
            <div className="text-center">
              <UserOutlined className="text-4xl text-green-500 mb-4" />
              <Title level={4} className="mb-2">Data Controls</Title>
              <Text type="secondary" className="block">
                {privacySettings.filter(s => s.enabled).length} of {privacySettings.length} controls active
              </Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card>
            <div className="text-center">
              <ClockCircleOutlined className="text-4xl text-orange-500 mb-4" />
              <Title level={4} className="mb-2">Last Review</Title>
              <Text type="secondary" className="block">
                Reviewed 5 days ago
              </Text>
              <Button type="link" size="small">Review Now</Button>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Privacy Settings */}
      <Card title="Privacy Settings">
        <List
          dataSource={privacySettings}
          renderItem={(item) => (
            <List.Item
              actions={[
                <Switch
                  key="switch"
                  checked={item.enabled}
                  onChange={() => toggleSetting(item.id)}
                  checkedChildren="On"
                  unCheckedChildren="Off"
                />
              ]}
            >
              <List.Item.Meta
                avatar={
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    <LockOutlined className="text-gray-600" />
                  </div>
                }
                title={
                  <div className="flex items-center space-x-2">
                    <span>{item.title}</span>
                    <Tag color={getLevelColor(item.level)} size="small">
                      {getLevelText(item.level)}
                    </Tag>
                  </div>
                }
                description={
                  <div>
                    <Text type="secondary">{item.description}</Text>
                    <div className="text-xs text-gray-500 mt-1">
                      Last updated: {new Date(item.lastUpdated).toLocaleDateString()}
                    </div>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      </Card>

      {/* Data Management */}
      <Card title="Data Management">
        <Space direction="vertical" size="large" className="w-full">
          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
            <div>
              <Title level={5}>Data Export</Title>
              <Text type="secondary">Download a copy of your personal data</Text>
            </div>
            <Button icon={<DownloadOutlined />} onClick={() => setExportModalVisible(true)}>
              Export Data
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
            <div>
              <Title level={5} className="text-red-600">Account Deletion</Title>
              <Text type="secondary">Permanently delete your account and all data</Text>
            </div>
            <Button danger icon={<DeleteOutlined />} onClick={() => setDeleteModalVisible(true)}>
              Delete Account
            </Button>
          </div>
        </Space>
      </Card>

      {/* Security Tips */}
      <Alert
        message="Security Tips"
        description="We recommend regularly updating your password and enabling two-factor authentication to enhance your account security."
        type="info"
        showIcon
        action={
          <Button size="small" type="link">
            Learn More
          </Button>
        }
      />

      {/* Export Data Modal */}
      <Modal
        title="Export Your Data"
        open={exportModalVisible}
        onCancel={() => setExportModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setExportModalVisible(false)}>
            Cancel
          </Button>,
          <Button key="export" type="primary" onClick={handleExportData}>
            Export Data
          </Button>
        ]}
      >
        <Paragraph>
          We will prepare a comprehensive export of your data including:
        </Paragraph>
        <ul className="list-disc list-inside space-y-1">
          <li>Profile information and settings</li>
          <li>Conversation history and messages</li>
          <li>Activity logs and preferences</li>
          <li>Uploaded files and attachments</li>
        </ul>
        <Paragraph>
          This process may take a few minutes. You will receive an email when your data is ready for download.
        </Paragraph>
      </Modal>

      {/* Delete Account Modal */}
      <Modal
        title="Delete Your Account"
        open={deleteModalVisible}
        onCancel={() => setDeleteModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setDeleteModalVisible(false)}>
            Cancel
          </Button>,
          <Button 
            key="delete" 
            danger 
            type="primary" 
            onClick={() => form.submit()}
            loading={false}
          >
            Delete Account
          </Button>
        ]}
      >
        <Form
          form={form}
          onFinish={handleDeleteAccount}
          layout="vertical"
        >
          <Alert
            message="Warning"
            description="This action cannot be undone. Deleting your account will permanently remove all your data, including conversations, settings, and preferences."
            type="warning"
            showIcon
            className="mb-4"
          />

          <Form.Item
            name="confirmation"
            label="Please type 'DELETE' to confirm account deletion"
            rules={[
              { required: true, message: 'Please type DELETE to confirm' },
              { validator: (_, value) => 
                value === 'DELETE' ? Promise.resolve() : Promise.reject(new Error('Please type DELETE exactly'))
              }
            ]}
          >
            <Input placeholder="Type DELETE here" />
          </Form.Item>

          <Form.Item
            name="reason"
            label="Optional: Reason for deletion (helps us improve)"
          >
            <Input.TextArea rows={3} placeholder="Tell us why you're leaving (optional)" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Privacy;
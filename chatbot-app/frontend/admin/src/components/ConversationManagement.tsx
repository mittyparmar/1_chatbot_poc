import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Table, 
  Input, 
  Button, 
  Select, 
  Tag, 
  Space, 
  Modal, 
  Form,
  Typography,
  Row,
  Col,
  Badge,
  Tooltip,
  message
} from '@shared-ui';
import { 
  SearchOutlined, 
  FilterOutlined, 
  EyeOutlined, 
  EditOutlined, 
  DeleteOutlined,
  SendOutlined,
  UserOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';

interface Conversation {
  id: string;
  user: string;
  email: string;
  subject: string;
  status: 'open' | 'pending' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  duration: string;
  lastUpdate: string;
  assignedTo?: string;
  messages: number;
}

interface FilterState {
  search: string;
  status: string;
  priority: string;
  dateRange: [string, string];
}

const ConversationManagement: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    status: '',
    priority: '',
    dateRange: ['', '']
  });
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isAssignModalVisible, setIsAssignModalVisible] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    setLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockConversations: Conversation[] = [
      {
        id: '1',
        user: 'John Doe',
        email: 'john@example.com',
        subject: 'Account setup assistance',
        status: 'open',
        priority: 'high',
        duration: '5m',
        lastUpdate: '2 minutes ago',
        messages: 3,
        assignedTo: 'Admin User'
      },
      {
        id: '2',
        user: 'Jane Smith',
        email: 'jane@example.com',
        subject: 'Billing inquiry',
        status: 'pending',
        priority: 'medium',
        duration: '12m',
        lastUpdate: '5 minutes ago',
        messages: 2
      },
      {
        id: '3',
        user: 'Bob Johnson',
        email: 'bob@example.com',
        subject: 'Technical support',
        status: 'resolved',
        priority: 'low',
        duration: '8m',
        lastUpdate: '15 minutes ago',
        messages: 5,
        assignedTo: 'Support Team'
      },
      {
        id: '4',
        user: 'Alice Brown',
        email: 'alice@example.com',
        subject: 'Feature request',
        status: 'open',
        priority: 'medium',
        duration: '3m',
        lastUpdate: '1 minute ago',
        messages: 1
      },
      {
        id: '5',
        user: 'Charlie Wilson',
        email: 'charlie@example.com',
        subject: 'Password reset',
        status: 'closed',
        priority: 'urgent',
        duration: '7m',
        lastUpdate: '10 minutes ago',
        messages: 4,
        assignedTo: 'Admin User'
      }
    ];

    setConversations(mockConversations);
    setLoading(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'red';
      case 'pending': return 'orange';
      case 'resolved': return 'green';
      case 'closed': return 'gray';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'red';
      case 'high': return 'orange';
      case 'medium': return 'blue';
      case 'low': return 'green';
      default: return 'default';
    }
  };

  const handleView = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    setIsModalVisible(true);
  };

  const handleAssign = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    form.setFieldsValue({ admin: conversation.assignedTo || '' });
    setIsAssignModalVisible(true);
  };

  const handleAssignSubmit = async (values: any) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setConversations(prev => prev.map(conv => 
        conv.id === selectedConversation?.id 
          ? { ...conv, assignedTo: values.admin }
          : conv
      ));
      
      message.success('Conversation assigned successfully');
      setIsAssignModalVisible(false);
    } catch (error) {
      message.error('Failed to assign conversation');
    }
  };

  const handleDelete = (conversation: Conversation) => {
    Modal.confirm({
      title: 'Delete Conversation',
      content: `Are you sure you want to delete conversation with ${conversation.user}?`,
      onOk: () => {
        setConversations(prev => prev.filter(conv => conv.id !== conversation.id));
        message.success('Conversation deleted successfully');
      },
    });
  };

  const filteredConversations = conversations.filter(conv => {
    return (
      (!filters.search || 
        conv.user.toLowerCase().includes(filters.search.toLowerCase()) ||
        conv.subject.toLowerCase().includes(filters.search.toLowerCase()) ||
        conv.email.toLowerCase().includes(filters.search.toLowerCase())) &&
      (!filters.status || conv.status === filters.status) &&
      (!filters.priority || conv.priority === filters.priority)
    );
  });

  const columns = [
    {
      title: 'User',
      dataIndex: 'user',
      key: 'user',
      render: (text: string, record: Conversation) => (
        <div>
          <div className="font-medium">{text}</div>
          <div className="text-sm text-gray-500">{record.email}</div>
        </div>
      ),
    },
    {
      title: 'Subject',
      dataIndex: 'subject',
      key: 'subject',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Tag>
      ),
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority: string) => (
        <Tag color={getPriorityColor(priority)}>
          {priority.charAt(0).toUpperCase() + priority.slice(1)}
        </Tag>
      ),
    },
    {
      title: 'Duration',
      dataIndex: 'duration',
      key: 'duration',
    },
    {
      title: 'Messages',
      dataIndex: 'messages',
      key: 'messages',
      render: (count: number) => (
        <Badge count={count} showZero />
      ),
    },
    {
      title: 'Assigned To',
      dataIndex: 'assignedTo',
      key: 'assignedTo',
      render: (assigned: string) => assigned || <span className="text-gray-400">Unassigned</span>,
    },
    {
      title: 'Last Update',
      dataIndex: 'lastUpdate',
      key: 'lastUpdate',
    },
    {
      title: 'Actions',
      key: 'action',
      render: (record: Conversation) => (
        <Space size="middle">
          <Tooltip title="View">
            <Button 
              type="text" 
              icon={<EyeOutlined />} 
              onClick={() => handleView(record)}
            />
          </Tooltip>
          <Tooltip title="Assign">
            <Button 
              type="text" 
              icon={<UserOutlined />} 
              onClick={() => handleAssign(record)}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Button 
              type="text" 
              danger 
              icon={<DeleteOutlined />} 
              onClick={() => handleDelete(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <Typography.Title level={2}>Conversation Management</Typography.Title>
        <Space>
          <Button type="primary" icon={<SendOutlined />}>
            New Conversation
          </Button>
          <Button icon={<FilterOutlined />}>
            Advanced Filter
          </Button>
        </Space>
      </div>

      {/* Filters */}
      <Card>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <Input
              placeholder="Search conversations..."
              prefix={<SearchOutlined />}
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Select
              placeholder="Filter by status"
              value={filters.status}
              onChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
              allowClear
            >
              <Select.Option value="open">Open</Select.Option>
              <Select.Option value="pending">Pending</Select.Option>
              <Select.Option value="resolved">Resolved</Select.Option>
              <Select.Option value="closed">Closed</Select.Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Select
              placeholder="Filter by priority"
              value={filters.priority}
              onChange={(value) => setFilters(prev => ({ ...prev, priority: value }))}
              allowClear
            >
              <Select.Option value="urgent">Urgent</Select.Option>
              <Select.Option value="high">High</Select.Option>
              <Select.Option value="medium">Medium</Select.Option>
              <Select.Option value="low">Low</Select.Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Button 
              type="primary" 
              onClick={fetchConversations}
              loading={loading}
            >
              Apply Filters
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Conversations Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredConversations}
          rowKey="id"
          loading={loading}
          pagination={{
            total: filteredConversations.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} of ${total} conversations`,
          }}
        />
      </Card>

      {/* View Conversation Modal */}
      <Modal
        title="Conversation Details"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={800}
      >
        {selectedConversation && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-700">User</h4>
                <p>{selectedConversation.user}</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-700">Email</h4>
                <p>{selectedConversation.email}</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-700">Subject</h4>
                <p>{selectedConversation.subject}</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-700">Status</h4>
                <Tag color={getStatusColor(selectedConversation.status)}>
                  {selectedConversation.status.charAt(0).toUpperCase() + selectedConversation.status.slice(1)}
                </Tag>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button onClick={() => setIsModalVisible(false)}>
                Close
              </Button>
              <Button type="primary">
                View Full Conversation
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Assign Conversation Modal */}
      <Modal
        title="Assign Conversation"
        open={isAssignModalVisible}
        onCancel={() => setIsAssignModalVisible(false)}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAssignSubmit}
        >
          <Form.Item
            name="admin"
            label="Assign to Admin"
            rules={[{ required: true, message: 'Please select an admin' }]}
          >
            <Select placeholder="Select admin">
              <Select.Option value="Admin User">Admin User</Select.Option>
              <Select.Option value="Support Team">Support Team</Select.Option>
              <Select.Option value="Technical Team">Technical Team</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Space>
              <Button onClick={() => setIsAssignModalVisible(false)}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit">
                Assign
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ConversationManagement;
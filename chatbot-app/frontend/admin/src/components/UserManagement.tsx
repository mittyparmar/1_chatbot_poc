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
  message,
  Avatar
} from '@shared-ui';
import { 
  SearchOutlined, 
  UserAddOutlined, 
  EditOutlined, 
  DeleteOutlined,
  EyeOutlined,
  MailOutlined,
  PhoneOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'support';
  status: 'active' | 'inactive' | 'suspended';
  lastLogin: string;
  joinDate: string;
  conversations: number;
  satisfaction: number;
}

interface FilterState {
  search: string;
  role: string;
  status: string;
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    role: '',
    status: ''
  });
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockUsers: User[] = [
      {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'user',
        status: 'active',
        lastLogin: '2 hours ago',
        joinDate: '2024-01-15',
        conversations: 12,
        satisfaction: 4.5
      },
      {
        id: '2',
        name: 'Jane Smith',
        email: 'jane@example.com',
        role: 'admin',
        status: 'active',
        lastLogin: '30 minutes ago',
        joinDate: '2024-01-10',
        conversations: 45,
        satisfaction: 4.8
      },
      {
        id: '3',
        name: 'Bob Johnson',
        email: 'bob@example.com',
        role: 'support',
        status: 'active',
        lastLogin: '1 day ago',
        joinDate: '2024-01-20',
        conversations: 78,
        satisfaction: 4.2
      },
      {
        id: '4',
        name: 'Alice Brown',
        email: 'alice@example.com',
        role: 'user',
        status: 'inactive',
        lastLogin: '1 week ago',
        joinDate: '2024-02-01',
        conversations: 3,
        satisfaction: 3.8
      },
      {
        id: '5',
        name: 'Charlie Wilson',
        email: 'charlie@example.com',
        role: 'user',
        status: 'suspended',
        lastLogin: 'Never',
        joinDate: '2024-02-15',
        conversations: 0,
        satisfaction: 0
      }
    ];

    setUsers(mockUsers);
    setLoading(false);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'red';
      case 'support': return 'blue';
      case 'user': return 'green';
      default: return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'green';
      case 'inactive': return 'orange';
      case 'suspended': return 'red';
      default: return 'default';
    }
  };

  const handleView = (user: User) => {
    setSelectedUser(user);
    setIsModalVisible(true);
  };

  const handleCreate = async (values: any) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newUser: User = {
        id: Date.now().toString(),
        name: values.name,
        email: values.email,
        role: values.role,
        status: 'active',
        lastLogin: 'Never',
        joinDate: new Date().toISOString().split('T')[0],
        conversations: 0,
        satisfaction: 0
      };
      
      setUsers(prev => [...prev, newUser]);
      message.success('User created successfully');
      setIsCreateModalVisible(false);
      form.resetFields();
    } catch (error) {
      message.error('Failed to create user');
    }
  };

  const handleDelete = (user: User) => {
    Modal.confirm({
      title: 'Delete User',
      content: `Are you sure you want to delete ${user.name}? This action cannot be undone.`,
      onOk: () => {
        setUsers(prev => prev.filter(u => u.id !== user.id));
        message.success('User deleted successfully');
      },
    });
  };

  const filteredUsers = users.filter(user => {
    return (
      (!filters.search || 
        user.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        user.email.toLowerCase().includes(filters.search.toLowerCase())) &&
      (!filters.role || user.role === filters.role) &&
      (!filters.status || user.status === filters.status)
    );
  });

  const columns = [
    {
      title: 'User',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: User) => (
        <div className="flex items-center space-x-3">
          <Avatar 
            size="small" 
            src={`https://ui-avatars.com/api/?name=${text}&background=3B82F6&color=fff`}
          />
          <div>
            <div className="font-medium">{text}</div>
            <div className="text-sm text-gray-500">{record.email}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => (
        <Tag color={getRoleColor(role)}>
          {role.charAt(0).toUpperCase() + role.slice(1)}
        </Tag>
      ),
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
      title: 'Conversations',
      dataIndex: 'conversations',
      key: 'conversations',
      render: (count: number) => (
        <Badge count={count} showZero />
      ),
    },
    {
      title: 'Satisfaction',
      dataIndex: 'satisfaction',
      key: 'satisfaction',
      render: (rating: number) => (
        <div className="flex items-center space-x-1">
          <span className="text-sm">{rating.toFixed(1)}</span>
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <span 
                key={i} 
                className={`text-xs ${
                  i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'
                }`}
              >
                ★
              </span>
            ))}
          </div>
        </div>
      ),
    },
    {
      title: 'Last Login',
      dataIndex: 'lastLogin',
      key: 'lastLogin',
    },
    {
      title: 'Join Date',
      dataIndex: 'joinDate',
      key: 'joinDate',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Actions',
      key: 'action',
      render: (record: User) => (
        <Space size="middle">
          <Tooltip title="View">
            <Button 
              type="text" 
              icon={<EyeOutlined />} 
              onClick={() => handleView(record)}
            />
          </Tooltip>
          <Tooltip title="Edit">
            <Button 
              type="text" 
              icon={<EditOutlined />} 
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
        <Typography.Title level={2}>User Management</Typography.Title>
        <Space>
          <Button 
            type="primary" 
            icon={<UserAddOutlined />}
            onClick={() => setIsCreateModalVisible(true)}
          >
            Create User
          </Button>
          <Button icon={<SearchOutlined />}>
            Advanced Search
          </Button>
        </Space>
      </div>

      {/* Filters */}
      <Card>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={8}>
            <Input
              placeholder="Search users..."
              prefix={<SearchOutlined />}
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            />
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Select
              placeholder="Filter by role"
              value={filters.role}
              onChange={(value) => setFilters(prev => ({ ...prev, role: value }))}
              allowClear
            >
              <Select.Option value="admin">Admin</Select.Option>
              <Select.Option value="support">Support</Select.Option>
              <Select.Option value="user">User</Select.Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Select
              placeholder="Filter by status"
              value={filters.status}
              onChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
              allowClear
            >
              <Select.Option value="active">Active</Select.Option>
              <Select.Option value="inactive">Inactive</Select.Option>
              <Select.Option value="suspended">Suspended</Select.Option>
            </Select>
          </Col>
        </Row>
      </Card>

      {/* Users Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredUsers}
          rowKey="id"
          loading={loading}
          pagination={{
            total: filteredUsers.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} of ${total} users`,
          }}
        />
      </Card>

      {/* View User Modal */}
      <Modal
        title="User Details"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={800}
      >
        {selectedUser && (
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <Avatar 
                size="large"
                src={`https://ui-avatars.com/api/?name=${selectedUser.name}&background=3B82F6&color=fff`}
              />
              <div>
                <h3 className="text-lg font-semibold">{selectedUser.name}</h3>
                <p className="text-gray-600">{selectedUser.email}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-700">Role</h4>
                <Tag color={getRoleColor(selectedUser.role)}>
                  {selectedUser.role.charAt(0).toUpperCase() + selectedUser.role.slice(1)}
                </Tag>
              </div>
              <div>
                <h4 className="font-medium text-gray-700">Status</h4>
                <Tag color={getStatusColor(selectedUser.status)}>
                  {selectedUser.status.charAt(0).toUpperCase() + selectedUser.status.slice(1)}
                </Tag>
              </div>
              <div>
                <h4 className="font-medium text-gray-700">Conversations</h4>
                <p>{selectedUser.conversations}</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-700">Satisfaction</h4>
                <div className="flex items-center space-x-1">
                  <span>{selectedUser.satisfaction.toFixed(1)}</span>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <span 
                        key={i} 
                        className={`text-sm ${
                          i < Math.floor(selectedUser.satisfaction) ? 'text-yellow-400' : 'text-gray-300'
                        }`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-700">Last Login</h4>
                <p>{selectedUser.lastLogin}</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-700">Join Date</h4>
                <p>{new Date(selectedUser.joinDate).toLocaleDateString()}</p>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button onClick={() => setIsModalVisible(false)}>
                Close
              </Button>
              <Button type="primary">
                Edit User
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Create User Modal */}
      <Modal
        title="Create New User"
        open={isCreateModalVisible}
        onCancel={() => setIsCreateModalVisible(false)}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreate}
        >
          <Form.Item
            name="name"
            label="Full Name"
            rules={[{ required: true, message: 'Please enter full name' }]}
          >
            <Input placeholder="Enter full name" />
          </Form.Item>
          
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
          
          <Form.Item
            name="role"
            label="Role"
            rules={[{ required: true, message: 'Please select role' }]}
          >
            <Select placeholder="Select user role">
              <Select.Option value="user">User</Select.Option>
              <Select.Option value="support">Support</Select.Option>
              <Select.Option value="admin">Admin</Select.Option>
            </Select>
          </Form.Item>
          
          <Form.Item>
            <Space>
              <Button onClick={() => setIsCreateModalVisible(false)}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit">
                Create User
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UserManagement;
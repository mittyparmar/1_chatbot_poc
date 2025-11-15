import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Statistic, 
  Typography, 
  Button, 
  Space, 
  Select,
  DatePicker,
  Table,
  Tag,
  Progress,
  Alert,
  Divider,
  Tabs
} from '@shared-ui';
import { 
  UserOutlined, 
  MessageOutlined, 
  ClockCircleOutlined, 
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  DownloadOutlined,
  ReloadOutlined
} from '@ant-design/icons';

interface AnalyticsData {
  totalUsers: number;
  activeConversations: number;
  resolvedToday: number;
  avgResponseTime: number;
  satisfactionRate: number;
  userGrowth: number;
  conversationTrends: Array<{
    date: string;
    conversations: number;
    resolved: number;
  }>;
  userEngagement: Array<{
    metric: string;
    value: number;
    change: number;
    trend: 'up' | 'down' | 'stable';
  }>;
  topUsers: Array<{
    name: string;
    conversations: number;
    satisfaction: number;
  }>;
}

const Analytics: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<[any, any] | null>(null);
  const [timeRange, setTimeRange] = useState('7d');

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const mockData: AnalyticsData = {
      totalUsers: 1247,
      activeConversations: 23,
      resolvedToday: 156,
      avgResponseTime: 2.3,
      satisfactionRate: 94.5,
      userGrowth: 12.5,
      conversationTrends: [
        { date: '2024-01-01', conversations: 45, resolved: 38 },
        { date: '2024-01-02', conversations: 52, resolved: 41 },
        { date: '2024-01-03', conversations: 48, resolved: 39 },
        { date: '2024-01-04', conversations: 61, resolved: 48 },
        { date: '2024-01-05', conversations: 55, resolved: 44 },
        { date: '2024-01-06', conversations: 67, resolved: 52 },
        { date: '2024-01-07', conversations: 73, resolved: 58 },
      ],
      userEngagement: [
        { metric: 'Daily Active Users', value: 892, change: 8.2, trend: 'up' },
        { metric: 'Avg Session Duration', value: 12.5, change: -2.1, trend: 'down' },
        { metric: 'Message Response Rate', value: 96.8, change: 1.5, trend: 'up' },
        { metric: 'User Satisfaction', value: 4.6, change: 0.3, trend: 'up' },
        { metric: 'Conversation Completion', value: 87.3, change: 3.2, trend: 'up' },
      ],
      topUsers: [
        { name: 'Jane Smith', conversations: 45, satisfaction: 4.8 },
        { name: 'Bob Johnson', conversations: 38, satisfaction: 4.2 },
        { name: 'Alice Brown', conversations: 32, satisfaction: 4.5 },
        { name: 'Charlie Wilson', conversations: 28, satisfaction: 4.1 },
        { name: 'Diana Prince', conversations: 25, satisfaction: 4.7 },
      ]
    };

    setAnalyticsData(mockData);
    setLoading(false);
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <ArrowUpOutlined className="text-green-500" />;
      case 'down': return <ArrowDownOutlined className="text-red-500" />;
      default: return <span className="text-gray-500">—</span>;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'text-green-500';
      case 'down': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const engagementColumns = [
    {
      title: 'Metric',
      dataIndex: 'metric',
      key: 'metric',
    },
    {
      title: 'Value',
      dataIndex: 'value',
      key: 'value',
      render: (value: number) => (
        <div className="font-medium">{typeof value === 'number' ? value.toFixed(1) : value}</div>
      ),
    },
    {
      title: 'Change',
      dataIndex: 'change',
      key: 'change',
      render: (change: number, record: any) => (
        <div className={`flex items-center space-x-1 ${getTrendColor(record.trend)}`}>
          {getTrendIcon(record.trend)}
          <span>{Math.abs(change).toFixed(1)}%</span>
        </div>
      ),
    },
  ];

  const topUsersColumns = [
    {
      title: 'User',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => (
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <UserOutlined className="text-blue-600" />
          </div>
          <span className="font-medium">{text}</span>
        </div>
      ),
    },
    {
      title: 'Conversations',
      dataIndex: 'conversations',
      key: 'conversations',
      render: (count: number) => (
        <div className="flex items-center space-x-1">
          <MessageOutlined className="text-blue-500" />
          <span>{count}</span>
        </div>
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
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading analytics data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <Typography.Title level={2}>Analytics Dashboard</Typography.Title>
        <Space>
          <Select
            value={timeRange}
            onChange={setTimeRange}
            style={{ width: 120 }}
          >
            <Select.Option value="7d">Last 7 days</Select.Option>
            <Select.Option value="30d">Last 30 days</Select.Option>
            <Select.Option value="90d">Last 90 days</Select.Option>
            <Select.Option value="1y">Last year</Select.Option>
          </Select>
          <Button icon={<ReloadOutlined />} onClick={fetchAnalyticsData} loading={loading}>
            Refresh
          </Button>
          <Button type="primary" icon={<DownloadOutlined />}>
            Export Report
          </Button>
        </Space>
      </div>

      {/* Key Metrics */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Users"
              value={analyticsData?.totalUsers || 0}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#3f8600' }}
              suffix={
                <span className="text-green-600 text-sm">
                  <ArrowUpOutlined /> {analyticsData?.userGrowth || 0}%
                </span>
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Active Conversations"
              value={analyticsData?.activeConversations || 0}
              prefix={<MessageOutlined />}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Resolved Today"
              value={analyticsData?.resolvedToday || 0}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Avg Response Time"
              value={analyticsData?.avgResponseTime || 0}
              suffix="min"
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#1890ff' }}
              precision={1}
            />
          </Card>
        </Col>
      </Row>

      <Tabs
        defaultActiveKey="engagement"
        items={[
          {
            key: 'engagement',
            label: 'User Engagement',
            children: (
              <div className="space-y-6">
                <Card title="Engagement Metrics">
                  <Table
                    dataSource={analyticsData?.userEngagement || []}
                    columns={engagementColumns}
                    pagination={false}
                    rowKey="metric"
                    size="small"
                  />
                </Card>
                
                <Card title="Satisfaction Rate">
                  <div className="text-center">
                    <Progress 
                      type="circle" 
                      percent={analyticsData?.satisfactionRate || 0} 
                      size={120}
                      strokeColor={{
                        '0%': '#ffccc7',
                        '100%': '#52c41a',
                      }}
                    />
                    <div className="mt-4">
                      <Typography.Text strong>{analyticsData?.satisfactionRate || 0}%</Typography.Text>
                      <Typography.Text type="secondary"> Customer Satisfaction</Typography.Text>
                    </div>
                  </div>
                </Card>
              </div>
            ),
          },
          {
            key: 'conversations',
            label: 'Conversation Analytics',
            children: (
              <div className="space-y-6">
                <Card title="Conversation Trends">
                  <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                    <div className="text-center text-gray-500">
                      <MessageOutlined className="text-4xl mb-2" />
                      <p>Chart visualization would go here</p>
                    </div>
                  </div>
                </Card>
                
                <Card title="Recent Activity">
                  <div className="space-y-3">
                    {analyticsData?.conversationTrends?.slice(-5).map((trend, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium">{trend.date}</div>
                          <div className="text-sm text-gray-500">{trend.conversations} conversations</div>
                        </div>
                        <div className="text-right">
                          <div className="text-green-600 font-medium">{trend.resolved} resolved</div>
                          <Progress 
                            percent={Math.round((trend.resolved / trend.conversations) * 100)} 
                            size="small"
                            showInfo={false}
                            style={{ width: 100 }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            ),
          },
          {
            key: 'users',
            label: 'Top Users',
            children: (
              <Card title="Most Active Users">
                <Table
                  dataSource={analyticsData?.topUsers || []}
                  columns={topUsersColumns}
                  pagination={false}
                  rowKey="name"
                  size="small"
                />
              </Card>
            ),
          },
        ]}
      />

      {/* Insights */}
      <Card title="Key Insights">
        <Space direction="vertical" size="middle" className="w-full">
          <Alert
            message="Positive Trend"
            description="User satisfaction has increased by 8.2% over the past week. Keep up the good work!"
            type="success"
            showIcon
          />
          
          <Alert
            message="Area for Improvement"
            description="Average session duration has decreased by 2.1%. Consider improving user engagement features."
            type="warning"
            showIcon
          />
          
          <Alert
            message="System Performance"
            description="Message response rate is excellent at 96.8%. Users are getting quick responses."
            type="info"
            showIcon
          />
        </Space>
      </Card>
    </div>
  );
};

export default Analytics;
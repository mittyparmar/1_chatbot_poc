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
  Select,
  Input,
  message,
  Slider,
  Radio,
  Checkbox
} from '@shared-ui';
import { 
  BellOutlined, 
  GlobalOutlined, 
  MoonOutlined, 
  SunOutlined,
  HeartOutlined,
  MessageOutlined,
  FileTextOutlined,
  ExperimentOutlined,
  UserOutlined,
  TeamOutlined,
  BarChartOutlined,
  SettingOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

interface NotificationPreference {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
  frequency: 'immediate' | 'daily' | 'weekly' | 'never';
  channels: {
    email: boolean;
    push: boolean;
    sms: boolean;
    inApp: boolean;
  };
}

interface ChatPreference {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
  options: {
    autoReply: boolean;
    quickReplies: boolean;
    fileUpload: boolean;
    emojiReactions: boolean;
    readReceipts: boolean;
  };
}

interface AccessibilityPreference {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
  settings: {
    fontSize: number;
    highContrast: boolean;
    reducedMotion: boolean;
    screenReader: boolean;
  };
}

const Preferences: React.FC = () => {
  const [notificationPreferences, setNotificationPreferences] = useState<NotificationPreference[]>([
    {
      id: '1',
      title: 'Message Notifications',
      description: 'Get notified when you receive new messages',
      enabled: true,
      frequency: 'immediate',
      channels: {
        email: false,
        push: true,
        sms: false,
        inApp: true
      }
    },
    {
      id: '2',
      title: 'Activity Updates',
      description: 'Updates about your conversations and account',
      enabled: true,
      frequency: 'daily',
      channels: {
        email: true,
        push: true,
        sms: false,
        inApp: true
      }
    },
    {
      id: '3',
      title: 'Marketing Communications',
      description: 'Product updates and promotional content',
      enabled: false,
      frequency: 'weekly',
      channels: {
        email: false,
        push: false,
        sms: false,
        inApp: false
      }
    }
  ]);

  const [chatPreferences, setChatPreferences] = useState<ChatPreference[]>([
    {
      id: '1',
      title: 'Chat Experience',
      description: 'Customize your chat interface and behavior',
      enabled: true,
      options: {
        autoReply: true,
        quickReplies: true,
        fileUpload: true,
        emojiReactions: true,
        readReceipts: true
      }
    },
    {
      id: '2',
      title: 'Privacy Settings',
      description: 'Control your privacy during conversations',
      enabled: true,
      options: {
        autoReply: false,
        quickReplies: true,
        fileUpload: false,
        emojiReactions: true,
        readReceipts: false
      }
    }
  ]);

  const [accessibilityPreferences, setAccessibilityPreferences] = useState<AccessibilityPreference[]>([
    {
      id: '1',
      title: 'Visual Accessibility',
      description: 'Adjust visual settings for better readability',
      enabled: false,
      settings: {
        fontSize: 16,
        highContrast: false,
        reducedMotion: false,
        screenReader: false
      }
    },
    {
      id: '2',
      title: 'Interaction Preferences',
      description: 'Customize how you interact with the interface',
      enabled: true,
      settings: {
        fontSize: 16,
        highContrast: false,
        reducedMotion: true,
        screenReader: false
      }
    }
  ]);

  const [language, setLanguage] = useState('en');
  const [theme, setTheme] = useState<'light' | 'dark' | 'auto'>('light');
  const [timezone, setTimezone] = useState('Asia/Calcutta');

  const toggleNotification = (id: string) => {
    setNotificationPreferences(prev => 
      prev.map(pref => 
        pref.id === id 
          ? { ...pref, enabled: !pref.enabled }
          : pref
      )
    );
  };

  const updateNotificationFrequency = (id: string, frequency: string) => {
    setNotificationPreferences(prev => 
      prev.map(pref => 
        pref.id === id 
          ? { ...pref, frequency: frequency as any }
          : pref
      )
    );
  };

  const updateNotificationChannel = (id: string, channel: string, enabled: boolean) => {
    setNotificationPreferences(prev => 
      prev.map(pref => 
        pref.id === id 
          ? { 
              ...pref, 
              channels: { ...pref.channels, [channel]: enabled }
            }
          : pref
      )
    );
  };

  const toggleChatOption = (prefId: string, option: string) => {
    setChatPreferences(prev => 
      prev.map(pref => {
        if (pref.id === prefId) {
          return {
            ...pref,
            options: {
              ...pref.options,
              [option]: !pref.options[option as keyof typeof pref.options]
            }
          };
        }
        return pref;
      })
    );
  };

  const toggleAccessibility = (id: string) => {
    setAccessibilityPreferences(prev => 
      prev.map(pref => 
        pref.id === id 
          ? { ...pref, enabled: !pref.enabled }
          : pref
      )
    );
  };

  const updateAccessibilitySetting = (id: string, setting: string, value: any) => {
    setAccessibilityPreferences(prev => 
      prev.map(pref => {
        if (pref.id === id) {
          return {
            ...pref,
            settings: {
              ...pref.settings,
              [setting]: value
            }
          };
        }
        return pref;
      })
    );
  };

  const handleSavePreferences = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      message.success('Preferences saved successfully');
    } catch (error) {
      message.error('Failed to save preferences');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <Title level={2}>Preferences</Title>
        <Button type="primary" onClick={handleSavePreferences}>
          Save Preferences
        </Button>
      </div>

      {/* Language & Appearance */}
      <Card title="Language & Appearance">
        <Row gutter={[24, 24]}>
          <Col xs={24} md={12}>
            <div className="space-y-4">
              <div>
                <Text strong className="mb-2 block">Language</Text>
                <Select
                  value={language}
                  onChange={setLanguage}
                  className="w-full"
                >
                  <Option value="en">English</Option>
                  <Option value="es">Spanish</Option>
                  <Option value="fr">French</Option>
                  <Option value="de">German</Option>
                  <Option value="hi">Hindi</Option>
                </Select>
              </div>

              <div>
                <Text strong className="mb-2 block">Theme</Text>
                <Radio.Group value={theme} onChange={(e) => setTheme(e.target.value)}>
                  <Radio value="light">
                    <SunOutlined /> Light
                  </Radio>
                  <Radio value="dark">
                    <MoonOutlined /> Dark
                  </Radio>
                  <Radio value="auto">
                    <GlobalOutlined /> Auto
                  </Radio>
                </Radio.Group>
              </div>

              <div>
                <Text strong className="mb-2 block">Timezone</Text>
                <Select
                  value={timezone}
                  onChange={setTimezone}
                  className="w-full"
                >
                  <Option value="Asia/Calcutta">Asia/Calcutta (UTC+5:30)</Option>
                  <Option value="UTC">UTC</Option>
                  <Option value="America/New_York">America/New_York (UTC-5)</Option>
                  <Option value="Europe/London">Europe/London (UTC+0)</Option>
                </Select>
              </div>
            </div>
          </Col>

          <Col xs={24} md={12}>
            <div className="bg-gray-50 p-6 rounded-lg">
              <Title level={5} className="mb-4">Preview</Title>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${
                    theme === 'light' ? 'bg-gray-800' : 
                    theme === 'dark' ? 'bg-white' : 'bg-gray-400'
                  }`}></div>
                  <span>Theme: {theme}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span>Language: {language.toUpperCase()}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span>Timezone: {timezone}</span>
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </Card>

      {/* Notification Preferences */}
      <Card title="Notification Preferences">
        <List
          dataSource={notificationPreferences}
          renderItem={(item) => (
            <List.Item>
              <List.Item.Meta
                avatar={
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <BellOutlined className="text-blue-600" />
                  </div>
                }
                title={
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="mr-2">{item.title}</span>
                      <Tag color={item.enabled ? 'green' : 'default'}>
                        {item.enabled ? 'Enabled' : 'Disabled'}
                      </Tag>
                    </div>
                    <Switch
                      checked={item.enabled}
                      onChange={() => toggleNotification(item.id)}
                    />
                  </div>
                }
                description={
                  <div className="space-y-3">
                    <Text type="secondary">{item.description}</Text>
                    
                    <div>
                      <Text strong className="mb-1 block">Frequency:</Text>
                      <Select
                        value={item.frequency}
                        onChange={(value) => updateNotificationFrequency(item.id, value)}
                        className="w-32"
                        disabled={!item.enabled}
                      >
                        <Option value="immediate">Immediate</Option>
                        <Option value="daily">Daily</Option>
                        <Option value="weekly">Weekly</Option>
                        <Option value="never">Never</Option>
                      </Select>
                    </div>

                    <div>
                      <Text strong className="mb-2 block">Delivery Channels:</Text>
                      <Space>
                        {Object.entries(item.channels).map(([channel, enabled]) => (
                          <Checkbox
                            key={channel}
                            checked={enabled}
                            onChange={(e) => updateNotificationChannel(item.id, channel, e.target.checked)}
                            disabled={!item.enabled}
                          >
                            {channel.charAt(0).toUpperCase() + channel.slice(1)}
                          </Checkbox>
                        ))}
                      </Space>
                    </div>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      </Card>

      {/* Chat Preferences */}
      <Card title="Chat Preferences">
        <List
          dataSource={chatPreferences}
          renderItem={(item) => (
            <List.Item>
              <List.Item.Meta
                avatar={
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <MessageOutlined className="text-green-600" />
                  </div>
                }
                title={
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="mr-2">{item.title}</span>
                      <Tag color={item.enabled ? 'green' : 'default'}>
                        {item.enabled ? 'Enabled' : 'Disabled'}
                      </Tag>
                    </div>
                    <Switch
                      checked={item.enabled}
                      onChange={() => toggleChatOption(item.id, 'enabled')}
                    />
                  </div>
                }
                description={
                  <div className="space-y-3">
                    <Text type="secondary">{item.description}</Text>
                    
                    <div>
                      <Text strong className="mb-2 block">Options:</Text>
                      <Space wrap>
                        {Object.entries(item.options).map(([option, enabled]) => (
                          <Checkbox
                            key={option}
                            checked={enabled}
                            onChange={(e) => toggleChatOption(item.id, option)}
                            disabled={!item.enabled}
                          >
                            {option.charAt(0).toUpperCase() + option.slice(1).replace(/([A-Z])/g, ' $1')}
                          </Checkbox>
                        ))}
                      </Space>
                    </div>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      </Card>

      {/* Accessibility Preferences */}
      <Card title="Accessibility Preferences">
        <List
          dataSource={accessibilityPreferences}
          renderItem={(item) => (
            <List.Item>
              <List.Item.Meta
                avatar={
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <UserOutlined className="text-purple-600" />
                  </div>
                }
                title={
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="mr-2">{item.title}</span>
                      <Tag color={item.enabled ? 'green' : 'default'}>
                        {item.enabled ? 'Enabled' : 'Disabled'}
                      </Tag>
                    </div>
                    <Switch
                      checked={item.enabled}
                      onChange={() => toggleAccessibility(item.id)}
                    />
                  </div>
                }
                description={
                  <div className="space-y-3">
                    <Text type="secondary">{item.description}</Text>
                    
                    {item.enabled && (
                      <div className="space-y-3">
                        <div>
                          <Text strong className="mb-2 block">Font Size:</Text>
                          <Slider
                            value={item.settings.fontSize}
                            onChange={(value) => updateAccessibilitySetting(item.id, 'fontSize', value)}
                            min={12}
                            max={24}
                            step={1}
                            marks={{
                              12: 'Small',
                              16: 'Medium',
                              20: 'Large',
                              24: 'Extra Large'
                            }}
                          />
                        </div>

                        <div className="space-y-2">
                          <Checkbox
                            checked={item.settings.highContrast}
                            onChange={(e) => updateAccessibilitySetting(item.id, 'highContrast', e.target.checked)}
                          >
                            High Contrast Mode
                          </Checkbox>
                          <Checkbox
                            checked={item.settings.reducedMotion}
                            onChange={(e) => updateAccessibilitySetting(item.id, 'reducedMotion', e.target.checked)}
                          >
                            Reduce Motion
                          </Checkbox>
                          <Checkbox
                            checked={item.settings.screenReader}
                            onChange={(e) => updateAccessibilitySetting(item.id, 'screenReader', e.target.checked)}
                          >
                            Screen Reader Optimized
                          </Checkbox>
                        </div>
                      </div>
                    )}
                  </div>
                }
              />
            </List.Item>
          )}
        />
      </Card>

      {/* Experimental Features */}
      <Card title="Experimental Features">
        <Alert
          message="Experimental Features"
          description="These features are still in development and may change. Your feedback helps us improve."
          type="info"
          showIcon
          className="mb-4"
        />

        <Space direction="vertical" size="large" className="w-full">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <Title level={5}>AI-Powered Suggestions</Title>
              <Text type="secondary">Get intelligent suggestions based on your conversation patterns</Text>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <Title level={5}>Voice Commands</Title>
              <Text type="secondary">Control the app with voice commands (beta)</Text>
            </div>
            <Switch />
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <Title level={5}>Dark Mode Preview</Title>
              <Text type="secondary">Try out our new dark theme design</Text>
            </div>
            <Switch />
          </div>
        </Space>
      </Card>

      <Alert
        message="Preferences Sync"
        description="Your preferences are automatically synced across all your devices. Changes take effect immediately."
        type="success"
        showIcon
      />
    </div>
  );
};

export default Preferences;
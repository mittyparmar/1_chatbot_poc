import React, { createContext, useContext, ReactNode } from 'react';

export interface ConfigContextType {
  theme: 'light' | 'dark' | 'system';
  primaryColor: string;
  secondaryColor: string;
  borderRadius: string;
  fontSize: string;
  spacing: string;
  animations: boolean;
  rtl: boolean;
  locale: string;
  zIndex: {
    modal: number;
    dropdown: number;
    tooltip: number;
    notification: number;
  };
}

export const defaultConfig: ConfigContextType = {
  theme: 'light',
  primaryColor: '#007AFF',
  secondaryColor: '#5856D6',
  borderRadius: '8px',
  fontSize: '14px',
  spacing: '8px',
  animations: true,
  rtl: false,
  locale: 'en-US',
  zIndex: {
    modal: 1000,
    dropdown: 1000,
    tooltip: 1000,
    notification: 1000,
  },
};

export const ConfigContext = createContext<ConfigContextType>(defaultConfig);

export interface ConfigProviderProps {
  children: ReactNode;
  config?: Partial<ConfigContextType>;
}

export const ConfigProvider: React.FC<ConfigProviderProps> = ({
  children,
  config = {},
}) => {
  const mergedConfig = {
    ...defaultConfig,
    ...config,
    zIndex: {
      ...defaultConfig.zIndex,
      ...config.zIndex,
    },
  };

  return (
    <ConfigContext.Provider value={mergedConfig}>
      {children}
    </ConfigContext.Provider>
  );
};

export const useConfig = () => {
  const context = useContext(ConfigContext);
  if (context === undefined) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return context;
};

export default ConfigProvider;
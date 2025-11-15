import React, { lazy, Suspense, ComponentType, LazyExoticComponent, ReactNode, isValidElement } from 'react';
import { ErrorBoundary } from './ErrorBoundary';

interface ModuleLoaderProps {
  modulePath: string;
  fallback?: ReactNode;
  errorFallback?: ReactNode;
  loadingProps?: Record<string, any>;
}

// Dynamic import with error handling
const loadModule = async (modulePath: string): Promise<ComponentType<any> | null> => {
  try {
    // For development, use localhost URLs
    if (process.env.NODE_ENV === 'development') {
      switch (modulePath) {
        case 'auth':
          const authModule = await import('auth/Auth');
          return authModule.default;
        case 'chat':
          const chatModule = await import('chat/Chat');
          return chatModule.default;
        case 'admin':
          const adminModule = await import('admin/Admin');
          return adminModule.default;
        case 'profile':
          const profileModule = await import('profile/Profile');
          return profileModule.default;
        default:
          return null;
      }
    }
    
    // For production, this would be handled by Module Federation
    return null;
  } catch (error) {
    console.error(`Failed to load module ${modulePath}:`, error);
    return null;
  }
};

const DefaultLoading: React.FC = () => (
  <div className="module-loading">
    <div className="module-loading-spinner" />
    <p className="mt-4 text-sm text-gray-600">Loading module...</p>
  </div>
);

const DefaultError: React.FC = () => (
  <div className="error-boundary">
    <svg className="w-16 h-16 text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
    <h2>Module Error</h2>
    <p>Unable to load the requested module. Please try again later.</p>
  </div>
);

export const ModuleLoader: React.FC<ModuleLoaderProps> = ({
  modulePath,
  fallback = <DefaultLoading />,
  errorFallback = <DefaultError />,
  loadingProps = {}
}) => {
  const [Component, setComponent] = React.useState<LazyExoticComponent<ComponentType<any>> | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    let isMounted = true;

    const loadModuleComponent = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const module = await loadModule(modulePath);
        if (isMounted && module) {
          setComponent(lazy(() => Promise.resolve({ default: module })));
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to load module');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadModuleComponent();

    return () => {
      isMounted = false;
    };
  }, [modulePath]);

  if (isLoading) {
    return <Suspense fallback={fallback || null}>
      {isValidElement(fallback) ? React.cloneElement(fallback, loadingProps) : React.createElement('div', loadingProps)}
    </Suspense>;
  }

  if (error) {
    return isValidElement(errorFallback) ? React.cloneElement(errorFallback, { error: error || 'Module failed to load', ...loadingProps }) : React.createElement('div', { children: error || 'Module failed to load', ...loadingProps as any });
  }

  if (!Component) {
    return isValidElement(errorFallback) ? React.cloneElement(errorFallback, {
      error: 'Module not found',
      ...loadingProps
    }) : React.createElement('div', { children: 'Module not found', ...loadingProps as any });
  }

  return (
    <ErrorBoundary fallback={errorFallback}>
      <Suspense fallback={fallback}>
        <Component {...loadingProps} />
      </Suspense>
    </ErrorBoundary>
  );
};

// Higher-order component for route-based module loading
export const withModuleLoader = (modulePath: string) => (Component: ComponentType<any>) => {
  return (props: any) => (
    <ModuleLoader modulePath={modulePath} loadingProps={props} />
  );
};

// Preload modules for better performance
export const preloadModule = (modulePath: string): Promise<void> => {
  return loadModule(modulePath).then(() => {
    // Module loaded successfully
  }).catch(() => {
    // Module failed to load, but we don't want to throw
    // This allows the application to continue functioning
  });
};

// Module registry for managing loaded modules
export const ModuleRegistry = {
  loadedModules: new Set<string>(),

  isLoaded(modulePath: string): boolean {
    return this.loadedModules.has(modulePath);
  },

  markAsLoaded(modulePath: string): void {
    this.loadedModules.add(modulePath);
  },

  clear(): void {
    this.loadedModules.clear();
  }
};

// Hook for checking module loading status
export const useModuleStatus = (modulePath: string) => {
  const [status, setStatus] = React.useState<'loading' | 'loaded' | 'error' | 'not-loaded'>('not-loaded');

  React.useEffect(() => {
    if (ModuleRegistry.isLoaded(modulePath)) {
      setStatus('loaded');
      return;
    }

    setStatus('loading');
    loadModule(modulePath)
      .then(() => {
        setStatus('loaded');
        ModuleRegistry.markAsLoaded(modulePath);
      })
      .catch(() => {
        setStatus('error');
      });
  }, [modulePath]);

  return status;
};
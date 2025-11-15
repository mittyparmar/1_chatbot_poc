import { CSSProperties } from 'react';

// Define theme structure types
interface ColorPalette {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
}

interface BrandColors {
  blue: string;
  green: string;
  orange: string;
  red: string;
  purple: string;
  pink: string;
  teal: string;
  yellow: string;
}

interface ThemeColors {
  primary: ColorPalette;
  secondary: ColorPalette;
  success: ColorPalette;
  warning: ColorPalette;
  error: ColorPalette;
  brand: BrandColors;
  neutral: {
    0: string;
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
  };
  background: {
    primary: string;
    secondary: string;
    tertiary: string;
    inverted: string;
  };
  text: {
    primary: string;
    secondary: string;
    disabled: string;
    inverted: string;
    link: string;
  };
  border: {
    primary: string;
    secondary: string;
    tertiary: string;
    focus: string;
  };
  shadow: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
  };
}

interface Typography {
  fontFamily: {
    sans: string[];
    mono: string[];
  };
  fontSize: {
    xs: string;
    sm: string;
    base: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
    '4xl': string;
    '5xl': string;
    '6xl': string;
  };
  fontWeight: {
    thin: number;
    extralight: number;
    light: number;
    normal: number;
    medium: number;
    semibold: number;
    bold: number;
    extrabold: number;
    black: number;
  };
  lineHeight: {
    tight: number;
    snug: number;
    normal: number;
    relaxed: number;
    loose: number;
  };
  letterSpacing: {
    tighter: string;
    tight: string;
    normal: string;
    wide: string;
    wider: string;
    widest: string;
  };
}

interface Spacing {
  [key: string]: string;
}

interface BorderRadius {
  none: string;
  sm: string;
  DEFAULT: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  '3xl': string;
  full: string;
}

interface Transitions {
  DEFAULT: string;
  fast: string;
  slow: string;
  bounce: string;
}

interface Animations {
  fadeIn: string;
  slideIn: string;
  scaleIn: string;
  pulse: string;
  bounce: string;
}

interface Breakpoints {
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
}

interface ZIndex {
  auto: string;
  0: string;
  10: string;
  20: string;
  30: string;
  40: string;
  50: string;
}

// Apple-inspired design tokens
export const theme = {
  // Colors - inspired by Apple's design language
  colors: {
    // Primary colors
    primary: {
      50: '#f0f9ff',
      100: '#e0f2fe',
      200: '#bae6fd',
      300: '#7dd3fc',
      400: '#38bdf8',
      500: '#0ea5e9',
      600: '#0284c7',
      700: '#0369a1',
      800: '#075985',
      900: '#0c4a6e',
    },
    
    // Secondary colors
    secondary: {
      50: '#fafafa',
      100: '#f4f4f5',
      200: '#e4e4e7',
      300: '#d4d4d8',
      400: '#a1a1aa',
      500: '#71717a',
      600: '#52525b',
      700: '#3f3f46',
      800: '#27272a',
      900: '#18181b',
    },
    
    // Success colors
    success: {
      50: '#f0fdf4',
      100: '#dcfce7',
      200: '#bbf7d0',
      300: '#86efac',
      400: '#4ade80',
      500: '#22c55e',
      600: '#16a34a',
      700: '#15803d',
      800: '#166534',
      900: '#14532d',
    },
    
    // Warning colors
    warning: {
      50: '#fffbeb',
      100: '#fef3c7',
      200: '#fde68a',
      300: '#fcd34d',
      400: '#fbbf24',
      500: '#f59e0b',
      600: '#d97706',
      700: '#b45309',
      800: '#92400e',
      900: '#78350f',
    },
    
    // Error colors
    error: {
      50: '#fef2f2',
      100: '#fee2e2',
      200: '#fecaca',
      300: '#fca5a5',
      400: '#f87171',
      500: '#ef4444',
      600: '#dc2626',
      700: '#b91c1c',
      800: '#991b1b',
      900: '#7f1d1d',
    },
    
    // Brand colors (Apple-inspired)
    brand: {
      blue: '#007AFF',
      green: '#34C759',
      orange: '#FF9500',
      red: '#FF3B30',
      purple: '#AF52DE',
      pink: '#FF2D55',
      teal: '#5AC8FA',
      yellow: '#FFCC00',
    },
    
    // Neutral colors
    neutral: {
      0: '#ffffff',
      50: '#fafafa',
      100: '#f5f5f7',
      200: '#e5e5e7',
      300: '#d7d7db',
      400: '#c7c7cc',
      500: '#86868b',
      600: '#6e6e73',
      700: '#48484a',
      800: '#1d1d1f',
      900: '#000000',
    },
    
    // Semantic colors
    background: {
      primary: '#ffffff',
      secondary: '#f5f5f7',
      tertiary: '#e5e5e7',
      inverted: '#000000',
    },
    
    text: {
      primary: '#1d1d1f',
      secondary: '#6e6e73',
      disabled: '#c7c7cc',
      inverted: '#ffffff',
      link: '#007AFF',
    },
    
    border: {
      primary: '#e5e5e7',
      secondary: '#d7d7db',
      tertiary: '#c7c7cc',
      focus: '#007AFF',
    },
    
    // Shadow colors
    shadow: {
      sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    },
  },
  
  // Typography - inspired by Apple's San Francisco font
  typography: {
    fontFamily: {
      sans: [
        '-apple-system',
        'BlinkMacSystemFont',
        '"Segoe UI"',
        'Roboto',
        '"Helvetica Neue"',
        'Arial',
        'sans-serif',
      ],
      mono: [
        '"SF Mono"',
        'Monaco',
        'Cascadia Code',
        'Roboto Mono',
        'Oxygen Mono',
        'Ubuntu Monospace',
        'Source Code Pro',
        'Fira Code',
        'Droid Sans Mono',
        'Courier New',
        'monospace',
      ],
    },
    
    fontSize: {
      xs: '0.75rem', // 12px
      sm: '0.875rem', // 14px
      base: '1rem', // 16px
      lg: '1.125rem', // 18px
      xl: '1.25rem', // 20px
      '2xl': '1.5rem', // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem', // 36px
      '5xl': '3rem', // 48px
      '6xl': '3.75rem', // 60px
    },
    
    fontWeight: {
      thin: 100,
      extralight: 200,
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
      black: 900,
    },
    
    lineHeight: {
      tight: 1.25,
      snug: 1.375,
      normal: 1.5,
      relaxed: 1.625,
      loose: 2,
    },
    
    letterSpacing: {
      tighter: '-0.05em',
      tight: '-0.025em',
      normal: '0',
      wide: '0.025em',
      wider: '0.05em',
      widest: '0.1em',
    },
  },
  
  // Spacing - inspired by Apple's 8pt grid system
  spacing: {
    px: '1px',
    0: '0',
    0.5: '0.125rem', // 2px
    1: '0.25rem', // 4px
    1.5: '0.375rem', // 6px
    2: '0.5rem', // 8px
    2.5: '0.625rem', // 10px
    3: '0.75rem', // 12px
    3.5: '0.875rem', // 14px
    4: '1rem', // 16px
    5: '1.25rem', // 20px
    6: '1.5rem', // 24px
    7: '1.75rem', // 28px
    8: '2rem', // 32px
    9: '2.25rem', // 36px
    10: '2.5rem', // 40px
    11: '2.75rem', // 44px
    12: '3rem', // 48px
    14: '3.5rem', // 56px
    16: '4rem', // 64px
    20: '5rem', // 80px
    24: '6rem', // 96px
    28: '7rem', // 112px
    32: '8rem', // 128px
    36: '9rem', // 144px
    40: '10rem', // 160px
    44: '11rem', // 176px
    48: '12rem', // 192px
    52: '13rem', // 208px
    56: '14rem', // 224px
    60: '15rem', // 240px
    64: '16rem', // 256px
    72: '18rem', // 288px
    80: '20rem', // 320px
    96: '24rem', // 384px
  },
  
  // Border radius - inspired by Apple's rounded corners
  borderRadius: {
    none: '0',
    sm: '0.125rem', // 2px
    DEFAULT: '0.375rem', // 6px
    md: '0.5rem', // 8px
    lg: '0.75rem', // 12px
    xl: '1rem', // 16px
    '2xl': '1.5rem', // 24px
    '3xl': '2rem', // 32px
    full: '9999px',
  },
  
  // Transitions - inspired by Apple's smooth animations
  transitions: {
    DEFAULT: 'all 0.2s ease-in-out',
    fast: 'all 0.1s ease-in-out',
    slow: 'all 0.3s ease-in-out',
    bounce: 'all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
  
  // Animation keyframes
  animations: {
    fadeIn: 'fadeIn 0.3s ease-in-out',
    slideIn: 'slideIn 0.3s ease-in-out',
    scaleIn: 'scaleIn 0.3s ease-in-out',
    pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
    bounce: 'bounce 1s ease-in-out infinite',
  },
  
  // Z-index layering
  zIndex: {
    auto: 'auto',
    0: '0',
    10: '10',
    20: '20',
    30: '30',
    40: '40',
    50: '50',
  },
  
  // Breakpoints - responsive design
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
};

// CSS utility functions
export const css = {
  // Create CSS variables for theme
  createCSSVariables: (): CSSProperties => ({
    '--color-primary': theme.colors.primary[500],
    '--color-primary-dark': theme.colors.primary[600],
    '--color-secondary': theme.colors.secondary[500],
    '--color-background': theme.colors.background.primary,
    '--color-text': theme.colors.text.primary,
    '--color-text-secondary': theme.colors.text.secondary,
    '--color-border': theme.colors.border.primary,
    '--color-brand-blue': theme.colors.brand.blue,
    '--color-brand-green': theme.colors.brand.green,
    '--color-brand-orange': theme.colors.brand.orange,
    '--color-brand-red': theme.colors.brand.red,
    '--color-brand-purple': theme.colors.brand.purple,
    '--color-brand-pink': theme.colors.brand.pink,
    '--color-brand-teal': theme.colors.brand.teal,
    '--color-brand-yellow': theme.colors.brand.yellow,
    '--radius': theme.borderRadius.DEFAULT,
    '--shadow-sm': theme.shadow.sm,
    '--shadow-md': theme.shadow.md,
    '--shadow-lg': theme.shadow.lg,
    '--transition': theme.transitions.DEFAULT,
    '--font-sans': theme.typography.fontFamily.sans.join(', '),
    '--font-mono': theme.typography.fontFamily.mono.join(', '),
  }),
  
  // Apple-inspired glassmorphism effect
  glassmorphism: (blur: number = 10, opacity: number = 0.1): CSSProperties => ({
    backdropFilter: `blur(${blur}px)`,
    WebkitBackdropFilter: `blur(${blur}px)`,
    backgroundColor: `rgba(255, 255, 255, ${opacity})`,
    border: `1px solid rgba(255, 255, 255, ${opacity * 2})`,
  }),
  
  // Smooth scrolling
  smoothScroll: (): CSSProperties => ({
    scrollBehavior: 'smooth',
    WebkitOverflowScrolling: 'touch',
  }),
  
  // Hide scrollbar but keep functionality
  hideScrollbar: (): CSSProperties => ({
    '&::-webkit-scrollbar': {
      display: 'none',
    },
    msOverflowStyle: 'none',
    scrollbarWidth: 'none',
  }),
};

// Dark mode theme
export const darkTheme = {
  ...theme,
  colors: {
    ...theme.colors,
    background: {
      primary: '#000000',
      secondary: '#1a1a1a',
      tertiary: '#2a2a2a',
      inverted: '#ffffff',
    },
    text: {
      primary: '#ffffff',
      secondary: '#a1a1aa',
      disabled: '#6b7280',
      inverted: '#000000',
      link: '#0ea5e9',
    },
    border: {
      primary: '#374151',
      secondary: '#4b5563',
      tertiary: '#6b7280',
      focus: '#60a5fa',
    },
  },
};

// Global CSS styles for animations
export const globalStyles = `
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes slideIn {
    from { 
      transform: translateY(-10px); 
      opacity: 0; 
    }
    to { 
      transform: translateY(0); 
      opacity: 1; 
    }
  }
  
  @keyframes scaleIn {
    from { 
      transform: scale(0.95); 
      opacity: 0; 
    }
    to { 
      transform: scale(1); 
      opacity: 1; 
    }
  }
  
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
  
  @keyframes bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }
  
  /* Apple-inspired smooth scrolling */
  html {
    scroll-behavior: smooth;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
  
  /* Hide scrollbar globally */
  .hide-scrollbar {
    &::-webkit-scrollbar {
      display: none;
    }
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  
  /* Glassmorphism utility class */
  .glass {
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    background-color: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
  }
  
  /* Focus styles */
  .focus-ring {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
  }
  
  /* Button hover effects */
  .btn-hover {
    transition: all 0.2s ease-in-out;
    &:hover {
      transform: translateY(-1px);
    }
    &:active {
      transform: translateY(0);
    }
  }
`;

// Export theme types
export type Theme = typeof theme;
export type DarkTheme = typeof darkTheme;
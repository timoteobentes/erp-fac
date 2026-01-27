import { createTheme } from '@mui/material/styles';

// FAC Design System Theme
const facTheme = createTheme({
  // Paleta de cores baseada no design system
  palette: {
    primary: {
      main: '#6B00A1',
      light: '#8a2db8',
      dark: '#4a0071',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#174FE2',
      light: '#4574e8',
      dark: '#0f379e',
      contrastText: '#ffffff',
    },
    grey: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827',
    },
    success: {
      main: '#10b981',
      light: '#34d399',
      dark: '#047857',
    },
    warning: {
      main: '#f59e0b',
      light: '#fbbf24',
      dark: '#d97706',
    },
    background: {
      default: '#ffffff',
      paper: '#ffffff',
    },
    text: {
      primary: '#374151',
      secondary: '#6b7280',
    },
  },

  // Tipografia seguindo o design system
  typography: {
    fontFamily: '"Heebo", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '3rem', // 48px
      fontWeight: 300, // Light
      lineHeight: 1.6,
      '@media (max-width:1024px)': {
        fontSize: '2.5rem',
      },
      '@media (max-width:768px)': {
        fontSize: '2rem',
      },
      '@media (max-width:640px)': {
        fontSize: '1.5rem',
      },
    },
    h2: {
      fontSize: '2.5rem', // 40px
      fontWeight: 500, // Medium
      lineHeight: 1.6,
      '@media (max-width:1024px)': {
        fontSize: '2rem',
      },
      '@media (max-width:768px)': {
        fontSize: '1.5rem',
      },
      '@media (max-width:640px)': {
        fontSize: '1.25rem',
      },
    },
    h3: {
      fontSize: '2rem', // 32px
      fontWeight: 700, // Bold
      lineHeight: 1.6,
      '@media (max-width:768px)': {
        fontSize: '1.25rem',
      },
      '@media (max-width:640px)': {
        fontSize: '1.125rem',
      },
    },
    h4: {
      fontSize: '1.5rem', // 24px
      fontWeight: 700, // Bold
      lineHeight: 1.6,
    },
    h5: {
      fontSize: '1.25rem', // 20px
      fontWeight: 500, // Medium
      lineHeight: 1.6,
    },
    h6: {
      fontSize: '1rem', // 16px
      fontWeight: 600,
      lineHeight: 1.6,
    },
    body1: {
      fontSize: '1rem', // 16px - Text Regular
      fontWeight: 400,
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem', // 14px - Text Medium
      fontWeight: 400,
      lineHeight: 1.6,
    },
    caption: {
      fontSize: '0.75rem', // 12px - Subtitle
      fontWeight: 400,
      lineHeight: 1.6,
    },
    overline: {
      fontSize: '0.625rem', // 10px - Text Small
      fontWeight: 400,
      lineHeight: 1.6,
      textTransform: 'uppercase',
    },
    button: {
      fontSize: '1rem',
      fontWeight: 600,
      textTransform: 'none', // Remove uppercase padrão
      lineHeight: 1.6,
    },
  },

  // Espaçamento baseado na escala do design system
  spacing: 4, // Base de 4px (4, 8, 16, 24, 32, 40, 56, 72)

  // Breakpoints customizados
  breakpoints: {
    values: {
      xs: 0,
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
    },
  },

  // Shape (border radius)
  shape: {
    borderRadius: 12, // 12px padrão conforme design system
  },

  // Sombras customizadas
  shadows: [
    'none',
    '0px 1px 3px rgba(0, 0, 0, 0.12), 0px 1px 2px rgba(0, 0, 0, 0.24)',
    '0px 3px 6px rgba(0, 0, 0, 0.16), 0px 3px 6px rgba(0, 0, 0, 0.23)',
    '0px 10px 20px rgba(0, 0, 0, 0.19), 0px 6px 6px rgba(0, 0, 0, 0.23)',
    '0px 4px 4px rgba(0, 0, 0, 0.25)', // Shadow padrão dos botões
    '0px 6px 8px rgba(0, 0, 0, 0.3)', // Shadow hover dos botões
    '0px 2px 2px rgba(0, 0, 0, 0.2)', // Shadow active dos botões
    ...Array(18).fill('0px 4px 4px rgba(0, 0, 0, 0.25)'), // Preenche o resto do array
  ],

  // Componentes customizados
  components: {
    // Button customizado
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          // padding: '12px 24px',
          fontSize: '1rem',
          fontWeight: 600,
          textTransform: 'none',
          minWidth: 95, // Largura mínima conforme design system
          // boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
          boxShadow: 'none',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            // boxShadow: '0px 6px 8px rgba(0, 0, 0, 0.3)',
            boxShadow: 'none',
            // transform: 'translateY(-1px)',
          },
          '&:active': {
            // boxShadow: '0px 2px 2px rgba(0, 0, 0, 0.2)',
            boxShadow: 'none',
            transform: 'translateY(0px)',
          },
        },
        containedPrimary: {
          backgroundColor: '#6B00A1',
          '&:hover': {
            backgroundColor: '#9842F6',
          },
        },
        textPrimary: {
          color: '#6B00A1',
          boxShadow: 'none',
          '&:hover': {
            backgroundColor: 'rgba(107, 0, 161, 0.04)',
            boxShadow: 'none',
          },
        },
        sizeLarge: {
          padding: '16px 32px',
          fontSize: '1.125rem',
        },
        sizeSmall: {
          padding: '8px 16px',
          fontSize: '0.875rem',
          minWidth: 80,
        },
      },
    },

    // TextField customizado
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            backgroundColor: '#f9fafb',
            minWidth: 95, // Largura mínima conforme design system
            '& fieldset': {
              borderColor: '#d1d5db',
              borderWidth: 1,
            },
            '&:hover fieldset': {
              borderColor: '#6B00A1',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#6B00A1',
              borderWidth: 2,
            },
            '&.Mui-error fieldset': {
              borderColor: '#ef4444',
            },
          },
          '& .MuiInputLabel-root': {
            color: '#6b7280',
            '&.Mui-focused': {
              color: '#6B00A1',
            },
            '&.Mui-error': {
              color: '#ef4444',
            },
          },
          '& .MuiOutlinedInput-input': {
            padding: '12px 14px',
            fontSize: '1rem',
          },
        },
      },
    },

    // Select customizado
    MuiSelect: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          backgroundColor: '#f9fafb',
          minWidth: 95,
          
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: '#d1d5db',
            borderWidth: 1,
          },
          
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#6B00A1',
          },
          
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#6B00A1',
            borderWidth: 2,
          },
          
          '&.Mui-error .MuiOutlinedInput-notchedOutline': {
            borderColor: '#ef4444',
          },
        },
      },
    },

    // Estilização do dropdown (Menu)
    // MuiMenu: {
    //   styleOverrides: {
    //     paper: {
    //       borderRadius: 8,
    //       marginTop: 4,
    //       boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    //     },
    //   },
    // },

    // Estilização dos itens do dropdown
    // MuiMenuItem: {
    //   styleOverrides: {
    //     root: {
    //       padding: '8px 16px',
    //       fontSize: '0.875rem',
          
    //       '&:hover': {
    //         backgroundColor: '#f3f4f6',
    //       },
          
    //       '&.Mui-selected': {
    //         backgroundColor: '#6B00A1',
    //         color: 'white',
            
    //         '&:hover': {
    //           backgroundColor: '#5a008a',
    //         },
    //       },
    //     },
    //   },
    // },

    // Estilização do InputLabel (se você usar label)
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: '#6b7280',
          fontSize: '0.875rem',
          
          '&.Mui-focused': {
            color: '#6B00A1',
          },
          
          '&.Mui-error': {
            color: '#ef4444',
          },
        },
      },
    },

    // Estilização do input interno
    MuiOutlinedInput: {
      styleOverrides: {
        input: {
          padding: '12px 14px',
          fontSize: '0.875rem',
        },
      },
    },

    // Card customizado
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
          '&:hover': {
            boxShadow: '0px 6px 12px rgba(0, 0, 0, 0.15)',
          },
        },
      },
    },

    // Paper customizado
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
        elevation1: {
          boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
        },
        elevation2: {
          boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
        },
        elevation3: {
          boxShadow: '0px 6px 12px rgba(0, 0, 0, 0.15)',
        },
      },
    },

    // Chip customizado
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          fontSize: '0.875rem',
          fontWeight: 500,
        },
        colorPrimary: {
          backgroundColor: '#6B00A1',
          color: '#ffffff',
        },
        colorSecondary: {
          backgroundColor: '#174FE2',
          color: '#ffffff',
        },
      },
    },

    // Tab customizado
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontSize: '1rem',
          fontWeight: 500,
          minHeight: 48,
          '&.Mui-selected': {
            color: '#6B00A1',
            fontWeight: 600,
          },
        },
      },
    },

    // AppBar customizado
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#6B00A1',
          boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
        },
      },
    },

    // Dialog customizado
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 16,
          padding: '8px',
        },
      },
    },

    // Switch customizado
    MuiSwitch: {
      styleOverrides: {
        root: {
          '& .MuiSwitch-switchBase.Mui-checked': {
            color: '#6B00A1',
            '& + .MuiSwitch-track': {
              backgroundColor: '#6B00A1',
            },
          },
        },
      },
    },

    // Checkbox customizado
    MuiCheckbox: {
      styleOverrides: {
        root: {
          color: '#6b7280',
          '&.Mui-checked': {
            color: '#6B00A1',
          },
        },
      },
    },

    // Radio customizado
    MuiRadio: {
      styleOverrides: {
        root: {
          color: '#6b7280',
          '&.Mui-checked': {
            color: '#6B00A1',
          },
        },
      },
    },

    // Slider customizado
    MuiSlider: {
      styleOverrides: {
        root: {
          color: '#6B00A1',
        },
      },
    },

    // LinearProgress customizado
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          backgroundColor: '#e5e7eb',
        },
        bar: {
          borderRadius: 8,
          backgroundColor: '#6B00A1',
        },
      },
    },

    // CircularProgress customizado
    MuiCircularProgress: {
      styleOverrides: {
        root: {
          color: '#6B00A1',
        },
      },
    },

    // Alert customizado
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
        standardSuccess: {
          backgroundColor: '#f0fdf4',
          color: '#166534',
        },
        standardError: {
          backgroundColor: '#fef2f2',
          color: '#dc2626',
        },
        standardWarning: {
          backgroundColor: '#fffbeb',
          color: '#d97706',
        },
        standardInfo: {
          backgroundColor: '#eff6ff',
          color: '#2563eb',
        },
      },
    },

    // Tooltip customizado
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: '#374151',
          borderRadius: 8,
          fontSize: '0.875rem',
        },
      },
    },

    // Menu customizado
    MuiMenu: {
      styleOverrides: {
        paper: {
          borderRadius: 12,
          boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
        },
      },
    },

    // MenuItem customizado
    MuiMenuItem: {
      styleOverrides: {
        root: {
          fontSize: '1rem',
          padding: '12px 16px',
          '&:hover': {
            backgroundColor: 'rgba(107, 0, 161, 0.04)',
          },
          '&.Mui-selected': {
            backgroundColor: 'rgba(107, 0, 161, 0.08)',
            '&:hover': {
              backgroundColor: 'rgba(107, 0, 161, 0.12)',
            },
          },
        },
      },
    },
  },
});

export default facTheme;
import { createTheme } from '@mui/material/styles';

export const appTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#0057ff'
    },
    secondary: {
      main: '#7A5AF8'
    },
    success: {
      main: '#0F9960'
    },
    warning: {
      main: '#F7B500'
    }
  },
  shape: {
    borderRadius: 12
  },
  typography: {
    fontFamily: 'Inter, sans-serif',
    h1: { fontSize: '2.75rem', fontWeight: 600 },
    h2: { fontSize: '2.25rem', fontWeight: 600 },
    h3: { fontSize: '1.75rem', fontWeight: 600 },
    h4: { fontSize: '1.5rem', fontWeight: 600 },
    subtitle1: { fontWeight: 500 }
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 999
        }
      }
    }
  }
});

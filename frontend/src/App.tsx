import './App.css';
import { AuthProvider } from './modules/Login/context/AuthContext.tsx';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import AppRoutes from './routes/route.tsx';
import facTheme from './theme/facTheme.ts';
import AOSProvider from './providers/aos-provider.tsx';
import { ToastContainer } from 'react-toastify';

function App() {
  return (
    <AOSProvider>
      <ToastContainer />
      <ThemeProvider theme={facTheme}>
        <CssBaseline />
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ThemeProvider>
    </AOSProvider>
  )
}

export default App

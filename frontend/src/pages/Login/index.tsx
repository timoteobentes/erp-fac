import { useState } from "react";
import { Layout } from 'antd';
import { Button, TextField, Box, Typography, Link, InputAdornment, IconButton } from '@mui/material';
import { VisibilityOffOutlined, VisibilityOutlined } from "@mui/icons-material";
import fac_logo_branco from '../../assets/FAC_logo_branco.svg';
import fac_logo_roxo from '../../assets/FAC_logo_roxo.svg';
import { useForm, Controller } from "react-hook-form";
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from "react-router";
import { useLogin } from "../../modules/Login/hooks/useLogin";

const loginSchema = z.object({
  usuarioLogin: z.string().min(1, "E-mail ou usuário obrigatório"),
  senha: z.string().min(1, "Senha é obrigatória").min(6, "Senha muito curta")
});

type LoginFormData = z.infer<typeof loginSchema>;

const { Sider, Content } = Layout;

// Estilo Premium para os Inputs (Soft UI)
const premiumInputStyles = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
    backgroundColor: '#F8FAFC', // Cinza super claro
    transition: 'all 0.2s ease-in-out',
    '& fieldset': {
      borderColor: 'transparent', // Sem borda inicialmente
    },
    '&:hover fieldset': {
      borderColor: '#E2E8F0', // Borda sutil no hover
    },
    '&.Mui-focused': {
      backgroundColor: '#FFFFFF', // Fica branco ao focar
      boxShadow: '0 0 0 4px rgba(91, 33, 182, 0.1)', // Halo roxo sutil
    },
    '&.Mui-focused fieldset': {
      borderColor: '#5B21B6', // Roxo do Design System
      borderWidth: '1px',
    },
  }
};

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading } = useLogin();
  
  const { control, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { usuarioLogin: "", senha: "" }
  });

  const onSubmit = (data: LoginFormData) => {
    // Corrigido: Passando o objeto conforme a assinatura do seu hook
    login({ usuarioLogin: data.usuarioLogin, senha: data.senha });
  };

  return (
    <Layout style={{ minHeight: '100dvh', backgroundColor: '#FFFFFF' }}>
      
      {/* SIDER - O Lado Imersivo (Tech Waves & Glassmorphism) */}
      <Sider 
        width="50%" 
        breakpoint="lg"
        collapsedWidth="0"
        trigger={null}
        style={{
          background: 'linear-gradient(135deg, #1A013A 0%, #3C0473 100%)',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          overflow: 'hidden',
          color: '#fff'
        }}
      >
        {/* ELEMENTOS VISOAIS (Vetores e CSS Puro - Peso Zero) */}
        
        {/* Orbe Flutuante Superior (Efeito de Luz/Dados) */}
        <Box sx={{
          position: 'absolute', top: '-10%', right: '-10%', width: '400px', height: '400px',
          background: 'linear-gradient(135deg, #A78BFA 0%, #5B21B6 100%)',
          borderRadius: '50%', filter: 'blur(100px)', opacity: 0.4, pointerEvents: 'none',
          animation: 'pulse 6s infinite alternate' // Opcional: defina @keyframes pulse no seu CSS global
        }} />

        {/* Orbe Flutuante Inferior */}
        <Box sx={{
          position: 'absolute', bottom: '10%', left: '-15%', width: '300px', height: '300px',
          background: 'linear-gradient(135deg, #6B21A8 0%, #3C0473 100%)',
          borderRadius: '50%', filter: 'blur(80px)', opacity: 0.6, pointerEvents: 'none'
        }} />

        {/* SVG Waves - Ondas fluidas de sobreposição */}
        <Box sx={{ position: 'absolute', bottom: 0, left: 0, width: '100%', lineHeight: 0, pointerEvents: 'none' }}>
          <svg viewBox="0 0 1440 320" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', display: 'block' }}>
            <path fill="rgba(255, 255, 255, 0.03)" d="M0,160L48,144C96,128,192,96,288,106.7C384,117,480,171,576,165.3C672,160,768,96,864,74.7C960,53,1056,75,1152,90.7C1248,107,1344,117,1392,122.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
            <path fill="rgba(255, 255, 255, 0.05)" d="M0,64L48,85.3C96,107,192,150,288,149.3C384,149,480,107,576,101.3C672,96,768,128,864,154.7C960,181,1056,203,1152,192C1248,181,1344,139,1392,117.3L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
        </Box>

        {/* CONTEÚDO (Texto e Logo) - Com z-index para ficar acima das ondas */}
        <Box sx={{ 
          position: 'relative', 
          zIndex: 10, 
          display: 'flex', 
          flexDirection: 'column', 
          height: '100%', 
          p: { xs: 4, xl: 8 } 
        }}>
          
          {/* Logo fixa no topo */}
          <Box sx={{ flexShrink: 0 }}>
            <img src={fac_logo_branco} alt="Faço a Conta" style={{ width: 200 }} />
          </Box>

          {/* Texto aproveitando o espaço para se centralizar verticalmente */}
          <Box sx={{ 
            flex: 1, 
            display: 'flex', 
            flexDirection: 'column', 
            justifyContent: 'center', // Centraliza o texto no espaço que sobrou
            maxWidth: 550, // Permite que a frase respire mais
            mb: '5vh' // Apenas um leve ajuste para não bater nas ondas do fundo
          }}>
            <Typography 
              variant="h2" 
              fontWeight={800} 
              sx={{ 
                mb: 3, 
                letterSpacing: '-0.03em', 
                lineHeight: 1.1,
                fontSize: { xs: '2.5rem', md: '3.5rem', xl: '4rem' } // Escala a fonte dependendo do monitor
              }}
            >
              Inteligência para o<br/>seu negócio.
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                color: '#E2E8F0', 
                fontSize: { xs: '1.1rem', md: '1.25rem' }, 
                lineHeight: 1.6, 
                fontWeight: 300 
              }}
            >
              Controle de ponta a ponta: do balcão de vendas à gestão fiscal. Tudo em um só lugar, sem complicação.
            </Typography>
          </Box>
          
        </Box>
      </Sider>

      {/* CONTENT - O Lado Clean (Whitespace Total) */}
      <Content style={{ backgroundColor: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100dvh' }}>
        <Box 
          component="form" 
          onSubmit={handleSubmit(onSubmit)}
          sx={{ 
            width: '100%', 
            maxWidth: 400, 
            p: { xs: 4, md: 0 }, // No desktop não precisa de padding extra, o Form respira sozinho
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {/* Logo Mobile */}
          <Box sx={{ display: { xs: 'flex', lg: 'none' }, mb: 6 }}>
            <img src={fac_logo_roxo} alt="Faço a Conta" style={{ width: 160 }} />
          </Box>

          <Typography variant="h4" fontWeight={700} color="#0F172A" sx={{ mb: 1, letterSpacing: '-0.02em' }}>
            Acessar conta
          </Typography>
          <Typography variant="body1" color="#64748B" sx={{ mb: 5 }}>
            Bem-vindo(a)! Por favor, insira seus dados.
          </Typography>

          <Controller
            name="usuarioLogin"
            control={control}
            render={({ field: { onChange, value, ...rest } }) => (
              <TextField
                {...rest}
                value={value}
                onChange={(e) => {
                  onChange(e.target.value.toLowerCase());
                }}
                fullWidth
                placeholder="E-mail ou usuário"
                variant="outlined"
                error={!!errors.usuarioLogin}
                helperText={errors.usuarioLogin?.message}
                sx={{ mb: 3, ...premiumInputStyles }}
              />
            )}
          />

          <Controller
            name="senha"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                placeholder="Sua senha"
                type={showPassword ? "text" : "password"}
                variant="outlined"
                error={!!errors.senha}
                helperText={errors.senha?.message}
                sx={{ mb: 2, ...premiumInputStyles }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" sx={{ color: '#94A3B8' }}>
                        {showPassword ? <VisibilityOutlined /> : <VisibilityOffOutlined />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            )}
          />

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 4 }}>
            <Link
              component="button"
              type="button"
              onClick={() => navigate('/solicitar-nova-senha')}
              sx={{ 
                color: '#5B21B6', 
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '0.9rem',
                transition: 'all 0.2s',
                '&:hover': { color: '#3C0473', textDecoration: 'underline' } 
              }}
            >
              Esqueceu a senha?
            </Link>
          </Box>

          {/* Botão Glow Premium */}
          <Button
            fullWidth
            type="submit"
            disabled={isLoading}
            sx={{
              background: 'linear-gradient(90deg, #3C0473 0%, #5B21B6 100%)',
              color: '#fff',
              py: 1.8,
              fontSize: '1.05rem',
              fontWeight: 600,
              borderRadius: '12px',
              textTransform: 'none',
              boxShadow: '0 10px 25px -5px rgba(91, 33, 182, 0.4)', // Efeito Glow Roxo
              transition: 'all 0.2s ease-in-out',
              '&:hover': { 
                background: 'linear-gradient(90deg, #28024D 0%, #4C1D95 100%)',
                boxShadow: '0 15px 35px -5px rgba(91, 33, 182, 0.5)',
                transform: 'translateY(-1px)'
              }
            }}
          >
            {isLoading ? 'Autenticando...' : 'Entrar no sistema'}
          </Button>

          <Box sx={{ mt: 6, textAlign: 'center' }}>
            <Typography variant="body2" color="#64748B">
              Ainda não é cliente Faço a Conta?{' '}
              <Link
                component="button"
                type="button"
                onClick={() => navigate("/cadastro")}
                sx={{ 
                  color: '#0F172A', 
                  textDecoration: 'none',
                  fontWeight: 700,
                  transition: 'all 0.2s',
                  '&:hover': { color: '#5B21B6' } 
                }}
              >
                Crie sua conta agora
              </Link>
            </Typography>
          </Box>
        </Box>
      </Content>
    </Layout>
  );
};

export default Login;
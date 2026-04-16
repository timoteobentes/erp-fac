import { useState, useEffect } from 'react';
import { Layout } from 'antd';
import { Button, TextField, Box, Typography, Alert, Grid, InputAdornment, IconButton } from '@mui/material';
import { VisibilityOffOutlined, VisibilityOutlined } from "@mui/icons-material";
import fac_logo_branco from '../../assets/FAC_logo_branco.svg';
import fac_logo_roxo from '../../assets/FAC_logo_roxo.svg';
import { useForm, Controller } from "react-hook-form";
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useSearchParams } from "react-router";
import { toast } from 'react-toastify';
import { useRedefinirSenha } from '../../modules/RedefinirSenha/hooks/useRedefinirSenha';

// Schema de validação
const criarNovaSenhaSchema = z.object({
  novaSenha: z
    .string()
    .min(6, "A senha deve ter no mínimo 6 caracteres")
    .regex(/[A-Z]/, "A senha deve conter pelo menos uma letra maiúscula")
    .regex(/[0-9]/, "A senha deve conter pelo menos um número"),
  confirmarSenha: z.string()
}).refine((data) => data.novaSenha === data.confirmarSenha, {
  message: "As senhas não coincidem",
  path: ["confirmarSenha"]
});

type CriarNovaSenhaFormData = z.infer<typeof criarNovaSenhaSchema>;

const { Sider, Content } = Layout;

// Estilo Premium para os Inputs
const premiumInputStyles = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
    backgroundColor: '#F8FAFC',
    transition: 'all 0.2s ease-in-out',
    '& fieldset': { borderColor: 'transparent' },
    '&:hover fieldset': { borderColor: '#E2E8F0' },
    '&.Mui-focused': {
      backgroundColor: '#FFFFFF',
      boxShadow: '0 0 0 4px rgba(91, 33, 182, 0.1)',
    },
    '&.Mui-focused fieldset': { borderColor: '#5B21B6', borderWidth: '1px' },
  }
};

const RedefinirSenha = () => {
  const navigate = useNavigate();
  const { handleRedefinirSenha } = useRedefinirSenha();
  const [searchParams] = useSearchParams();
  
  const [loading, setLoading] = useState(false);
  const [tokenValido, setTokenValido] = useState<boolean | null>(null);
  const [email, setEmail] = useState<string>('');
  const [token, setToken] = useState<string>('');
  
  // Toggles de visualização de senha
  const [showNovaSenha, setShowNovaSenha] = useState(false);
  const [showConfirmarSenha, setShowConfirmarSenha] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm<CriarNovaSenhaFormData>({
    resolver: zodResolver(criarNovaSenhaSchema),
    defaultValues: { novaSenha: "", confirmarSenha: "" }
  });

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    const emailParam = searchParams.get('email');

    if (!tokenParam || !emailParam) {
      setTokenValido(false);
      return;
    }

    setToken(tokenParam);
    setEmail(decodeURIComponent(emailParam));
    setTokenValido(true);
  }, [searchParams]);

  const onSubmit = async (data: CriarNovaSenhaFormData) => {
    if (!token || !email || tokenValido === false) {
      toast.error('Token inválido ou expirado');
      return;
    }
    setLoading(true);
    await handleRedefinirSenha({ token, email, newPassword: data.novaSenha });
    setLoading(false);
  };

  return (
    <Layout style={{ height: '100dvh', backgroundColor: '#FFFFFF' }}>
      
      {/* SIDER - O Lado Imersivo */}
      <Sider 
        width="55%" 
        breakpoint="lg"
        collapsedWidth="0"
        trigger={null}
        style={{
          background: 'linear-gradient(135deg, #1A013A 0%, #3C0473 100%)',
          display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden', color: '#fff'
        }}
      >
        <Box sx={{
          position: 'absolute', top: '-10%', right: '-10%', width: '400px', height: '400px',
          background: 'linear-gradient(135deg, #A78BFA 0%, #5B21B6 100%)',
          borderRadius: '50%', filter: 'blur(100px)', opacity: 0.4, pointerEvents: 'none',
        }} />
        <Box sx={{
          position: 'absolute', bottom: '10%', left: '-15%', width: '300px', height: '300px',
          background: 'linear-gradient(135deg, #6B21A8 0%, #3C0473 100%)',
          borderRadius: '50%', filter: 'blur(80px)', opacity: 0.6, pointerEvents: 'none'
        }} />
        <Box sx={{ position: 'absolute', bottom: 0, left: 0, width: '100%', lineHeight: 0, pointerEvents: 'none' }}>
          <svg viewBox="0 0 1440 320" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', display: 'block' }}>
            <path fill="rgba(255, 255, 255, 0.03)" d="M0,160L48,144C96,128,192,96,288,106.7C384,117,480,171,576,165.3C672,160,768,96,864,74.7C960,53,1056,75,1152,90.7C1248,107,1344,117,1392,122.7L1440,128L1440,320L1392,320Z"></path>
            <path fill="rgba(255, 255, 255, 0.05)" d="M0,64L48,85.3C96,107,192,150,288,149.3C384,149,480,107,576,101.3C672,96,768,128,864,154.7C960,181,1056,203,1152,192C1248,181,1344,139,1392,117.3L1440,96L1440,320L1392,320Z"></path>
          </svg>
        </Box>

        <Box sx={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', height: '100%', p: { xs: 4, xl: 8 } }}>
          <Box sx={{ flexShrink: 0 }}>
            <img src={fac_logo_branco} alt="Faço a Conta" style={{ width: 200 }} />
          </Box>
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', maxWidth: 550, mb: '5vh' }}>
            <Typography variant="h2" fontWeight={800} sx={{ mb: 3, letterSpacing: '-0.03em', lineHeight: 1.1, fontSize: { xs: '2.5rem', md: '3.5rem', xl: '4rem' } }}>
              Acesso seguro.
            </Typography>
            <Typography variant="body1" sx={{ color: '#E2E8F0', fontSize: { xs: '1.1rem', md: '1.25rem' }, lineHeight: 1.6, fontWeight: 300 }}>
              Crie uma nova senha forte para proteger os dados da sua empresa e continuar gerenciando seus negócios.
            </Typography>
          </Box>
        </Box>
      </Sider>

      {/* CONTENT */}
      <Content style={{ backgroundColor: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100dvh', overflowY: 'auto' }}>
        <Box sx={{ width: '100%', maxWidth: 500, p: { xs: 4, md: 6 }, my: 'auto' }}>
          
          <Box sx={{ display: { xs: 'flex', lg: 'none' }, mb: 4, justifyContent: 'center' }}>
            <img src={fac_logo_roxo} alt="Faço a Conta" style={{ width: 160 }} />
          </Box>

          {/* RENDERIZAÇÃO CONDICIONAL: TOKEN INVÁLIDO */}
          {tokenValido === false ? (
            <Box>
              <Typography variant="h4" fontWeight={700} color="#0F172A" sx={{ mb: 1, letterSpacing: '-0.02em' }}>
                Link expirado
              </Typography>
              <Typography variant="body2" color="#64748B" sx={{ mb: 4 }}>
                O link de redefinição não é mais válido.
              </Typography>

              <Alert 
                severity="error" 
                sx={{ 
                  mb: 4, borderRadius: '12px', backgroundColor: 'rgba(239, 68, 68, 0.05)', color: '#991B1B', border: '1px solid rgba(239, 68, 68, 0.2)' 
                }}
              >
                <Typography variant="body2">
                  Por motivos de segurança, os links de recuperação de senha expiram após 15 minutos ou após serem utilizados.
                </Typography>
              </Alert>

              <Button
                fullWidth
                onClick={() => navigate('/solicitar-nova-senha')}
                sx={{
                  background: 'linear-gradient(90deg, #3C0473 0%, #5B21B6 100%)', color: '#fff', py: 1.8, fontSize: '1.05rem', fontWeight: 600, borderRadius: '12px', textTransform: 'none', boxShadow: '0 10px 25px -5px rgba(91, 33, 182, 0.4)', transition: 'all 0.2s',
                  '&:hover': { background: 'linear-gradient(90deg, #28024D 0%, #4C1D95 100%)', transform: 'translateY(-1px)' }
                }}
              >
                Solicitar novo link
              </Button>
            </Box>
          ) : (
            
            /* RENDERIZAÇÃO CONDICIONAL: FORMULÁRIO COM TOKEN VÁLIDO */
            <Box component="form" onSubmit={handleSubmit(onSubmit)}>
              <Typography variant="h4" fontWeight={700} color="#0F172A" sx={{ mb: 1, letterSpacing: '-0.02em' }}>
                Criar nova senha
              </Typography>
              <Typography variant="body2" color="#64748B" sx={{ mb: 4 }}>
                Redefinindo o acesso para: <strong style={{ color: '#0F172A' }}>{email}</strong>
              </Typography>

              <Alert 
                severity="info" 
                sx={{ mb: 4, backgroundColor: '#F8FAFC', color: '#475569', borderRadius: '12px', border: '1px solid #E2E8F0', '& .MuiAlert-icon': { color: '#5B21B6' } }}
              >
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>Sua senha precisa ter:</Typography>
                <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.875rem' }}>
                  <li>Pelo menos 6 caracteres</li>
                  <li>Uma letra maiúscula</li>
                  <li>Um número</li>
                </ul>
              </Alert>

              <Grid container spacing={2}>
                <Grid>
                  <Controller
                    name="novaSenha"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Nova senha"
                        type={showNovaSenha ? "text" : "password"}
                        variant="outlined"
                        disabled={loading}
                        error={!!errors.novaSenha}
                        helperText={errors.novaSenha?.message}
                        sx={premiumInputStyles}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton onClick={() => setShowNovaSenha(!showNovaSenha)} edge="end" sx={{ color: '#94A3B8' }}>
                                {showNovaSenha ? <VisibilityOutlined /> : <VisibilityOffOutlined />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                    )}
                  />
                </Grid>

                <Grid>
                  <Controller
                    name="confirmarSenha"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Confirmar senha"
                        type={showConfirmarSenha ? "text" : "password"}
                        variant="outlined"
                        disabled={loading}
                        error={!!errors.confirmarSenha}
                        helperText={errors.confirmarSenha?.message}
                        sx={premiumInputStyles}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton onClick={() => setShowConfirmarSenha(!showConfirmarSenha)} edge="end" sx={{ color: '#94A3B8' }}>
                                {showConfirmarSenha ? <VisibilityOutlined /> : <VisibilityOffOutlined />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                    )}
                  />
                </Grid>
              </Grid>

              <Box sx={{ mt: 5, display: 'flex', gap: 2 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  disabled={loading}
                  onClick={() => navigate("/login")}
                  sx={{
                    py: 1.5, color: '#0F172A', borderColor: '#E2E8F0', borderRadius: '12px', textTransform: 'none', fontWeight: 600,
                    '&:hover': { borderColor: '#5B21B6', backgroundColor: '#F8FAFC' }
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  fullWidth
                  type="submit"
                  disabled={loading}
                  sx={{
                    background: 'linear-gradient(90deg, #3C0473 0%, #5B21B6 100%)', color: '#fff', py: 1.8, fontSize: '1.05rem', fontWeight: 600, borderRadius: '12px', textTransform: 'none', boxShadow: '0 10px 25px -5px rgba(91, 33, 182, 0.4)', transition: 'all 0.2s',
                    '&:hover': { background: 'linear-gradient(90deg, #28024D 0%, #4C1D95 100%)', transform: 'translateY(-1px)' }
                  }}
                >
                  {loading ? 'Salvando...' : 'Redefinir senha'}
                </Button>
              </Box>
            </Box>
          )}

        </Box>
      </Content>
    </Layout>
  );
};

export default RedefinirSenha;
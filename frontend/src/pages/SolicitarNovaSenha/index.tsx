import { useState } from 'react';
import { Layout } from 'antd';
import { Button, TextField, Box, Typography, Alert, Grid } from '@mui/material';
import fac_logo_branco from '../../assets/FAC_logo_branco.svg';
import fac_logo_roxo from '../../assets/FAC_logo_roxo.svg';
import { useForm, Controller } from "react-hook-form";
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from "react-router";
import { useSolicitarNovaSenha } from '../../modules/SolicitarNovaSenha/hooks/useSolicitarNovaSenha';

const solicitarNovaSenhaSchema = z.object({
  email: z.string().min(1, "E-mail é obrigatório").email("Digite um e-mail válido")
});

type SolicitarNovaSenhaFormData = z.infer<typeof solicitarNovaSenhaSchema>;

const { Sider, Content } = Layout;

// Estilo Premium para os Inputs (Padrão amadev)
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

const SolicitarNovaSenha = () => {
  const navigate = useNavigate();
  const { handleSolicitarNovaSenha } = useSolicitarNovaSenha();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm<SolicitarNovaSenhaFormData>({
    resolver: zodResolver(solicitarNovaSenhaSchema),
    defaultValues: { email: "" }
  });

  const onSubmit = async (data: SolicitarNovaSenhaFormData) => {
    setLoading(true);
    await handleSolicitarNovaSenha(data);
    setLoading(false);
    setSubmitted(true);
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
              Problemas para acessar?
            </Typography>
            <Typography variant="body1" sx={{ color: '#E2E8F0', fontSize: { xs: '1.1rem', md: '1.25rem' }, lineHeight: 1.6, fontWeight: 300 }}>
              Recupere sua senha e volte a controlar as vendas e a gestão fiscal do seu negócio rapidamente.
            </Typography>
          </Box>
        </Box>
      </Sider>

      {/* CONTENT */}
      <Content style={{ backgroundColor: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100dvh', overflowY: 'auto' }}>
        <Box 
          sx={{ width: '100%', maxWidth: 500, p: { xs: 4, md: 6 }, my: 'auto' }}
        >
          <Box sx={{ display: { xs: 'flex', lg: 'none' }, mb: 4, justifyContent: 'center' }}>
            <img src={fac_logo_roxo} alt="Faço a Conta" style={{ width: 160 }} />
          </Box>

          {!submitted ? (
            <Box component="form" onSubmit={handleSubmit(onSubmit)}>
              <Typography variant="h4" fontWeight={700} color="#0F172A" sx={{ mb: 1, letterSpacing: '-0.02em' }}>
                Redefinir senha
              </Typography>
              <Typography variant="body2" color="#64748B" sx={{ mb: 4 }}>
                Insira o seu e-mail cadastrado e enviaremos instruções sobre como redefinir a sua senha.
              </Typography>

              <Grid container spacing={2}>
                <Grid className="w-full">
                  <Controller
                    name="email"
                    control={control}
                    render={({ field: { onChange, onBlur, value, ...rest } }) => (
                      <TextField
                        {...rest}
                        fullWidth
                        label="E-mail"
                        variant="outlined"
                        value={value}
                        onChange={(e) => onChange(e.target.value.toLowerCase().trim())} // Higiene
                        onBlur={onBlur}
                        disabled={loading}
                        error={!!errors.email}
                        helperText={errors.email?.message}
                        sx={premiumInputStyles}
                      />
                    )}
                  />
                </Grid>
              </Grid>

              <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  disabled={loading}
                  onClick={() => navigate("/login")}
                  sx={{
                    py: 1.5, color: '#0F172A', borderColor: '#E2E8F0', borderRadius: '12px',
                    textTransform: 'none', fontWeight: 600,
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
                    background: 'linear-gradient(90deg, #3C0473 0%, #5B21B6 100%)',
                    color: '#fff',
                    py: 1.8, fontSize: '1.05rem', fontWeight: 600, borderRadius: '12px', textTransform: 'none',
                    boxShadow: '0 10px 25px -5px rgba(91, 33, 182, 0.4)',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': { 
                      background: 'linear-gradient(90deg, #28024D 0%, #4C1D95 100%)',
                      transform: 'translateY(-1px)'
                    }
                  }}
                >
                  {loading ? 'Enviando...' : 'Enviar'}
                </Button>
              </Box>
            </Box>
          ) : (
            <Box>
              <Typography variant="h4" fontWeight={700} color="#0F172A" sx={{ mb: 1, letterSpacing: '-0.02em' }}>
                Verifique seu e-mail
              </Typography>
              <Typography variant="body2" color="#64748B" sx={{ mb: 4 }}>
                Enviamos um link de redefinição de senha para o e-mail informado.
              </Typography>

              <Alert 
                severity="info" 
                sx={{ 
                  mb: 3, 
                  backgroundColor: '#F8FAFC', 
                  color: '#475569', 
                  borderRadius: '12px',
                  border: '1px solid #E2E8F0',
                  '& .MuiAlert-icon': { color: '#5B21B6' }
                }}
              >
                <Typography variant="body2">
                  Lembre-se: O link é válido por <strong>15 minutos</strong>. Se o e-mail estiver correto e constar na base, a mensagem chegará em breve.
                </Typography>
              </Alert>

              <Box sx={{ mb: 4, pl: 2 }}>
                <Typography variant="body2" color="#475569" sx={{ fontWeight: 600, mb: 1 }}>
                  Não recebeu o e-mail?
                </Typography>
                <ul style={{ color: '#64748B', margin: 0, paddingLeft: '20px', fontSize: '0.875rem' }}>
                  <li style={{ marginBottom: '8px' }}>Verifique sua caixa de spam ou lixo eletrônico.</li>
                  <li style={{ marginBottom: '8px' }}>Certifique-se de que o e-mail digitado está correto.</li>
                  <li>Aguarde alguns minutos, pois o envio pode atrasar.</li>
                </ul>
              </Box>

              <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => {
                    setLoading(false);
                    setSubmitted(false);
                  }}
                  sx={{
                    py: 1.5, color: '#0F172A', borderColor: '#E2E8F0', borderRadius: '12px',
                    textTransform: 'none', fontWeight: 600,
                    '&:hover': { borderColor: '#5B21B6', backgroundColor: '#F8FAFC' }
                  }}
                >
                  Tentar novamente
                </Button>
                <Button
                  fullWidth
                  onClick={() => navigate('/login')}
                  sx={{
                    background: 'linear-gradient(90deg, #3C0473 0%, #5B21B6 100%)',
                    color: '#fff',
                    py: 1.8, fontSize: '1.05rem', fontWeight: 600, borderRadius: '12px', textTransform: 'none',
                    boxShadow: '0 10px 25px -5px rgba(91, 33, 182, 0.4)',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': { 
                      background: 'linear-gradient(90deg, #28024D 0%, #4C1D95 100%)',
                      transform: 'translateY(-1px)'
                    }
                  }}
                >
                  Voltar ao login
                </Button>
              </Box>
            </Box>
          )}
        </Box>
      </Content>
    </Layout>
  );
};

export default SolicitarNovaSenha;
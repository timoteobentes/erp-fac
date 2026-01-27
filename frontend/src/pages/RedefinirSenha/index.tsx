import { Layout } from 'antd';
import { Button, TextField, Box, Typography, Container, Alert } from '@mui/material';
import fac_logo_branco from '../../assets/FAC_logo_branco.svg';
import { useForm, Controller } from "react-hook-form";
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useSearchParams } from "react-router";
import { toast } from 'react-toastify';
import { useEffect, useState } from 'react';
import { useRedefinirSenha } from '../../modules/RedefinirSenha/hooks/useRedefinirSenha';

// Schema de validação para nova senha
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

const RedefinirSenha = () => {
  const navigate = useNavigate();
  const { handleRedefinirSenha } = useRedefinirSenha();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [tokenValido, setTokenValido] = useState<boolean | null>(null);
  const [email, setEmail] = useState<string>('');
  const [token, setToken] = useState<string>('');

  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm<CriarNovaSenhaFormData>({
    resolver: zodResolver(criarNovaSenhaSchema),
    defaultValues: {
      novaSenha: "",
      confirmarSenha: ""
    }
  });

  // Verificar token ao carregar a página
  useEffect(() => {
    const tokenParam = searchParams.get('token');
    const emailParam = searchParams.get('email');

    if (!tokenParam || !emailParam) {
      setTokenValido(false);
      toast.error('Link inválido ou expirado');
      return;
    }

    setToken(tokenParam);
    setEmail(decodeURIComponent(emailParam));

    // Opcional: Verificar validade do token com API
    // verificarToken(tokenParam, decodeURIComponent(emailParam));
  }, [searchParams]);

  // const verificarToken = async (token: string, email: string) => {
  //   try {
  //     // Esta é uma verificação básica - na prática, você pode querer
  //     // fazer uma chamada à API para verificar se o token ainda é válido
  //     // antes de permitir a alteração
  //     setTokenValido(true);
  //   } catch (error) {
  //     console.error('Erro ao verificar token:', error);
  //     setTokenValido(false);
  //     toast.error('Link expirado ou inválido');
  //   }
  // };

  const onSubmit = async (data: CriarNovaSenhaFormData) => {
    if (!token || !email || tokenValido === false) {
      toast.error('Token inválido ou expirado');
      return;
    }

    setLoading(true);
    handleRedefinirSenha({ token, email, newPassword: data.novaSenha });
  };

  // Se token não for válido, mostrar mensagem
  if (tokenValido === false) {
    return (
      <Layout className='min-h-screen'>
        <Content className='flex-1 hidden lg:flex flex-col items-center justify-between py-16 px-8 bg-gradient-to-t from-[#1a17e2] to-[#6B00A1] relative'>
          {/* ... mesmo conteúdo do lado esquerdo ... */}
          <Typography
            variant='h1'
            className='text-center text-white w-full leading-tight'
            sx={{
              fontSize: { xs: '1rem', sm: '1.5rem', md: '2.5rem' },
              fontWeight: 200
            }}
          >
            Comece a economizar já no primeiro mês de adesão.
          </Typography>

          <Box className='absolute inset-0 overflow-hidden pointer-events-none'>
            <Box className='absolute top-20 left-10 w-32 h-32 rounded-full border-4 border-white/20' />
            <Box className='absolute top-32 left-40 w-20 h-20 rounded-full border-2 border-white/15' />
            <Box className='absolute bottom-40 left-20 w-16 h-16 rounded-full border-2 border-white/15' />
            <Box className='absolute top-40 right-20 w-24 h-24 rounded-full border-3 border-white/20' />
            <Box className='absolute bottom-60 right-40 w-12 h-12 rounded-full border-2 border-white/15' />
          </Box>

          <Box className='flex justify-center z-10'>
            <img 
              src={fac_logo_branco} 
              alt='FAC Logo' 
              className='w-64 h-auto max-w-full'
            />
          </Box>
        </Content>

        <Sider 
          width='35%'
          style={{ background: '#FFFFFF' }} 
          className='min-h-screen flex items-center justify-center'
          breakpoint='lg'
          collapsedWidth='100%'
          data-aos="fade-left"
        >
          <Container maxWidth='lg' className='w-full px-8'>
            <Box className='flex flex-col items-center justify-center space-y-8 h-screen'>
              <Alert 
                severity="error" 
                className='w-full max-w-md'
                sx={{ mb: 3 }}
              >
                <Typography variant="body1" fontWeight="bold">
                  Link expirado ou inválido
                </Typography>
                <Typography variant="body2">
                  O link para redefinição de senha expirou ou é inválido.
                  Solicite um novo link.
                </Typography>
              </Alert>

              <Button
                variant='contained'
                size='large'
                onClick={() => navigate('/solicitar-nova-senha')}
                sx={{
                  backgroundColor: '#3C0473',
                  '&:hover': {
                    backgroundColor: '#2a0255'
                  }
                }}
              >
                Solicitar novo link
              </Button>
            </Box>
          </Container>
        </Sider>
      </Layout>
    );
  }

  return (
    <>
      <Layout className='min-h-screen'>
        <Content className='flex-1 hidden lg:flex flex-col items-center justify-between py-16 px-8 bg-gradient-to-t from-[#1a17e2] to-[#6B00A1] relative'>
          <Typography
            variant='h1'
            className='text-center text-white w-full leading-tight'
            sx={{
              fontSize: { xs: '1rem', sm: '1.5rem', md: '2.5rem' },
              fontWeight: 200
            }}
          >
            Comece a economizar já no primeiro mês de adesão.
          </Typography>

          <Box className='absolute inset-0 overflow-hidden pointer-events-none'>
            <Box className='absolute top-20 left-10 w-32 h-32 rounded-full border-4 border-white/20' />
            <Box className='absolute top-32 left-40 w-20 h-20 rounded-full border-2 border-white/15' />
            <Box className='absolute bottom-40 left-20 w-16 h-16 rounded-full border-2 border-white/15' />
            <Box className='absolute top-40 right-20 w-24 h-24 rounded-full border-3 border-white/20' />
            <Box className='absolute bottom-60 right-40 w-12 h-12 rounded-full border-2 border-white/15' />
          </Box>

          <Box className='flex justify-center z-10'>
            <img 
              src={fac_logo_branco} 
              alt='FAC Logo' 
              className='w-64 h-auto max-w-full'
            />
          </Box>
        </Content>

        <Sider 
          width='35%'
          style={{ background: '#FFFFFF' }} 
          className='min-h-screen flex items-center justify-center'
          breakpoint='lg'
          collapsedWidth='100%'
          data-aos="fade-left"
        >
          <Container maxWidth='lg' className='w-full px-8'>
            <Box className='flex flex-col items-center justify-center space-y-8 h-screen'>
              <Typography
                variant='h4'
                className='text-center text-[#3C0473]'
                sx={{
                  fontWeight: 400,
                  marginBottom: '1rem'
                }}
              >
                Criar nova senha
              </Typography>

              {email && (
                <Typography
                  variant='body2'
                  className='text-center text-gray-600 mb-4'
                >
                  Redefinindo senha para: <strong>{email}</strong>
                </Typography>
              )}

              <Alert 
                severity="info" 
                className='w-full max-w-md'
                sx={{ mb: 3 }}
              >
                <Typography variant="body2">
                  <strong>Atenção:</strong> Crie uma senha com pelo menos:
                  <ul style={{ marginLeft: '1rem', marginTop: '0.5rem' }}>
                    <li>6 caracteres</li>
                    <li>1 letra maiúscula</li>
                    <li>1 número</li>
                  </ul>
                </Typography>
              </Alert>

              <Box
                component='form' 
                className='w-full space-y-6'
                sx={{ maxWidth: '400px' }}
                onSubmit={handleSubmit(onSubmit)}
              >
                <Controller
                  name="novaSenha"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      fullWidth
                      label='Nova senha'
                      type='password'
                      variant='outlined'
                      size='medium'
                      disabled={loading}
                      sx={{ marginBottom: 2 }}
                      error={!!errors.novaSenha}
                      helperText={errors.novaSenha?.message}
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />

                <Controller
                  name="confirmarSenha"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      fullWidth
                      label='Confirmar senha'
                      type='password'
                      variant='outlined'
                      size='medium'
                      disabled={loading}
                      sx={{ marginBottom: 2 }}
                      error={!!errors.confirmarSenha}
                      helperText={errors.confirmarSenha?.message}
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />

                <div className="flex items-center justify-between mt-6">
                  <Button
                    fullWidth
                    variant='outlined'
                    size='medium'
                    type='button'
                    disabled={loading}
                    sx={{ marginRight: 2 }}
                    onClick={() => navigate("/login")}
                  >
                    Cancelar
                  </Button>
                  <Button
                    fullWidth
                    variant='contained'
                    size='medium'
                    type='submit'
                    disabled={loading}
                    sx={{
                      backgroundColor: '#3C0473',
                      '&:hover': {
                        backgroundColor: '#2a0255'
                      },
                      '&:disabled': {
                        backgroundColor: '#ccc'
                      }
                    }}
                  >
                    {loading ? 'Redefinindo...' : 'Redefinir senha'}
                  </Button>
                </div>
              </Box>
            </Box>
          </Container>
        </Sider>
      </Layout>
    </>
  );
};

export default RedefinirSenha;
import { useState } from "react";
import { Layout } from 'antd';
import { Button, TextField, Box, Typography, Container, Link, InputAdornment, IconButton } from '@mui/material';
import { Visibility, VisibilityOff } from "@mui/icons-material";
import fac_logo_branco from '../../assets/FAC_logo_branco.svg';
import fac_logo_roxo from '../../assets/FAC_logo_roxo.svg';
import { useForm, Controller } from "react-hook-form";
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from "react-router";
import { useLogin } from "../../modules/Login/hooks/useLogin";

const loginSchema = z.object({
  usuarioLogin: z
    .string()
    .min(1, "Nome de usuário ou e-mail é obrigatório"),
  senha: z
    .string()
    .min(1, "Senha é obrigatória")
    .min(6, "Senha deve ter pelo menos 6 caracteres")
});

type LoginFormData = z.infer<typeof loginSchema>;

const { Sider, Content } = Layout;

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading } = useLogin();
  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      usuarioLogin: "",
      senha: "",
    }
  });

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  const handleMouseUpPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  const onSubmit = async (data: LoginFormData) => {
    console.log("Data Login: ", data);
    // navigate("/inicio")
    await login(data)
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
          // collapsible
        >
          <Container maxWidth='sm' className='w-full px-8'>
            <Box className='flex flex-col items-center justify-center space-y-8 h-screen'>
              <Box className='mb-4'>
                <img 
                  src={fac_logo_roxo} 
                  alt='FAC Logo' 
                  className='w-64 h-auto'
                />
              </Box>

              <Typography
                variant='h4'
                className='text-center text-[#3C0473]'
                sx={{
                  fontWeight: 400,
                  marginBottom: '1rem'
                }}
              >
                Bem-vindo de volta!
              </Typography>

              <Box 
                component='form' 
                className='w-full space-y-6'
                sx={{ maxWidth: '400px' }}
                onSubmit={handleSubmit(onSubmit)}
              >
                <Controller
                  name="usuarioLogin"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      fullWidth
                      label='Nome de usuário ou e-mail'
                      variant='outlined'
                      size='medium'
                      sx={{
                        marginBottom: 4
                      }}
                      error={!!errors.usuarioLogin}
                      helperText={errors.usuarioLogin?.message}
                      {...field}
                    />
                  )}
                />

                <Controller
                  name="senha"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      fullWidth
                      label='Senha'
                      type={showPassword ? 'text' : 'password'}
                      variant='outlined'
                      size='medium'
                      error={!!errors.senha}
                      helperText={errors.senha?.message}
                      sx={{
                        marginBottom: 2
                      }}
                      slotProps={{
                        input: {
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                aria-label={
                                  showPassword ? 'hide the password' : 'display the password'
                                }
                                onClick={handleClickShowPassword}
                                onMouseDown={handleMouseDownPassword}
                                onMouseUp={handleMouseUpPassword}
                                edge="end"
                              >
                                {showPassword ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          )
                        }
                      }}
                      {...field}
                    />
                  )}
                />

                <Button
                  fullWidth
                  variant='contained'
                  size='medium'
                  type='submit'
                  loading={isLoading}
                  sx={{
                    marginTop: 6,
                    marginBottom: 2
                  }}
                >
                  Entrar
                </Button>
                <Link
                  underline='none'
                  variant="button"
                  onClick={() => {
                    navigate('/solicitar-nova-senha')
                  }}
                  sx={{
                    color: '#f00',
                    fontWeight: 400,
                    fontSize: '0.9rem',
                    '&:hover': {
                      color: '#2e2e2e'
                    }
                  }}
                >
                  Esqueci minha senha
                </Link>

                <Button
                  fullWidth
                  variant='outlined'
                  type='button'
                  onClick={() => navigate("/cadastro")}
                  sx={{
                    marginTop: 10,
                    borderColor: '#174FE2',
                    color: '#174FE2',
                    '&:hover': {
                      borderWidth: 1.5
                    }
                  }}
                >
                  Cadastrar Minha empresa
                </Button>
              </Box>
            </Box>
          </Container>
        </Sider>
      </Layout>
    </>
  );
};

export default Login;
import { useState } from 'react';
import { Layout } from 'antd';
import { Button, TextField, Box, Typography, Container, Alert } from '@mui/material';
import fac_logo_branco from '../../assets/FAC_logo_branco.svg';
import { useForm, Controller } from "react-hook-form";
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from "react-router";
import { useSolicitarNovaSenha } from '../../modules/SolicitarNovaSenha/hooks/useSolicitarNovaSenha';

const solicitarNovaSenhaSchema = z.object({
  email: z
    .string()
    .min(1, "E-mail é obrigatório")
    .email("Digite um e-mail válido")
});

type SolicitarNovaSenhaFormData = z.infer<typeof solicitarNovaSenhaSchema>;

const { Sider, Content } = Layout;

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
    defaultValues: {
      email: ""
    }
  });

  const onSubmit = async (data: SolicitarNovaSenhaFormData) => {
    setLoading(true);
    handleSolicitarNovaSenha(data);
    setSubmitted(true);
  };

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
                {submitted ? 'Verifique seu e-mail' : 'Solicitar nova senha'}
              </Typography>

              {submitted ? (
                <Box className="w-full max-w-md space-y-4">
                  <Alert severity="success" sx={{ mb: 3 }}>
                    <Typography variant="body1" fontWeight="bold">
                      Solicitação enviada com sucesso!
                    </Typography>
                    <Typography variant="body2">
                      Se o e-mail existir em nossa base, você receberá um link para redefinir sua senha.
                      <br /><br />
                      <strong>Importante:</strong> O link é válido por <strong>15 minutos</strong>.
                    </Typography>
                  </Alert>

                  <Typography variant="body2" className="text-gray-600">
                    Não recebeu o e-mail?
                    <ul className="ml-4 mt-2 space-y-1">
                      <li>• Verifique sua caixa de spam</li>
                      <li>• Certifique-se de que digitou o e-mail corretamente</li>
                      <li>• Aguarde alguns minutos</li>
                    </ul>
                  </Typography>

                  <div className="flex gap-2 mt-6">
                    <Button
                      fullWidth
                      variant='outlined'
                      onClick={() => {
                        setLoading(false);
                        setSubmitted(false);
                      }}
                    >
                      Solicitar novamente
                    </Button>
                    <Button
                      fullWidth
                      variant='contained'
                      onClick={() => navigate('/login')}
                      sx={{
                        backgroundColor: '#3C0473',
                        '&:hover': {
                          backgroundColor: '#2a0255'
                        }
                      }}
                    >
                      Voltar para login
                    </Button>
                  </div>
                </Box>
              ) : (
                <div>
                  <Typography
                    variant='body1'
                    className='text-center text-gray-600'
                  >
                    Digite seu e-mail para receber um link de redefinição de senha.
                  </Typography>

                  <Box
                    component='form' 
                    className='w-full space-y-6'
                    sx={{ maxWidth: '400px' }}
                    onSubmit={handleSubmit(onSubmit)}
                  >
                    <Controller
                      name="email"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          fullWidth
                          label='E-mail'
                          variant='outlined'
                          size='medium'
                          disabled={loading}
                          sx={{ marginBottom: 4 }}
                          error={!!errors.email}
                          helperText={errors.email?.message}
                          value={field.value}
                          onChange={field.onChange}
                        />
                      )}
                    />

                    <div className="flex items-center justify-between">
                      <Button
                        fullWidth
                        color='error'
                        variant='outlined'
                        size='medium'
                        type='button'
                        disabled={loading}
                        sx={{ marginTop: 6, marginRight: 2 }}
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
                          marginTop: 6,
                          backgroundColor: '#3C0473',
                          '&:hover': {
                            backgroundColor: '#2a0255'
                          }
                        }}
                      >
                        {loading ? 'Enviando...' : 'Enviar'}
                      </Button>
                    </div>
                  </Box>
                </div>
              )}
            </Box>
          </Container>
        </Sider>
      </Layout>
    </>
  );
};

export default SolicitarNovaSenha;
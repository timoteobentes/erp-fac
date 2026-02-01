import { useState, useEffect } from "react";
import { Layout } from 'antd';
import {
  Button,
  TextField,
  Box,
  Typography,
  Container,
  Link,
  InputAdornment,
  IconButton,
  FormGroup,
  FormControlLabel,
  Checkbox
} from '@mui/material';
import { ModalCustom } from "../../components/ui/Modal";
import { Visibility, VisibilityOff, Search } from "@mui/icons-material";
import fac_logo_branco from '../../assets/FAC_logo_branco.svg';
import { useForm, Controller } from "react-hook-form";
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { maskRegexCNPJ, maskRegexPhone } from "../../types/regex";
import { useNavigate } from "react-router";
import { useConsultaCnpj } from "../../modules/Cadastro/hooks/useConsultaCnpj";
import { useCadastro } from "../../modules/Cadastro/hooks/useCadastro";

const cadastroSchema = z.object({
  cnpj: z
    .string()
    .min(1, "CNPJ é obrigatório")
    .min(18, "Formato incorreto"),
  nome_empresa: z
    .string()
    .min(1, "Nome da empresa é obrigatório"),
  telefone: z
    .string()
    .min(1, "Telefone é obrigatório"),
  cidade: z
    .string()
    .min(1, "Cidade é obrigatório"),
  estado: z
    .string()
    .min(1, "Estado é obrigatório"),
  email: z
    .string()
    .min(1, "E-mail é obrigatório"),
  nome_usuario: z
    .string()
    .min(1, "Nome de usuário é obrigatório"),
  senha: z
    .string()
    .min(1, "Senha é obrigatório")
    .min(6, "Mínimo de 6 caracteres"),
  termos_aceitos: z
    .boolean()
    .check()
});

type CadastroFormData = z.infer<typeof cadastroSchema>;

const { Sider, Content } = Layout;

const Cadastro = () => {
  const navigate = useNavigate();
  const [openModal, setOpenModal] = useState(false);
  const [showsenha, setShowsenha] = useState(false);
  const { loading, getConsultaCNPJ, consultaCNPJ } = useConsultaCnpj();
  const { cadastro, isLoading } = useCadastro();
  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    watch,
    formState: { errors }
  } = useForm<CadastroFormData>({
    resolver: zodResolver(cadastroSchema),
    defaultValues: {
      cnpj: "",
      nome_empresa: "",
      telefone: "",
      cidade: "",
      estado: "",
      email: "",
      nome_usuario: "",
      senha: "",
      termos_aceitos: false
    }
  });

  const allFields = watch();

  const isFormValid = 
        allFields.termos_aceitos && 
        allFields.cnpj && 
        allFields.nome_empresa && 
        allFields.telefone && 
        allFields.cidade && 
        allFields.estado && 
        allFields.email && 
        allFields.nome_usuario && 
        allFields.senha;

  const handleClickShowsenha = () => setShowsenha((show) => !show);

  const handleMouseDownsenha = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  const handleMouseUpsenha = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  const onSubmit = async (data: CadastroFormData) => {
    console.log("Data Login: ", data);
    await cadastro(data)
  }

  useEffect(() => {
    if(consultaCNPJ) {
      setValue("nome_empresa", consultaCNPJ.alias ? consultaCNPJ.alias.toUpperCase() : consultaCNPJ.company.name.toUpperCase())
      setValue("cidade", consultaCNPJ.address.city.toUpperCase() || "")
      setValue("estado", consultaCNPJ.address.state.toUpperCase() || "")
    }
  }, [consultaCNPJ])

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
          <Container maxWidth='sm' className='w-full px-8'>
            <Box className='flex flex-col items-center justify-center space-y-8 h-screen'>
              <Typography
                variant='h4'
                className='text-center text-[#3C0473]'
                sx={{
                  fontWeight: 600,
                  marginBottom: '1rem'
                }}
              >
                Insira os Dados da sua empresa.
              </Typography>

              <Box 
                component='form' 
                className='w-full space-y-6'
                sx={{ maxWidth: '400px' }}
                onSubmit={handleSubmit(onSubmit)}
              >
                <div className="flex items-center justify-between mb-4">
                  <Controller
                    name="cnpj"
                    control={control}
                    render={({ field }) => (
                      <>
                        <TextField
                          fullWidth
                          label='CNPJ'
                          variant='outlined'
                          size='medium'
                          sx={{
                            marginRight: 2
                          }}
                          error={!!errors.cnpj}
                          helperText={errors.cnpj?.message}
                          value={field.value}
                          onChange={(e) => {
                            setValue("cnpj", e.target.value);
                            const masked = maskRegexCNPJ(e.target.value);
                            field.onChange(masked);
                            if(e.target.value.length < 17) return;
                          }}
                        />
                        <Button
                          variant="contained"
                          size="medium"
                          sx={{
                            width: 10,
                            height: 47,
                            // marginTop: -4
                          }}
                          onClick={() => {
                            getConsultaCNPJ(getValues().cnpj)
                          }}
                        >
                          <Search />
                        </Button>
                      </>
                    )}
                  />
                </div>

                <div className="flex items-center justify-between mb-4">
                  <Controller
                    name="nome_empresa"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        fullWidth
                        label='Nome da Empresa'
                        variant='outlined'
                        size='medium'
                        sx={{
                          marginRight: 2
                        }}
                        error={!!errors.nome_empresa}
                        helperText={errors.nome_empresa?.message}
                        disabled={loading ? true : false}
                        value={field.value}
                        onChange={(e) => {
                          setValue("nome_empresa", e.target.value);
                        }}
                      />
                    )}
                  />

                  <Controller
                    name="telefone"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        fullWidth
                        label='Telefone'
                        variant='outlined'
                        size='medium'
                        error={!!errors.telefone}
                        helperText={errors.telefone?.message}
                        disabled={loading ? true : false}
                        value={field.value}
                        onChange={(e) => {
                          setValue("telefone", e.target.value);
                          const masked = maskRegexPhone(e.target.value);
                          field.onChange(masked);
                        }}
                      />
                    )}
                  />
                </div>

                <div className="flex items-center justify-between mb-4">
                  <Controller
                    name="cidade"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        fullWidth
                        label='Cidade'
                        variant='outlined'
                        size='medium'
                        sx={{
                          marginRight: 2
                        }}
                        error={!!errors.cidade}
                        helperText={errors.cidade?.message}
                        disabled={loading ? true : false}
                        value={field.value}
                        onChange={(e) => {
                          setValue("cidade", e.target.value);
                        }}
                      />
                    )}
                  />

                  <Controller
                    name="estado"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        fullWidth
                        label='Estado'
                        variant='outlined'
                        size='medium'
                        error={!!errors.estado}
                        helperText={errors.estado?.message}
                        disabled={loading ? true : false}
                        value={field.value}
                        onChange={(e) => {
                          setValue("estado", e.target.value);
                        }}
                      />
                    )}
                  />
                </div>

                <Controller
                  name="email"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      fullWidth
                      label='E-mail'
                      variant='outlined'
                      size='medium'
                      sx={{
                        marginBottom: 4
                      }}
                      error={!!errors.email}
                      helperText={errors.email?.message}
                      value={field.value}
                      onChange={(e) => {
                        setValue("email", e.target.value);
                      }}
                    />
                  )}
                />

                <Controller
                  name="nome_usuario"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      fullWidth
                      label='Nome de Usuário'
                      variant='outlined'
                      size='medium'
                      sx={{
                        marginBottom: 4
                      }}
                      error={!!errors.nome_usuario}
                      helperText={errors.nome_usuario?.message}
                      value={field.value}
                      onChange={(e) => {
                        setValue("nome_usuario", e.target.value);
                      }}
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
                      type={showsenha ? 'text' : 'password'}
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
                                  showsenha ? 'hide the senha' : 'display the senha'
                                }
                                onClick={handleClickShowsenha}
                                onMouseDown={handleMouseDownsenha}
                                onMouseUp={handleMouseUpsenha}
                                edge="end"
                              >
                                {showsenha ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          )
                        }
                      }}
                      value={field.value}
                      onChange={(e) => {
                        setValue("senha", e.target.value);
                      }}
                    />
                  )}
                />

                <Controller
                  name="termos_aceitos"
                  control={control}
                  render={({ field }) => (
                    <FormGroup>
                      <FormControlLabel 
                        control={
                          <Checkbox
                            value={field.value}
                            onChange={(e) => setValue("termos_aceitos", e.target.checked)}
                          />
                        }
                        label={
                          <span>
                            Li e concordo com os{' '}
                            <Link
                              component="button" 
                              type="button"
                              onClick={() => setOpenModal(true)}
                              sx={{
                                textDecoration: 'none',
                                '&:hover': {
                                  color: '#2e2e2e'
                                }
                              }}
                              className="hover:text-gray-500"
                            >
                              Termos de Uso e Políticas de privacidade
                            </Link>
                          </span>
                        } 
                      />
                    </FormGroup>
                  )}
                />

                <Button
                  fullWidth
                  variant='contained'
                  size='medium'
                  type='submit'
                  disabled={!isFormValid}
                  loading={isLoading}
                  sx={{
                    marginTop: 6,
                    marginBottom: 2
                  }}
                >
                  Cadastrar
                </Button>

                <Button
                  fullWidth
                  variant='outlined'
                  type='button'
                  sx={{
                    marginTop: 10,
                    borderColor: '#174FE2',
                    color: '#174FE2',
                    '&:hover': {
                      borderWidth: 1.5
                    }
                  }}
                  onClick={() => navigate("/login")}
                >
                  Já sou cadastrado
                </Button>
              </Box>
            </Box>
          </Container>
        </Sider>
        <ModalCustom
          open={openModal}
          onClose={() => setOpenModal(false)}
          title="Política de Privacidade e Termos Serviços"
          content={
            <span>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
              Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
              Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.
            </span>
          }
        />
      </Layout>
    </>
  )
}

export default Cadastro
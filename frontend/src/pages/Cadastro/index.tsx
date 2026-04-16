import { useState, useEffect } from "react";
import { Layout } from 'antd';
import {
  Button, TextField, Box, Typography, Link, InputAdornment,
  IconButton, FormGroup, FormControlLabel, Checkbox, Grid, CircularProgress
} from '@mui/material';
import { ModalCustom } from "../../components/ui/Modal";
import { VisibilityOffOutlined, VisibilityOutlined, Search } from "@mui/icons-material";
import fac_logo_branco from '../../assets/FAC_logo_branco.svg';
import fac_logo_roxo from '../../assets/FAC_logo_roxo.svg';
import { useForm, Controller } from "react-hook-form";
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { maskRegexCNPJ, maskRegexPhone } from "../../types/regex";
import { useNavigate } from "react-router";
import { useConsultaCnpj } from "../../modules/Cadastro/hooks/useConsultaCnpj";
import { useCadastro } from "../../modules/Cadastro/hooks/useCadastro";

// Nossos formatadores de Higiene de Banco de Dados
const toTitleCase = (str: string) => {
  if (!str) return '';
  const preposicoes = ['da', 'de', 'do', 'das', 'dos', 'e'];
  return str.toLowerCase().trim().replace(/\s+/g, ' ').split(' ').map((palavra, index) => {
    if (index !== 0 && preposicoes.includes(palavra)) return palavra;
    return palavra.charAt(0).toUpperCase() + palavra.slice(1);
  }).join(' ');
};

const cadastroSchema = z.object({
  cnpj: z.string().min(1, "CNPJ é obrigatório").min(18, "Formato incorreto"),
  nome_empresa: z.string().min(1, "Nome da empresa é obrigatório"),
  telefone: z.string().min(1, "Telefone é obrigatório"),
  cidade: z.string().min(1, "Cidade é obrigatória"),
  estado: z.string().min(1, "Estado é obrigatório").max(2, "Apenas UF"),
  email: z.string().min(1, "E-mail é obrigatório").email("E-mail inválido"),
  senha: z.string().min(6, "Mínimo de 6 caracteres"),
  termos: z.boolean().refine(val => val === true, "Aceite os termos")
});

type CadastroFormData = z.infer<typeof cadastroSchema>;

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

const Cadastro = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [openModal, setOpenModal] = useState(false);

  // Hooks atualizados com as nomenclaturas exatas
  const { getConsultaCNPJ, consultaCNPJ, loading: isLoadingCnpj } = useConsultaCnpj();
  const { cadastro, isLoading } = useCadastro();

  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors, isValid }
  } = useForm<CadastroFormData>({
    resolver: zodResolver(cadastroSchema),
    mode: "onBlur", 
    defaultValues: {
      cnpj: "", nome_empresa: "", telefone: "", cidade: "", estado: "", email: "", senha: "", termos: false
    }
  });

  const onSubmit = (data: CadastroFormData) => {
    const { termos, ...rest } = data;
    cadastro({
      ...rest,
      nome_usuario: data.email.split('@')[0], // Gera um nome de usuário baseado no e-mail
      termos_aceitos: termos
    });
  };

  // Função Manual para buscar o CNPJ (só acionada pelo clique no botão)
  const handleConsultaCnpj = async () => {
    const cnpjValue = getValues('cnpj');
    const cnpjLimpo = cnpjValue.replace(/\D/g, '');
    
    if (cnpjLimpo.length === 14) {
      await getConsultaCNPJ(cnpjLimpo);
      
      if (consultaCNPJ) {
        // Preenche o formulário e já higieniza os dados
        if (consultaCNPJ.company.name) {
          setValue('nome_empresa', toTitleCase(consultaCNPJ.company.name), { shouldValidate: true });
        }
        if (consultaCNPJ.address.city) {
          setValue('cidade', toTitleCase(consultaCNPJ.address.city), { shouldValidate: true });
        }
        if (consultaCNPJ.address.state) {
          setValue('estado', (consultaCNPJ.address.state).toUpperCase(), { shouldValidate: true });
        }
      }
    }
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
              O primeiro passo para a evolução.
            </Typography>
            <Typography variant="body1" sx={{ color: '#E2E8F0', fontSize: { xs: '1.1rem', md: '1.25rem' }, lineHeight: 1.6, fontWeight: 300 }}>
              Digite seu CNPJ e nós faremos o trabalho pesado. Crie sua conta em menos de 2 minutos e assuma o controle do seu negócio.
            </Typography>
          </Box>
        </Box>
      </Sider>

      {/* CONTENT */}
      <Content style={{ backgroundColor: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100dvh', overflowY: 'auto' }}>
        <Box 
          component="form" 
          onSubmit={handleSubmit(onSubmit)}
          sx={{ width: '100%', maxWidth: 500, p: { xs: 4, md: 6 }, my: 'auto' }}
        >
          <Box sx={{ display: { xs: 'flex', lg: 'none' }, mb: 4, justifyContent: 'center' }}>
            <img src={fac_logo_roxo} alt="Faço a Conta" style={{ width: 160 }} />
          </Box>

          <Typography variant="h4" fontWeight={700} color="#0F172A" sx={{ mb: 1, letterSpacing: '-0.02em' }}>
            Criar conta
          </Typography>
          <Typography variant="body2" color="#64748B" sx={{ mb: 4 }}>
            Preencha os dados abaixo ou busque pelo seu CNPJ para agilizar.
          </Typography>

          <Grid container spacing={2}>
            
            {/* CNPJ com Lupa de Busca Manual */}
            <Grid>
              <Controller
                name="cnpj"
                control={control}
                render={({ field: { onChange, onBlur, value, ...rest } }) => (
                  <TextField
                    {...rest}
                    fullWidth
                    label="CNPJ"
                    variant="outlined"
                    value={value}
                    onChange={(e) => onChange(maskRegexCNPJ(e.target.value))}
                    onBlur={onBlur} // Removida a busca automática!
                    error={!!errors.cnpj}
                    helperText={errors.cnpj?.message}
                    sx={premiumInputStyles}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          {/* Botão de Pesquisa Seguro e Elegante */}
                          <IconButton 
                            onClick={handleConsultaCnpj} 
                            disabled={isLoadingCnpj}
                            sx={{ color: '#5B21B6', '&:hover': { backgroundColor: 'rgba(91, 33, 182, 0.1)' } }}
                          >
                            {isLoadingCnpj ? <CircularProgress size={20} sx={{ color: '#3C0473' }} /> : <Search />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              />
            </Grid>

            {/* NOME DA EMPRESA */}
            <Grid className="w-full">
              <Controller
                name="nome_empresa"
                control={control}
                render={({ field: { onChange, onBlur, value, ...rest } }) => (
                  <TextField
                    {...rest}
                    fullWidth
                    label="Razão Social"
                    value={value}
                    onChange={onChange}
                    onBlur={(e) => {
                      onChange(toTitleCase(e.target.value)); 
                      onBlur();
                    }}
                    error={!!errors.nome_empresa}
                    helperText={errors.nome_empresa?.message}
                    sx={premiumInputStyles}
                  />
                )}
              />
            </Grid>
            
            <div className="w-full" />

            {/* E-MAIL E TELEFONE */}
            <Grid>
              <Controller
                name="email"
                control={control}
                render={({ field: { onChange, onBlur, value, ...rest } }) => (
                  <TextField
                    {...rest}
                    fullWidth
                    label="E-mail"
                    value={value}
                    onChange={(e) => onChange(e.target.value.toLowerCase().trim())} 
                    onBlur={onBlur}
                    error={!!errors.email}
                    helperText={errors.email?.message}
                    sx={premiumInputStyles}
                  />
                )}
              />
            </Grid>
            <Grid>
              <Controller
                name="telefone"
                control={control}
                render={({ field: { onChange, value, ...rest } }) => (
                  <TextField
                    {...rest}
                    fullWidth
                    label="WhatsApp / Telefone"
                    value={value}
                    onChange={(e) => onChange(maskRegexPhone(e.target.value))}
                    error={!!errors.telefone}
                    helperText={errors.telefone?.message}
                    sx={premiumInputStyles}
                  />
                )}
              />
            </Grid>

            {/* CIDADE E ESTADO */}
            <Grid>
              <Controller
                name="cidade"
                control={control}
                render={({ field: { onChange, onBlur, value, ...rest } }) => (
                  <TextField
                    {...rest}
                    fullWidth
                    label="Cidade"
                    value={value}
                    onChange={onChange}
                    onBlur={(e) => {
                      onChange(toTitleCase(e.target.value)); 
                      onBlur();
                    }}
                    error={!!errors.cidade}
                    helperText={errors.cidade?.message}
                    sx={premiumInputStyles}
                  />
                )}
              />
            </Grid>
            <Grid>
              <Controller
                name="estado"
                control={control}
                render={({ field: { onChange, value, ...rest } }) => (
                  <TextField
                    {...rest}
                    fullWidth
                    label="UF"
                    value={value}
                    onChange={(e) => onChange(e.target.value.toUpperCase().replace(/[^A-Z]/g, '').substring(0, 2))} 
                    error={!!errors.estado}
                    helperText={errors.estado?.message}
                    sx={premiumInputStyles}
                  />
                )}
              />
            </Grid>

            {/* SENHA */}
            <Grid>
              <Controller
                name="senha"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Crie uma Senha"
                    type={showPassword ? "text" : "password"}
                    error={!!errors.senha}
                    helperText={errors.senha?.message}
                    sx={premiumInputStyles}
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
            </Grid>

            {/* TERMOS DE USO */}
            <Grid>
              <FormGroup>
                <Controller
                  name="termos"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={
                        <Checkbox 
                          {...field} 
                          checked={field.value} 
                          sx={{ color: '#E2E8F0', '&.Mui-checked': { color: '#5B21B6' } }}
                        />
                      }
                      label={
                        <Typography variant="body2" color="#64748B">
                          Eu concordo com a{' '}
                          <Link component="button" type="button" onClick={() => setOpenModal(true)} sx={{ color: '#5B21B6', fontWeight: 600, textDecoration: 'none' }}>
                            Política de Privacidade e Termos
                          </Link>
                        </Typography>
                      }
                    />
                  )}
                />
                {errors.termos && <Typography variant="caption" color="error">{errors.termos.message}</Typography>}
              </FormGroup>
            </Grid>
          </Grid>

          {/* BOTÕES */}
          <Box sx={{ mt: 4 }}>
            <Button
              fullWidth
              type="submit"
              disabled={!isValid || isLoading}
              sx={{
                background: isValid ? 'linear-gradient(90deg, #3C0473 0%, #5B21B6 100%)' : '#E2E8F0',
                color: isValid ? '#fff' : '#94A3B8',
                py: 1.8, fontSize: '1.05rem', fontWeight: 600, borderRadius: '12px', textTransform: 'none',
                boxShadow: isValid ? '0 10px 25px -5px rgba(91, 33, 182, 0.4)' : 'none',
                transition: 'all 0.2s ease-in-out',
                '&:hover': { 
                  background: isValid ? 'linear-gradient(90deg, #28024D 0%, #4C1D95 100%)' : '#E2E8F0',
                  transform: isValid ? 'translateY(-1px)' : 'none'
                }
              }}
            >
              {isLoading ? 'Criando sua conta...' : 'Criar minha conta'}
            </Button>

            <Button
              fullWidth
              variant="outlined"
              onClick={() => navigate("/login")}
              sx={{
                mt: 2, py: 1.5, color: '#0F172A', borderColor: '#E2E8F0', borderRadius: '12px',
                textTransform: 'none', fontWeight: 600,
                '&:hover': { borderColor: '#5B21B6', backgroundColor: '#F8FAFC' }
              }}
            >
              Já possuo cadastro. Fazer login.
            </Button>
          </Box>
        </Box>
      </Content>

      <ModalCustom
        open={openModal}
        onClose={() => setOpenModal(false)}
        title="Política de Privacidade e Termos"
        content={
          <Typography variant="body2" color="#475569" sx={{ lineHeight: 1.6 }}>
            Ao utilizar o sistema Faço a Conta, você concorda com a coleta e processamento de dados necessários para a emissão de notas fiscais, controle financeiro e gestão de estoque. Garantimos o sigilo e a proteção de suas informações comerciais de acordo com a LGPD (Lei Geral de Proteção de Dados).
          </Typography>
        }
      />
    </Layout>
  );
};

export default Cadastro;
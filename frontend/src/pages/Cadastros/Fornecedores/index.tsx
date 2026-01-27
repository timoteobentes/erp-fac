/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import {
  Button,
  Card,
  CardContent,
  IconButton,
  InputLabel,
  FormControl,
  Menu,
  MenuItem,
  Select,
  TextField,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Alert,
  Snackbar
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material";
import type { MenuProps } from "@mui/material";
import { styled, alpha } from '@mui/material/styles';
import { ConfigProvider, DatePicker } from "antd";
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';
import {
  AddCircleOutline,
  InsertDriveFileOutlined,
  SmartDisplayOutlined,
  KeyboardArrowDown,
  Search,
  ZoomIn,
  Check,
  Close,
  Download,
  Refresh
} from "@mui/icons-material";
import Layout from "../../../template/Layout";
import { useNavigate } from "react-router";
import { useClientes } from "../../../modules/Cadastros/Clientes/hooks/useClientes";
import { TabelaClientes } from "../../../modules/Cadastros/Clientes/components/TabelaClientes";

const StyledMenu = styled((props: MenuProps) => (
  <Menu
    elevation={0}
    anchorOrigin={{
      vertical: 'bottom',
      horizontal: 'right',
    }}
    transformOrigin={{
      vertical: 'top',
      horizontal: 'right',
    }}
    {...props}
  />
))(({ theme }) => ({
  '& .MuiPaper-root': {
    borderRadius: 6,
    marginTop: theme.spacing(1),
    minWidth: 125,
    color: 'rgb(55, 65, 81)',
    boxShadow:
      'rgb(255, 255, 255) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px',
    '& .MuiMenu-list': {
      padding: '4px 0',
    },
    '& .MuiMenuItem-root': {
      '& .MuiSvgIcon-root': {
        fontSize: 18,
        color: theme.palette.text.secondary,
        marginRight: theme.spacing(1.5),
        ...theme.applyStyles('dark', {
          color: 'inherit',
        }),
      },
      '&:active': {
        backgroundColor: alpha(
          theme.palette.primary.main,
          theme.palette.action.selectedOpacity,
        ),
      },
      padding: '2px 16px'
    },
    ...theme.applyStyles('dark', {
      color: theme.palette.grey[300],
    }),
  },
}));

type FiltrosType = {
  tipo: string;
  codigo: string;
  nome: string;
  cpfCnpj: string;
  telefone: string;
  email: string;
  cidade: string;
  estado: string;
  vendedor: string;
  situacao: string;
  data_inicio: string;
  data_fim: string;
};

const Fornecedores: React.FC = () => {
  const navigate = useNavigate();
  const [openFilters, setOpenFilters] = useState<boolean>(false);
  const [filtros, setFiltros] = useState<FiltrosType>({
    tipo: "",
    codigo: "",
    nome: "",
    cpfCnpj: "",
    telefone: "",
    email: "",
    cidade: "",
    estado: "",
    vendedor: "",
    situacao: "",
    data_inicio: "",
    data_fim: ""
  });
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [mounted, setMounted] = useState(false);
  const [showSearchInput, setShowSearchInput] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [exportFormato, setExportFormato] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning'
  });
  const open = Boolean(anchorEl);
  
  const {
    clientes,
    isLoading,
    paginacao,
    fetchClientes,
    exportarClientes,
    aplicarFiltrosManuais,
    limparFiltros
  } = useClientes();

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleChange = (event: SelectChangeEvent) => {
    const { name, value } = event.target;
    setFiltros(prev => ({
      ...prev,
      [name as keyof FiltrosType]: value
    }));
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFiltros(prev => ({
      ...prev,
      [name as keyof FiltrosType]: value
    }));
  };

  const handleDateChange = (field: 'data_inicio' | 'data_fim', date: dayjs.Dayjs | null) => {
    setFiltros(prev => ({
      ...prev,
      [field]: date ? date.format('YYYY-MM-DD') : ''
    }));
  };

  const handleLimparFiltros = () => {
    setFiltros({
      tipo: "",
      codigo: "",
      nome: "",
      cpfCnpj: "",
      telefone: "",
      email: "",
      cidade: "",
      estado: "",
      vendedor: "",
      situacao: "",
      data_inicio: "",
      data_fim: ""
    });
    limparFiltros();
  };

  const handleBuscarFiltros = async () => {
    try {
      // Converter filtros para o formato da API
      const filtrosApi = Object.fromEntries(
        Object.entries(filtros).filter(([_, value]) => value !== '')
      );
      
      // Renomear campos para corresponder à API
      const filtrosConvertidos: any = {};
      Object.entries(filtrosApi).forEach(([key, value]) => {
        const apiKey = key === 'cpfCnpj' ? 'cpf_cnpj' : 
                      key === 'vendedor' ? 'vendedor_responsavel' : key;
        filtrosConvertidos[apiKey] = value;
      });

      await aplicarFiltrosManuais(filtrosConvertidos);
      setOpenFilters(false);
      showSnackbar('Filtros aplicados com sucesso!', 'success');
    } catch (error) {
      showSnackbar('Erro ao aplicar filtros', 'error');
    }
  };

  const handleOpenFilters = () => {
    setOpenFilters(!openFilters);
  };

  const handleSearchClick = () => {
    setShowSearchInput(!showSearchInput);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleSearchSubmit = async () => {
    try {
      const filtrosApi = { nome: searchTerm };
      await aplicarFiltrosManuais(filtrosApi);
      setShowSearchInput(false);
      setSearchTerm('');
    } catch (error) {
      showSnackbar('Erro na busca', 'error');
    }
  };

  const handleExportClick = () => {
    setExportDialogOpen(true);
  };

  const handleExportConfirm = async () => {
    try {
      setExportDialogOpen(false);
      showSnackbar(`Exportando em ${exportFormato.toUpperCase()}...`, 'info');
      
      // Converter filtros para o formato da API
      const filtrosApi = Object.fromEntries(
        Object.entries(filtros).filter(([_, value]) => value !== '')
      );
      
      const filtrosConvertidos: any = {};
      Object.entries(filtrosApi).forEach(([key, value]) => {
        const apiKey = key === 'cpfCnpj' ? 'cpf_cnpj' : 
                      key === 'vendedor' ? 'vendedor_responsavel' : key;
        filtrosConvertidos[apiKey] = value;
      });

      await exportarClientes(exportFormato, filtrosConvertidos);
      showSnackbar(`Exportação em ${exportFormato.toUpperCase()} concluída com sucesso!`, 'success');
    } catch (error: any) {
      showSnackbar(`Erro ao exportar em ${exportFormato.toUpperCase()}: ${error.message}`, 'error');
    }
  };

  const handleExportCancel = () => {
    setExportDialogOpen(false);
  };

  const handleRefresh = async () => {
    try {
      await fetchClientes();
      showSnackbar('Lista atualizada com sucesso!', 'success');
    } catch (error) {
      showSnackbar('Erro ao atualizar lista', 'error');
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info' | 'warning') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  const handleSnackbarClose = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  useEffect(() => {
    fetchClientes();
    const timer = setTimeout(() => {
      setMounted(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading && clientes.length === 0) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#9842F6]"></div>
        </div>
      </Layout>
    );
  }

  const totalClientes = clientes.length;
  const showingText = totalClientes > 0 ? 
    `Mostrando 1 a ${totalClientes} de um total de ${paginacao.total}` : 
    'Nenhum cliente encontrado';

  return (
    <Layout>
      <div className={`transition-all duration-500 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
        <div className="w-full text-start mb-6">
          <span className="text-[#9842F6] font-bold text-2xl">Clientes</span>
        </div>

        <Card
          sx={{
            boxShadow: "none",
            borderRadius: "4px",
            border: "1px solid #E9DEF6",
            "&:hover": {
              boxShadow: "none"
            }
          }}
        >
          {clientes.length > 0 ? (
            <CardContent>
              <div className="flex items-center justify-between mb-8">
                <div className="flex gap-2">
                  <div className={`transition-all duration-300 delay-100 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                    <Button
                      variant="contained"
                      color="success"
                      startIcon={<AddCircleOutline />}
                      sx={{ color: "#FFFFFF" }}
                      onClick={() => navigate("/cadastros/clientes/novo")}
                    >
                      Adicionar
                    </Button>
                  </div>
                  <div className={`transition-all duration-300 delay-150 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                    <Button
                      id="export-button"
                      aria-controls={open ? 'export-menu' : undefined}
                      aria-haspopup="true"
                      aria-expanded={open ? 'true' : undefined}
                      onClick={handleClick}
                      variant="contained"
                      startIcon={<Download />}
                      endIcon={<KeyboardArrowDown />}
                    >
                      Exportar
                    </Button>
                  </div>
                  <StyledMenu
                    id="export-menu"
                    slotProps={{
                      list: {
                        'aria-labelledby': 'export-button',
                      },
                    }}
                    anchorEl={anchorEl}
                    open={open}
                    onClose={handleClose}
                  >
                    <MenuItem onClick={() => {
                      setExportFormato('csv');
                      handleClose();
                      handleExportClick();
                    }}>
                      Exportar CSV
                    </MenuItem>
                    <MenuItem onClick={() => {
                      setExportFormato('xlsx');
                      handleClose();
                      handleExportClick();
                    }}>
                      Exportar Excel (.xlsx)
                    </MenuItem>
                    <MenuItem onClick={() => {
                      setExportFormato('pdf');
                      handleClose();
                      handleExportClick();
                    }}>
                      Exportar PDF
                    </MenuItem>
                  </StyledMenu>
                  <div className={`transition-all duration-300 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                    <Button
                      variant="contained"
                      startIcon={<Refresh />}
                      onClick={handleRefresh}
                    >
                      Atualizar
                    </Button>
                  </div>
                </div>
                <div className="flex gap-2 items-center">
                  <div className={`transition-all duration-300 delay-250 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                    <IconButton 
                      style={{ color: '#6B00A1' }}
                      onClick={handleSearchClick}
                    >
                      <Search />
                    </IconButton>
                  </div>
                  <Collapse 
                    in={showSearchInput} 
                    orientation="horizontal"
                    timeout={300}
                    easing={{
                      enter: 'cubic-bezier(0.4, 0, 0.2, 1)',
                      exit: 'cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <TextField
                        size="small"
                        placeholder="Pesquisar por nome..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleSearchSubmit();
                          }
                        }}
                        sx={{
                          width: 200,
                          '& .MuiOutlinedInput-root': {
                            backgroundColor: 'white',
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                              borderColor: '#6B00A1',
                            },
                          },
                        }}
                      />
                    </div>
                  </Collapse>
                  <div className={`transition-all duration-300 delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                    <Button
                      startIcon={<ZoomIn />}
                      variant="contained"
                      onClick={handleOpenFilters}
                    >
                      Busca avançada
                    </Button>
                  </div>
                </div>
              </div>
              
              <Collapse 
                in={openFilters} 
                timeout={400}
                easing={{
                  enter: 'cubic-bezier(0.4, 0, 0.2, 1)',
                  exit: 'cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              >
                <div className='bg-[#E9DEF6] rounded-lg p-4 mb-8'>
                  <div className='grid grid-cols-4 gap-4'>
                    <FormControl fullWidth>
                      <InputLabel id="tipo-filtro-label">Tipo</InputLabel>
                      <Select
                        labelId="tipo-filtro-label"
                        id="tipo-filtro"
                        name="tipo"
                        value={filtros.tipo}
                        label="Tipo"
                        onChange={handleChange}
                        size="small"
                      >
                        <MenuItem value="">Todos</MenuItem>
                        <MenuItem value="PJ">Pessoa Jurídica</MenuItem>
                        <MenuItem value="PF">Pessoa Física</MenuItem>
                        <MenuItem value="estrangeiro">Estrangeiro</MenuItem>
                      </Select>
                    </FormControl>
                    <TextField
                      fullWidth
                      name="codigo"
                      label='Código'
                      variant='outlined'
                      value={filtros.codigo}
                      onChange={handleInputChange}
                      size="small"
                    />
                    <TextField
                      fullWidth
                      name="nome"
                      label='Nome'
                      variant='outlined'
                      value={filtros.nome}
                      onChange={handleInputChange}
                      size="small"
                    />
                    <TextField
                      fullWidth
                      name="cpfCnpj"
                      label='CPF/CNPJ'
                      variant='outlined'
                      value={filtros.cpfCnpj}
                      onChange={handleInputChange}
                      size="small"
                    />
                    <TextField
                      fullWidth
                      name="telefone"
                      label='Telefone/Celular'
                      variant='outlined'
                      value={filtros.telefone}
                      onChange={handleInputChange}
                      size="small"
                    />
                    <TextField
                      fullWidth
                      name="email"
                      label='E-mail'
                      variant='outlined'
                      value={filtros.email}
                      onChange={handleInputChange}
                      size="small"
                    />
                    <TextField
                      fullWidth
                      name="cidade"
                      label='Cidade'
                      variant='outlined'
                      value={filtros.cidade}
                      onChange={handleInputChange}
                      size="small"
                    />
                    <TextField
                      fullWidth
                      name="estado"
                      label='Estado'
                      variant='outlined'
                      value={filtros.estado}
                      onChange={handleInputChange}
                      size="small"
                    />
                    <TextField
                      fullWidth
                      name="vendedor"
                      label='Vendedor/Responsável'
                      variant='outlined'
                      value={filtros.vendedor}
                      onChange={handleInputChange}
                      size="small"
                    />
                    <FormControl fullWidth>
                      <InputLabel id="situacao-filtro-label">Situação</InputLabel>
                      <Select
                        labelId="situacao-filtro-label"
                        id="situacao-filtro"
                        name="situacao"
                        value={filtros.situacao}
                        label="Situação"
                        onChange={handleChange}
                        size="small"
                      >
                        <MenuItem value="">Todos</MenuItem>
                        <MenuItem value="ativo">Ativo</MenuItem>
                        <MenuItem value="inativo">Inativo</MenuItem>
                      </Select>
                    </FormControl>
                    <div>
                      <DatePicker
                        value={filtros.data_inicio ? dayjs(filtros.data_inicio) : null}
                        onChange={(date) => handleDateChange('data_inicio', date)}
                        format="DD/MM/YYYY"
                        style={{ width: '100%', marginTop: '4px' }}
                        placeholder="Data início"
                        size="large"
                      />
                    </div>
                    <div>
                      {/* <InputLabel shrink sx={{ fontSize: '0.875rem' }}>
                        Data Fim
                      </InputLabel> */}
                      <DatePicker
                        value={filtros.data_fim ? dayjs(filtros.data_fim) : null}
                        onChange={(date) => handleDateChange('data_fim', date)}
                        format="DD/MM/YYYY"
                        style={{ width: '100%', marginTop: '4px' }}
                        placeholder="Data fim"
                        size="large"
                      />
                    </div>
                  </div>
                  <div className='mt-4'>
                    <Button 
                      variant='contained' 
                      startIcon={<Check />} 
                      color='success' 
                      style={{ color: '#FFFFFF', marginRight: 8 }}
                      onClick={handleBuscarFiltros}
                    >
                      Buscar
                    </Button>
                    <Button 
                      variant='contained' 
                      startIcon={<Close />} 
                      color='error'
                      onClick={handleLimparFiltros}
                    >
                      Limpar
                    </Button>
                  </div>
                </div>
              </Collapse>
              
              <ConfigProvider
                theme={{
                  components: {
                    Checkbox: {
                      colorPrimary: '#6B00A1',
                      colorPrimaryHover: '#1a0027'
                    },
                    Table: {
                      rowSelectedBg: '#f4dfff',
                      rowSelectedHoverBg: '#ecc6ff'
                    },
                    Pagination: {
                      colorPrimary: '#6B00A1',
                      colorPrimaryHover: '#1a0027'
                    }
                  }
                }}
              >
                <div className={`transition-all duration-500 delay-400 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                  <div className="text-[#3C0473] font-normal text-lg mb-4">
                    {showingText}
                  </div>
                </div>
                <div className={`transition-all duration-500 delay-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                  <TabelaClientes
                    clientes={clientes}
                    isLoading={isLoading}
                    onRefresh={handleRefresh}
                    onChange={() => {}}
                    pagination={{
                      current: paginacao.pagina,
                      pageSize: paginacao.limite,
                      total: paginacao.total,
                      align: 'center'
                    }}
                  />
                </div>
              </ConfigProvider>
            </CardContent>
          ) : (
            <CardContent>
              <div className="flex gap-2 mb-4">
                <div className={`transition-all duration-300 delay-100 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<AddCircleOutline />}
                    sx={{ color: "#FFFFFF" }}
                    onClick={() => navigate("/cadastros/clientes/novo")}
                  >
                    Adicionar meu primeiro cliente
                  </Button>
                </div>
                <div className={`transition-all duration-300 delay-150 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                  <Button
                    variant="contained"
                    startIcon={<InsertDriveFileOutlined />}
                  >
                    Importar cliente
                  </Button>
                </div>
                <div className={`transition-all duration-300 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                  <Button
                    variant="contained"
                    startIcon={<SmartDisplayOutlined />}
                  >
                    Vídeo tutorial
                  </Button>
                </div>
              </div>
              <div className={`transition-all duration-500 delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                <div className="text-[#3C0473]">
                  <p className="text-lg my-4">
                    Os fornecedores são empresas ou pessoas que vendem produtos ou serviços para sua empresa. Eles podem fornecer produtos para revenda, matéria prima para produção, serviços pontuais ou serviços recorrentes.
                  </p>
                  <span className="font-bold text-lg mb-4">Adicionando fornecedores você vai conseguir:</span>
                  <ul className="list-disc list-inside text-lg">
                    <li>Ter sempre em mãos as informações sobre seus fornecedores</li>
                    <li>Emitir notas fiscais</li>
                    <li>Agilizar seu processo de cotação e compra</li>
                    <li>Acompanhar seus gastos de compras</li>
                    <li>Saber quanto está gastando com cada fornecedor</li>
                    <li>E muito mais...</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          )}
        </Card>
      </div>

      {/* Dialog de Exportação */}
      <Dialog open={exportDialogOpen} onClose={handleExportCancel}>
        <DialogTitle>Exportar Fornecedores</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel id="export-format-label">Formato</InputLabel>
            <Select
              labelId="export-format-label"
              id="export-format"
              value={exportFormato}
              label="Formato"
              onChange={(e) => setExportFormato(e.target.value)}
            >
              <MenuItem value="csv">CSV</MenuItem>
              <MenuItem value="xlsx">Excel</MenuItem>
              <MenuItem value="pdf">PDF</MenuItem>
            </Select>
          </FormControl>
          <p className="text-sm text-gray-600 mt-4">
            Serão exportados {paginacao.total || 0} fornecedores com os filtros atuais aplicados.
          </p>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleExportCancel}>Cancelar</Button>
          <Button onClick={handleExportConfirm} variant="contained" color="primary">
            Exportar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar para notificações */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Layout>
  )
}

export default Fornecedores;
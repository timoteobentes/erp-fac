/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ConfigProvider,
  Layout as AntLayout,
  Menu,
  Avatar,
  theme as antTheme,
  List,
  Badge,
  Divider
} from 'antd';
import { Button, IconButton, Popover } from '@mui/material';
import {
  KeyboardDoubleArrowLeft,
  KeyboardDoubleArrowRight,
  BalanceOutlined,
  PersonalVideoOutlined,
  NotificationsOutlined
} from '@mui/icons-material';
import { useLogin } from '../modules/Login/hooks/useLogin';
import fac_logo_branco from '../assets/FAC_logo_branco.svg';
import { useNavigate, useLocation } from 'react-router';
import { getStaticMenuItems } from '../components/menuConfig';
import dayjs from 'dayjs';
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);
const agora = dayjs();

const { Header, Sider, Content } = AntLayout;

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, adm, logout } = useLogin();
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [currentNav, setCurrentNav] = useState('inicio');
  const [openKeys, setOpenKeys] = useState<string[]>([]);
  const [notifications, ] = useState<any[]>([
    {
      id: 1, titulo: 'Bem-vindo', mensagem: 'Obrigado por usar nosso sistema!', criado_em: new Date(), lido_em: null
    },
    {
      id: 2, titulo: 'Atualização', mensagem: 'O sistema foi atualizado para a versão 2.0.', criado_em: new Date(), lido_em: new Date()
    }
  ]);

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = antTheme.useToken();

  // 1. OTIMIZAÇÃO: Tema memoizado para evitar recálculo do AntD
  const layoutTheme = useMemo(() => ({
    components: {
      Layout: { siderBg: '#6B00A1' },
      Menu: {
        itemBg: '#6B00A1',
        itemSelectedBg: '#9842F6',
        colorPrimary: '#FFFFFF',
        colorPrimaryActive: '#9842F6',
        colorPrimaryBg: '#520DA8',
        itemSelectedColor: '#FFFFFF',
        itemColor: '#FFFFFF',
        itemHoverBg: '#520DA8',
        itemHoverColor: '#FFFFFF',
        itemActiveBg: '#9842F6',
        popupBg: '#6B00A1'
      }
    }
  }), []);

  // 2. Lógica do Usuário
  const usuarioNome = user?.nome_usuario;
  const userInitial = useMemo(() => usuarioNome ? usuarioNome.charAt(0).toUpperCase() : 'U', [usuarioNome]);
  const hasPermission = Boolean(user?.pago || adm);

  // 3. OTIMIZAÇÃO: Menu Items Memoizado
  const menuItems = useMemo(() => {
    // Item de Perfil (Dinâmico)
    const profileItem = {
      key: 'perfil',
      className: 'custom-profile-menu-item',
      label: (
        <div className={`flex items-center ${collapsed ? 'justify-center -ml-4' : 'justify-start'} w-[300%] py-4`}>
          <Avatar
            size='large'
            className='font-bold'
            style={{ backgroundColor: '#0089FD', fontSize: 20 }}
          >
            {userInitial}
          </Avatar>
          {!collapsed && (
            <span className='text-white font-bold text-lg ml-4 truncate'>
              {usuarioNome || 'Usuário'}
            </span>
          )}
        </div>
      ),
      children: [
        { key: 'perfil-perfil', label: 'Meu Perfil' },
        { key: 'perfil-sair', label: 'Sair', onClick: () => logout() }
      ]
    };

    // Itens Estáticos
    const staticItems = getStaticMenuItems(navigate, user, adm);

    return [profileItem, ...staticItems];
  }, [collapsed, userInitial, usuarioNome, navigate, user, adm, logout]);

  // 4. Efeito de Rota Otimizado
  useEffect(() => {
    const path = location.pathname;
    const pathSegments = path.split('/').filter(Boolean); // ex: ['', 'cadastros', 'clientes'] -> ['cadastros', 'clientes']
    
    if (pathSegments.length > 0) {
      const mainSection = pathSegments[0]; // 'cadastros'
      
      // Define a chave ativa baseada na URL completa ou lógica específica
      // Simplificação: use a lógica de mapeamento aqui se necessário, 
      // mas geralmente o nome da rota bate com a chave
      const activeKey = pathSegments.length > 1 
        ? `${mainSection}-${pathSegments[1]}` 
        : mainSection;

      setCurrentNav(activeKey);

      // Abre o submenu automaticamente se não estiver colapsado
      if (!collapsed) {
        setOpenKeys((prev) => [...new Set([...prev, mainSection])]);
      }
    } else {
      setCurrentNav('inicio');
    }
  }, [location.pathname, collapsed]);

  const handleMenuClick = useCallback(({ key }: { key: string }) => {
    setCurrentNav(key);
  }, []);

  const handleOpenChange = useCallback((keys: string[]) => {
    setOpenKeys(keys);
  }, []);

  const handleNotificacaoClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleNotificacaoClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;

  return (
    <ConfigProvider theme={layoutTheme}>
      <AntLayout className='h-screen'>
        <Sider trigger={null} collapsible collapsed={collapsed} width={250}>
          <div className="w-full border-b border-[#9842F6] p-4 flex justify-center">
            <img 
              src={fac_logo_branco} 
              alt='FAC Logo' 
              className={`transition-all duration-300 ${collapsed ? 'w-10' : 'w-36'}`}
            />
          </div>
          <Menu
            mode="inline"
            selectedKeys={[currentNav]}
            openKeys={openKeys}
            onOpenChange={handleOpenChange}
            items={menuItems}
            onClick={handleMenuClick}
            className='overflow-y-auto h-[calc(100vh-100px)] custom-scrollbar' // Adicione uma classe CSS para scrollbar se precisar
          />
        </Sider>
        
        <AntLayout style={{ background: colorBgContainer }}>
          <Header
            style={{ padding: '0 24px', background: colorBgContainer }}
            className='flex items-center justify-between border-b border-gray-200 h-16 sticky top-0 z-10'
          >
            <div className='flex items-center gap-4'>
              <IconButton
                onClick={() => setCollapsed(!collapsed)}
                sx={{ color: '#6B00A1' }}
              >
                {collapsed ? <KeyboardDoubleArrowRight fontSize="large" /> : <KeyboardDoubleArrowLeft fontSize="large" />}
              </IconButton>
              
              {hasPermission && (
                <div className="hidden md:flex gap-2"> 
                  <Button
                    variant='contained'
                    color='success'
                    startIcon={<BalanceOutlined />}
                    sx={{ color: '#FFFFFF' }}
                  >
                    Impostos
                  </Button>
                  <Button
                    variant='contained'
                    color='info'
                    startIcon={<PersonalVideoOutlined />}
                  >
                    Frente de caixa
                  </Button>
                </div>
              )}
            </div>

            {hasPermission && (
              <>
                <IconButton sx={{ color: '#6B00A1' }} aria-describedby={id} onClick={handleNotificacaoClick}>
                  <NotificationsOutlined />
                </IconButton>
                <Popover
                  id={id}
                  open={open}
                  anchorEl={anchorEl}
                  onClose={handleNotificacaoClose}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left'
                  }}
                  sx={{ ".css-2k8egf-MuiPaper-root-MuiPopover-paper": { borderRadius: "4px" } }}
                >
                  <div className="w-[350px] py-4">
                    <div className="px-2 py-4 font-bold text-xl">
                      Notificações
                    </div>
                    {/* <Divider style={{ margin: "10px 0" }} /> */}
                    <List
                      itemLayout="horizontal"
                      dataSource={notifications.slice(0, 5)}
                      renderItem={item => (
                        <List.Item 
                          // onClick={() => marcarComoLida(item.id)}
                          className={`
                            cursor-pointer
                            px-4 py-2
                            ${!item.lido_em ? "bg-purple-50" : ""}
                            hover:bg-purple-100
                          `}
                        >
                          <List.Item.Meta
                            title={
                              <div className="flex justify-between px-2">
                                <span className="font-semibold">{item.titulo.toUpperCase()}</span>
                                {!item.lido_em && <Badge dot style={{ background: "#6b00a1" }} />}
                              </div>
                            }
                            description={
                              <>
                                <div className="px-2">{item.mensagem.length > 100 ? `${item.mensagem.substring(0, 100)}...` : item.mensagem}</div>
                                <div className="text-xs text-gray-500 mt-1 px-2 italic">{item.criado_em ? dayjs(item.criado_em).from(agora) : null}</div>
                              </>
                            }
                          />
                        </List.Item>
                      )}
                    />
                    <Divider style={{ margin: "10px 0" }} />
                    <div className="text-center">
                      <Button type="link" href="/simples/notificacoes" className="text-purple-600">Ver todas as notificações</Button>
                    </div>
                  </div>
                </Popover>
              </>
            )}
          </Header>
          
          <Content
            style={{
              margin: '16px',
              padding: 24,
              minHeight: 280,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
              overflowY: 'auto',
              height: 'calc(100vh - 64px - 32px)' // Altura total - Header - Margens
            }}
          >
            {children}
          </Content>
        </AntLayout>
      </AntLayout>
    </ConfigProvider>
  );
};

export default Layout;
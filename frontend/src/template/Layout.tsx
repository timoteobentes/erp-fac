/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useMemo } from 'react';
import { ConfigProvider, Layout as AntLayout, Menu, Avatar, Badge, Divider } from 'antd';
import { Button, IconButton, Popover, Box, Typography } from '@mui/material';
import { KeyboardDoubleArrowLeft, KeyboardDoubleArrowRight, BalanceOutlined, PersonalVideoOutlined, NotificationsOutlined } from '@mui/icons-material';
import { useLogin } from '../modules/Login/hooks/useLogin';
import fac_logo_branco from '../assets/FAC_logo_branco.svg';
import { useNavigate, useLocation } from 'react-router';
import { getStaticMenuItems } from '../components/menuConfig';
import dayjs from 'dayjs';
import relativeTime from "dayjs/plugin/relativeTime";
import ptBR from 'antd/locale/pt_BR';
import 'dayjs/locale/pt-br';

dayjs.extend(relativeTime);
dayjs.locale('pt-br');
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
  
  const [notifications] = useState<any[]>([
    { id: 1, titulo: 'Bem-vindo', mensagem: 'Obrigado por usar a plataforma Faço a Conta! Explore os menus ao lado.', criado_em: new Date(), lido_em: null },
    { id: 2, titulo: 'Atualização do Sistema', mensagem: 'O Frente de Caixa agora possui integração nativa.', criado_em: new Date(Date.now() - 86400000), lido_em: new Date() }
  ]);

  // 1. CONFIG PROVIDER BLINDADO: Matando o Azul do AntD
  const layoutTheme = useMemo(() => ({
    components: {
      Layout: { 
        siderBg: '#3C0473', // Usando a cor Primária sólida do seu Design System
      },
      Menu: {
        itemBg: 'transparent',
        itemSelectedBg: 'rgba(255, 255, 255, 0.15)', 
        itemHoverBg: 'rgba(255, 255, 255, 0.08)',
        itemSelectedColor: '#FFFFFF',
        itemColor: 'rgba(255, 255, 255, 0.7)', 
        itemHoverColor: '#FFFFFF',
        popupBg: '#3C0473',
        itemBorderRadius: 8, 
        itemMarginInline: 12, 
        fontSize: 15,
        // As 3 linhas abaixo forçam pais e ícones selecionados a ficarem brancos, não azuis!
        colorPrimary: '#FFFFFF', 
        colorTextLightSolid: '#FFFFFF',
        colorText: 'rgba(255, 255, 255, 0.7)'
      }
    }
  }), []);

  const usuarioNome = user?.nome_usuario;
  const userInitial = useMemo(() => usuarioNome ? usuarioNome.charAt(0).toUpperCase() : 'U', [usuarioNome]);
  const hasPermission = Boolean(user?.status == "ativo" && adm);

  // 2. MENU ITEMS (Com o Avatar Fixo)
  const menuItems = useMemo(() => {
    const profileItem = {
      key: 'perfil',
      className: 'custom-profile-menu-item mb-4 mt-2',
      label: (
        <div className={`flex items-center ${collapsed ? 'justify-center -ml-3' : 'justify-start'} w-[300%] py-2 transition-all`}>
          <Avatar 
            size={40}
            style={{ backgroundColor: '#10B981', fontWeight: 700, fontSize: 16, border: '2px solid rgba(255,255,255,0.2)' }}
          >
            {userInitial}
          </Avatar>
          {!collapsed && (
            <div className='flex flex-col ml-3 overflow-hidden'>
              <span className='text-white font-bold text-sm truncate leading-tight'>{usuarioNome || 'Usuário'}</span>
              <span className='text-[11px] text-white/50 truncate'>{hasPermission ? 'Administrador' : 'Colaborador'}</span>
            </div>
          )}
        </div>
      ),
      children: [
        { key: 'perfil-perfil', label: 'Meu Perfil', onClick: () => navigate('/perfil') },
        { key: 'perfil-sair', label: 'Sair do Sistema', onClick: () => logout() }
      ]
    };

    const staticItems = getStaticMenuItems(navigate, user, adm);
    return [profileItem, ...staticItems];
  }, [collapsed, userInitial, usuarioNome, navigate, user, adm, logout, hasPermission]);

  useEffect(() => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    if (pathSegments.length > 0) {
      const mainSection = pathSegments[0];
      const activeKey = pathSegments.length > 1 ? `${mainSection}-${pathSegments[1]}` : mainSection;
      setCurrentNav(activeKey);
      if (!collapsed) setOpenKeys((prev) => [...new Set([...prev, mainSection])]);
    } else {
      setCurrentNav('inicio');
    }
  }, [location.pathname, collapsed]);

  return (
    <ConfigProvider theme={layoutTheme} locale={ptBR}>
      <AntLayout className='h-screen bg-[#F8FAFC]'>
        
        {/* SIDER SÓLIDO PREMIUM */}
        <Sider 
          trigger={null} 
          collapsible 
          collapsed={collapsed} 
          width={260}
          style={{
            backgroundColor: '#3C0473', // Roxo Sólido do Design System (Menos Dark)
            boxShadow: '4px 0 24px rgba(0,0,0,0.06)',
            zIndex: 20
          }}
        >
          <div className="w-full h-20 flex items-center justify-center border-b border-white/10 mb-4">
            <img 
              src={fac_logo_branco} 
              alt='FAC Logo' 
              className={`transition-all duration-300 ${collapsed ? 'w-12 opacity-80' : 'w-40'}`}
            />
          </div>
          <Menu
            mode="inline"
            selectedKeys={[currentNav]}
            openKeys={openKeys}
            onOpenChange={setOpenKeys}
            items={menuItems}
            onClick={({ key }) => setCurrentNav(key)}
            className='overflow-y-auto h-[calc(100vh-100px)] custom-scrollbar border-r-0'
            style={{ borderRight: 0 }}
          />
        </Sider>
        
        <AntLayout className="bg-transparent">
          
          <Header
            className='flex items-center justify-between px-6 sticky top-0 z-10 transition-all'
            style={{ 
              background: 'rgba(255, 255, 255, 0.85)',
              backdropFilter: 'blur(12px)',
              height: '76px',
              paddingInline: '24px',
              boxShadow: '0 4px 30px rgba(0, 0, 0, 0.03)',
            }}
          >
            <div className='flex items-center gap-6'>
              <IconButton 
                onClick={() => setCollapsed(!collapsed)} 
                sx={{ 
                  color: '#475569', 
                  backgroundColor: '#F1F5F9',
                  borderRadius: '12px',
                  '&:hover': { backgroundColor: '#E2E8F0', color: '#3C0473' }
                }}
              >
                {collapsed ? <KeyboardDoubleArrowRight /> : <KeyboardDoubleArrowLeft />}
              </IconButton>
              
              {hasPermission && (
                <div className="hidden md:flex gap-3"> 
                  {/* BOTÕES CORPORATIVOS B2B (Border Radius 8px) */}
                  <Button
                    variant='outlined'
                    startIcon={<BalanceOutlined />}
                    sx={{ 
                      borderRadius: '8px', 
                      color: '#10B981',
                      borderColor: '#10B981',
                      fontWeight: 600,
                      textTransform: 'none',
                      px: 3,
                      '&:hover': { backgroundColor: 'rgba(16, 185, 129, 0.08)', borderColor: '#059669' }
                    }}
                  >
                    Impostos
                  </Button>
                  <Button
                    variant='contained'
                    startIcon={<PersonalVideoOutlined />}
                    onClick={() => navigate('/pdv')}
                    sx={{ 
                      borderRadius: '8px', 
                      background: 'linear-gradient(90deg, #3C0473 0%, #5B21B6 100%)',
                      color: '#FFFFFF',
                      fontWeight: 600,
                      textTransform: 'none',
                      px: 3,
                      boxShadow: '0 4px 14px 0 rgba(91, 33, 182, 0.25)',
                      '&:hover': { background: 'linear-gradient(90deg, #28024D 0%, #4C1D95 100%)', boxShadow: '0 6px 20px rgba(91, 33, 182, 0.3)' }
                    }}
                  >
                    Frente de Caixa
                  </Button>
                </div>
              )}
            </div>

            {hasPermission && (
              <Box className="flex items-center">
                <IconButton 
                  aria-describedby={anchorEl ? 'notif-popover' : undefined} 
                  onClick={(e) => setAnchorEl(e.currentTarget)}
                  sx={{ 
                    color: '#64748B', 
                    transition: 'all 0.2s',
                    '&:hover': { color: '#3C0473', backgroundColor: '#F8FAFC' }
                  }}
                >
                  <Badge count={notifications.filter(n => !n.lido_em).length} size="small" style={{ backgroundColor: '#EF4444' }}>
                    <NotificationsOutlined />
                  </Badge>
                </IconButton>

                <Popover
                  id={anchorEl ? 'notif-popover' : undefined}
                  open={Boolean(anchorEl)}
                  anchorEl={anchorEl}
                  onClose={() => setAnchorEl(null)}
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                  sx={{ mt: 1.5, ".MuiPopover-paper": { borderRadius: "12px", boxShadow: '0 20px 40px rgba(0,0,0,0.1)' } }}
                >
                  <Box sx={{ width: 380, maxHeight: 500, display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ p: 3, pb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #F1F5F9' }}>
                      <Typography variant="h6" fontWeight={700} color="#0F172A">Notificações</Typography>
                      <Button size="small" sx={{ textTransform: 'none', color: '#5B21B6', fontWeight: 600 }}>Marcar todas como lidas</Button>
                    </Box>
                    
                    <Box sx={{ p: 0, overflowY: 'auto', flex: 1 }}>
                      {notifications.map((item, index) => (
                        <Box key={item.id}>
                          <Box 
                            sx={{ 
                              p: 3, 
                              cursor: 'pointer', 
                              backgroundColor: item.lido_em ? '#FFFFFF' : '#F8FAFC',
                              transition: 'background 0.2s',
                              '&:hover': { backgroundColor: '#F1F5F9' }
                            }}
                          >
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                              <Typography variant="subtitle2" fontWeight={item.lido_em ? 500 : 700} color="#0F172A">
                                {item.titulo}
                              </Typography>
                              {!item.lido_em && <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#5B21B6', mt: 0.5 }} />}
                            </Box>
                            <Typography variant="body2" color="#64748B" sx={{ mb: 1, lineHeight: 1.4 }}>
                              {item.mensagem}
                            </Typography>
                            <Typography variant="caption" color="#94A3B8" fontWeight={500}>
                              {dayjs(item.criado_em).from(agora)}
                            </Typography>
                          </Box>
                          {index < notifications.length - 1 && <Divider />}
                        </Box>
                      ))}
                    </Box>
                    
                    <Box sx={{ p: 2, borderTop: '1px solid #F1F5F9', textAlign: 'center' }}>
                      <Button fullWidth onClick={() => navigate('/simples/notificacoes')} sx={{ textTransform: 'none', color: '#64748B', fontWeight: 600, '&:hover': { color: '#3C0473', backgroundColor: 'transparent' } }}>
                        Ver todas as notificações
                      </Button>
                    </Box>
                  </Box>
                </Popover>
              </Box>
            )}
          </Header>
          
          <Content
            style={{
              margin: '24px',
              padding: '24px',
              minHeight: 280,
              background: '#FFFFFF',
              borderRadius: '16px', // Arredondamento do container também reajustado para acompanhar o B2B
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.02)', 
              overflowY: 'auto',
              height: 'calc(100vh - 76px - 48px)' 
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
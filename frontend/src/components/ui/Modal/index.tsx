import { type ReactNode } from "react";
import { Box, Modal, Fade, Backdrop, Typography, IconButton } from "@mui/material";
import { Close } from "@mui/icons-material";

// Removemos o 'any' e usamos 'ReactNode', que é a tipagem correta para elementos React
interface ModalCustomProps {
  open: boolean;
  onClose: () => void;
  title: string;
  content: ReactNode;
  footer?: ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl'; // Adicionado para dar flexibilidade extra se precisar de modais maiores
}

export const ModalCustom = ({
  open,
  onClose,
  title,
  content,
  footer,
  maxWidth = 'md'
}: ModalCustomProps) => {
  
  // Controle de largura máxima baseado na prop
  const widthMap = {
    sm: 400,
    md: 600,
    lg: 800,
    xl: 1140,
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
      closeAfterTransition
      slots={{ backdrop: Backdrop }}
      slotProps={{
        backdrop: {
          timeout: 400,
          sx: { 
            backgroundColor: 'rgba(15, 23, 42, 0.4)', // Overlay escuro premium
            backdropFilter: 'blur(6px)' // O famoso Glassmorphism (desfoque de fundo)
          }
        },
      }}
    >
      <Fade in={open}>
        <Box 
          sx={{ 
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '100%',
            maxWidth: { xs: '95%', sm: widthMap[maxWidth] },
            maxHeight: '90vh',
            bgcolor: '#FFFFFF',
            borderRadius: '16px', // Arredondamento moderno
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', // Sombra profunda e suave
            display: 'flex',
            flexDirection: 'column',
            outline: 'none', // Remove aquela borda azul padrão do navegador ao focar
          }}
        >
          {/* HEADER CLEAN */}
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between', 
              px: 4, 
              py: 2.5, 
              borderBottom: '1px solid #F1F5F9' 
            }}
          >
            <Typography 
              id="modal-title" 
              variant="h6" 
              sx={{ fontWeight: 700, color: '#0F172A', letterSpacing: '-0.02em' }}
            >
              {title}
            </Typography>
            <IconButton 
              onClick={onClose} 
              sx={{ 
                color: '#64748B', 
                transition: 'all 0.2s',
                '&:hover': { color: '#EF4444', backgroundColor: 'rgba(239, 68, 68, 0.1)' } // Fica vermelhinho suave ao passar o mouse
              }}
            >
              <Close />
            </IconButton>
          </Box>

          {/* CONTENT BROWSER (Com barra de rolagem customizada) */}
          <Box 
            id="modal-description" 
            sx={{ 
              p: 4, 
              flex: 1, 
              overflowY: 'auto',
              color: '#475569',
              // Estilização da barra de rolagem para não ficar grosseira no Windows
              '&::-webkit-scrollbar': { width: '6px' },
              '&::-webkit-scrollbar-track': { background: '#F8FAFC' },
              '&::-webkit-scrollbar-thumb': { background: '#CBD5E1', borderRadius: '10px' },
              '&::-webkit-scrollbar-thumb:hover': { background: '#94A3B8' },
            }}
          >
            {content}
          </Box>

          {/* FOOTER OPCIONAL */}
          {footer && (
            <Box 
              sx={{ 
                px: 4, 
                py: 3, 
                borderTop: '1px solid #F1F5F9',
                backgroundColor: '#F8FAFC',
                borderBottomLeftRadius: '16px',
                borderBottomRightRadius: '16px',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 2
              }}
            >
              {footer}
            </Box>
          )}
        </Box>
      </Fade>
    </Modal>
  );
};
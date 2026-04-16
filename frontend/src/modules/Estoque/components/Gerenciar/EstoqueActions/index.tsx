/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { Button, IconButton, Collapse, TextField, Menu, MenuItem, InputAdornment } from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import {
  Download, KeyboardArrowDown, Refresh,
  Search, ZoomIn
} from '@mui/icons-material';

const StyledMenu = styled((props: any) => (
  <Menu
    elevation={0}
    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
    transformOrigin={{ vertical: 'top', horizontal: 'right' }}
    {...props}
  />
))(({ theme }) => ({
  '& .MuiPaper-root': {
    borderRadius: 6,
    marginTop: theme.spacing(1),
    minWidth: 125,
    boxShadow: 'rgb(255, 255, 255) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px',
    '& .MuiMenuItem-root': {
      '& .MuiSvgIcon-root': { fontSize: 18, marginRight: theme.spacing(1.5) },
      '&:active': { backgroundColor: alpha(theme.palette.primary.main, theme.palette.action.selectedOpacity) },
    },
  },
}));

interface EstoqueActionsProps {
  onRefresh: () => void;
  onExport?: (formato: string) => void;
  onToggleFilters: () => void;
  onSearchSimple: (term: string) => void;
  mounted?: boolean;
}

export const EstoqueActions: React.FC<EstoqueActionsProps> = ({
  onRefresh, onExport, onToggleFilters, onSearchSimple, mounted = true
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const open = Boolean(anchorEl);

  const handleExportClick = (formato: string) => {
    if (onExport) onExport(formato);
    setAnchorEl(null);
  };

  const handleSimpleSearch = () => {
    onSearchSimple(searchTerm);
  };

  const handleCleanSimpleSearch = () => {
    setSearchTerm('');
    onSearchSimple('');
    setShowSearch(false);
  }

  const animClass = (delay: number) => 
    `transition-all duration-300 ${mounted ? `opacity-100 translate-y-0 delay-${delay}` : 'opacity-0 translate-y-4'}`;

  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
      {/* Botões da Esquerda */}
      <div className="flex gap-2 flex-wrap">
        <div className={animClass(150)}>
          <Button
            id="export-button"
            variant="contained"
            startIcon={<Download />}
            endIcon={<KeyboardArrowDown />}
            onClick={(e) => setAnchorEl(e.currentTarget)}
          >
            Exportar Relatório
          </Button>
          <StyledMenu
            id="export-menu"
            anchorEl={anchorEl}
            open={open}
            onClose={() => setAnchorEl(null)}
          >
            <MenuItem onClick={() => handleExportClick('csv')}>Exportar CSV</MenuItem>
            <MenuItem onClick={() => handleExportClick('xlsx')}>Exportar Excel</MenuItem>
            <MenuItem onClick={() => handleExportClick('pdf')}>Exportar PDF</MenuItem>
          </StyledMenu>
        </div>

        <div className={animClass(200)}>
          <Button variant="contained" startIcon={<Refresh />} onClick={onRefresh}>
            Atualizar Saldo
          </Button>
        </div>
      </div>

      {/* Botões da Direita */}
      <div className="flex gap-2 items-center">
        <div className={animClass(250)}>
          <IconButton style={{ color: '#6B00A1' }} onClick={() => setShowSearch(!showSearch)}>
            <Search />
          </IconButton>
        </div>

        <Collapse in={showSearch} orientation="horizontal" timeout={300}>
          <TextField
            size="small"
            placeholder="Nome ou SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSimpleSearch()}
            sx={{ width: 200, backgroundColor: 'white' }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <button onClick={handleCleanSimpleSearch} className="cursor-pointer hover:font-bold">x</button>
                </InputAdornment>
              )
            }}
          />
        </Collapse>

        <div className={animClass(300)}>
          <Button startIcon={<ZoomIn />} variant="contained" onClick={onToggleFilters} sx={{ bgcolor: '#6B00A1', '&:hover': { bgcolor: '#3C0473' }, textTransform: 'none' }}>
            Busca avançada
          </Button>
        </div>
      </div>
    </div>
  );
};

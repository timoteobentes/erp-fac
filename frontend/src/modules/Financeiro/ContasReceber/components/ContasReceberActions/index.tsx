import React, { useState } from 'react';
import { Button, Dropdown, Input } from 'antd';
import {
  AddCircleOutline,
  Download,
  KeyboardArrowDown,
  Refresh,
  Search,
  ZoomIn
} from '@mui/icons-material';

interface ContasReceberActionsProps {
  onAdd?: () => void;
  onRefresh: () => void;
  onExport?: (formato: string) => void;
  onToggleFilters: () => void;
  onSearchSimple: (term: string) => void;
  mounted?: boolean;
}

export const ContasReceberActions: React.FC<ContasReceberActionsProps> = ({
  onAdd, onRefresh, onExport, onToggleFilters, onSearchSimple, mounted = true
}) => {
  const [showSearch, setShowSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleExportClick = (formato: string) => {
    if (onExport) onExport(formato);
  };

  const handleSimpleSearch = () => {
    onSearchSimple(searchTerm);
  };

  const handleCleanSimpleSearch = () => {
    setSearchTerm('');
    onSearchSimple('');
    setShowSearch(false);
  };

  const animClass = (delay: number) =>
    `transition-all duration-300 ${mounted ? `opacity-100 translate-y-0 delay-${delay}` : 'opacity-0 translate-y-4'}`;

  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="flex gap-2 flex-wrap">
        {onAdd && (
          <div className={animClass(100)}>
            <Button type="primary" icon={<AddCircleOutline fontSize="small" />} onClick={onAdd} style={{ background: '#16A34A', borderColor: '#16A34A', height: 40, borderRadius: 8, fontWeight: 600 }}>
              Novo Recebimento
            </Button>
          </div>
        )}

        <div className={animClass(150)}>
          <Dropdown
            menu={{
              items: [
                { key: 'csv', label: 'Exportar CSV', onClick: () => handleExportClick('csv') },
                { key: 'pdf', label: 'Exportar PDF', onClick: () => handleExportClick('pdf') },
              ]
            }}
            trigger={['click']}
          >
            <Button icon={<Download fontSize="small" />} style={{ height: 40, borderRadius: 8, fontWeight: 600 }}>
              Exportar <KeyboardArrowDown fontSize="small" />
            </Button>
          </Dropdown>
        </div>

        <div className={animClass(200)}>
          <Button icon={<Refresh fontSize="small" />} onClick={onRefresh} style={{ height: 40, borderRadius: 8, fontWeight: 600 }}>
            Atualizar
          </Button>
        </div>
      </div>

      <div className="flex gap-2 items-center">
        <div className={animClass(250)}>
          <Button type="text" shape="circle" icon={<Search />} onClick={() => setShowSearch(!showSearch)} style={{ color: '#6B00A1', width: 40, height: 40 }} />
        </div>

        {showSearch && (
          <div className={animClass(275)}>
            <Input
              placeholder="Buscar descrição..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onPressEnter={handleSimpleSearch}
              allowClear={{ clearIcon: <span onClick={handleCleanSimpleSearch}>x</span> }}
              style={{ width: 220, height: 40, borderRadius: 8 }}
            />
          </div>
        )}

        <div className={animClass(300)}>
          <Button type="primary" icon={<ZoomIn fontSize="small" />} onClick={onToggleFilters} style={{ background: '#6B00A1', borderColor: '#6B00A1', height: 40, borderRadius: 8, fontWeight: 600 }}>
            Busca avançada
          </Button>
        </div>
      </div>
    </div>
  );
};

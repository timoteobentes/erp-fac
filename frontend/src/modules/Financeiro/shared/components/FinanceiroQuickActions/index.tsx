import React, { useState } from "react";
import { Button, Input } from "antd";
import {
  AddCircleOutline,
  Refresh,
  Search,
  ZoomIn,
} from "@mui/icons-material";

interface FinanceiroQuickActionsProps {
  onAdd: () => void;
  onRefresh: () => void;
  onToggleFilters: () => void;
  onSearchSimple: (term: string) => void;
  addLabel: string;
  searchPlaceholder?: string;
  mounted?: boolean;
}

export const FinanceiroQuickActions: React.FC<FinanceiroQuickActionsProps> = ({
  onAdd,
  onRefresh,
  onToggleFilters,
  onSearchSimple,
  addLabel,
  searchPlaceholder = "Buscar por nome...",
  mounted = true,
}) => {
  const [showSearch, setShowSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const animClass = (delay: number) =>
    `transition-all duration-300 ${mounted ? `opacity-100 translate-y-0 delay-${delay}` : "opacity-0 translate-y-4"}`;

  const handleSimpleSearch = () => {
    onSearchSimple(searchTerm);
  };

  const handleCleanSimpleSearch = () => {
    setSearchTerm("");
    onSearchSimple("");
    setShowSearch(false);
  };

  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="flex gap-2 flex-wrap">
        <div className={animClass(100)}>
          <Button
            type="primary"
            icon={<AddCircleOutline fontSize="small" />}
            onClick={onAdd}
            style={{ background: "#16A34A", borderColor: "#16A34A", height: 40, borderRadius: 8, fontWeight: 600 }}
          >
            {addLabel}
          </Button>
        </div>

        <div className={animClass(150)}>
          <Button
            icon={<Refresh fontSize="small" />}
            onClick={onRefresh}
            style={{ height: 40, borderRadius: 8, fontWeight: 600 }}
          >
            Atualizar
          </Button>
        </div>
      </div>

      <div className="flex gap-2 items-center">
        <div className={animClass(200)}>
          <Button
            type="text"
            shape="circle"
            icon={<Search />}
            onClick={() => setShowSearch(!showSearch)}
            style={{ color: "#6B00A1", width: 40, height: 40 }}
          />
        </div>

        {showSearch && (
          <div className={animClass(225)}>
            <Input
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              onPressEnter={handleSimpleSearch}
              allowClear={{ clearIcon: <span onClick={handleCleanSimpleSearch}>x</span> }}
              style={{ width: 220, height: 40, borderRadius: 8 }}
            />
          </div>
        )}

        <div className={animClass(250)}>
          <Button
            type="primary"
            icon={<ZoomIn fontSize="small" />}
            onClick={onToggleFilters}
            style={{ background: "#6B00A1", borderColor: "#6B00A1", height: 40, borderRadius: 8, fontWeight: 600 }}
          >
            Busca avançada
          </Button>
        </div>
      </div>
    </div>
  );
};

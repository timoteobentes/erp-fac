import React, { useState } from "react";
import { Button, Collapse, IconButton, InputAdornment, TextField } from "@mui/material";
import { AddCircleOutline, Refresh, Search, ZoomIn } from "@mui/icons-material";

interface PlanosContasActionsProps {
  onAdd: () => void;
  onRefresh: () => void;
  onToggleFilters: () => void;
  onSearchSimple: (term: string) => void;
  mounted?: boolean;
}

export const PlanosContasActions: React.FC<PlanosContasActionsProps> = ({
  onAdd,
  onRefresh,
  onToggleFilters,
  onSearchSimple,
  mounted = true,
}) => {
  const [showSearch, setShowSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const animClass = (delay: number) =>
    `transition-all duration-300 ${mounted ? `opacity-100 translate-y-0 delay-${delay}` : "opacity-0 translate-y-4"}`;

  const handleSimpleSearch = () => onSearchSimple(searchTerm);

  const handleCleanSimpleSearch = () => {
    setSearchTerm("");
    onSearchSimple("");
    setShowSearch(false);
  };

  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="flex gap-2 flex-wrap">
        <div className={animClass(100)}>
          <Button variant="contained" color="success" startIcon={<AddCircleOutline />} sx={{ color: "#FFFFFF" }} onClick={onAdd}>
            Novo Plano de Conta
          </Button>
        </div>

        <div className={animClass(150)}>
          <Button variant="contained" startIcon={<Refresh />} onClick={onRefresh}>
            Atualizar
          </Button>
        </div>
      </div>

      <div className="flex gap-2 items-center">
        <div className={animClass(200)}>
          <IconButton style={{ color: "#6B00A1" }} onClick={() => setShowSearch(!showSearch)}>
            <Search />
          </IconButton>
        </div>

        <Collapse in={showSearch} orientation="horizontal" timeout={300}>
          <TextField
            size="small"
            placeholder="Buscar por nome..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSimpleSearch()}
            sx={{ width: 220, backgroundColor: "white" }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <button onClick={handleCleanSimpleSearch} className="cursor-pointer hover:font-bold">
                    x
                  </button>
                </InputAdornment>
              ),
            }}
          />
        </Collapse>

        <div className={animClass(250)}>
          <Button startIcon={<ZoomIn />} variant="contained" onClick={onToggleFilters} sx={{ bgcolor: "#6B00A1", "&:hover": { bgcolor: "#3C0473" }, textTransform: "none" }}>
            Busca avancada
          </Button>
        </div>
      </div>
    </div>
  );
};

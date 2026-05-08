import React from "react";
import { FinanceiroQuickActions } from "../../../shared/components/FinanceiroQuickActions";

interface CategoriasDreActionsProps {
  onAdd: () => void;
  onRefresh: () => void;
  onToggleFilters: () => void;
  onSearchSimple: (term: string) => void;
  mounted?: boolean;
}

export const CategoriasDreActions: React.FC<CategoriasDreActionsProps> = ({
  onAdd,
  onRefresh,
  onToggleFilters,
  onSearchSimple,
  mounted = true,
}) => {
  return (
    <FinanceiroQuickActions
      onAdd={onAdd}
      onRefresh={onRefresh}
      onToggleFilters={onToggleFilters}
      onSearchSimple={onSearchSimple}
      addLabel="Adicionar Categoria"
      searchPlaceholder="Buscar por nome..."
      mounted={mounted}
    />
  );
};

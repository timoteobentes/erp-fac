import React from "react";
import { FinanceiroQuickActions } from "../../../shared/components/FinanceiroQuickActions";

interface CentroCustosActionsProps {
  onAdd: () => void;
  onRefresh: () => void;
  onToggleFilters: () => void;
  onSearchSimple: (term: string) => void;
  mounted?: boolean;
}

export const CentroCustosActions: React.FC<CentroCustosActionsProps> = ({
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
      addLabel="Novo Centro de Custo"
      searchPlaceholder="Buscar por nome..."
      mounted={mounted}
    />
  );
};

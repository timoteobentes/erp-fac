import React from "react";
import { FinanceiroQuickActions } from "../../../shared/components/FinanceiroQuickActions";

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
  return (
    <FinanceiroQuickActions
      onAdd={onAdd}
      onRefresh={onRefresh}
      onToggleFilters={onToggleFilters}
      onSearchSimple={onSearchSimple}
      addLabel="Novo Plano de Conta"
      searchPlaceholder="Buscar por nome..."
      mounted={mounted}
    />
  );
};

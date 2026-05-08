import React from "react";
import { FinanceiroQuickActions } from "../../../shared/components/FinanceiroQuickActions";

interface ContasBancariasActionsProps {
  onAdd: () => void;
  onRefresh: () => void;
  onToggleFilters: () => void;
  onSearchSimple: (term: string) => void;
  mounted?: boolean;
}

export const ContasBancariasActions: React.FC<ContasBancariasActionsProps> = ({
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
      addLabel="Nova Conta Bancária"
      searchPlaceholder="Buscar por nome..."
      mounted={mounted}
    />
  );
};

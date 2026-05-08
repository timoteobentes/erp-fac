import React from "react";
import { FinanceiroQuickActions } from "../../../shared/components/FinanceiroQuickActions";

interface FormasPagamentoActionsProps {
  onAdd: () => void;
  onRefresh: () => void;
  onToggleFilters: () => void;
  onSearchSimple: (term: string) => void;
  mounted?: boolean;
}

export const FormasPagamentoActions: React.FC<FormasPagamentoActionsProps> = ({
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
      addLabel="Nova Forma de Pagamento"
      searchPlaceholder="Buscar por nome..."
      mounted={mounted}
    />
  );
};

import { useState } from "react";
import SettingRow from "@/components/molecules/SettingRow";
import SectionCard from "@/components/organisms/SectionCard";

export default function Settings() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [autoConfirmEnabled, setAutoConfirmEnabled] = useState(true);

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
      <SectionCard
        title="Automação"
        description="Controles principais para o comportamento diário do sistema."
      >
        <SettingRow
          label="Notificações"
          description="Receber alertas operacionais por e-mail"
          checked={notificationsEnabled}
          onChange={setNotificationsEnabled}
        />
        <SettingRow
          label="Confirmação rápida"
          description="Sugerir confirmação automática para ações recorrentes"
          checked={autoConfirmEnabled}
          onChange={setAutoConfirmEnabled}
        />
      </SectionCard>

      <SectionCard
        title="Boas práticas de uso"
        description="Diretrizes curtas para manter consistência no fluxo operacional."
      >
        <div className="space-y-3 text-sm leading-6 text-[#2C1810]">
          <p>Revise cadastros antes de publicar mudanças para a equipe.</p>
          <p>Use notificações apenas para eventos realmente críticos.</p>
          <p>Mantenha clientes e agenda atualizados diariamente.</p>
        </div>
      </SectionCard>
    </div>
  );
}

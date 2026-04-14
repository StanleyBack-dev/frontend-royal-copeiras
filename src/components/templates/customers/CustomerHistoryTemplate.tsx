import React from "react";

export interface CustomerHistoryTemplateProps {
  children?: React.ReactNode;
}

export default function CustomerHistoryTemplate({
  children,
}: CustomerHistoryTemplateProps) {
  return (
    <div
      className="w-full h-full bg-white p-0 rounded-xl shadow-sm border overflow-hidden flex flex-col"
      style={{ borderColor: "#e8d5c9" }}
    >
      <div className="px-8 pt-8 pb-0">
        <h2 className="text-2xl font-bold mb-6">Histórico de Clientes</h2>
      </div>
      <div className="flex-1 flex flex-col px-8 pb-8">{children}</div>
    </div>
  );
}

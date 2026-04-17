import React from "react";

export interface UserHistoryTemplateProps {
  children?: React.ReactNode;
}

export default function UserHistoryTemplate({
  children,
}: UserHistoryTemplateProps) {
  return (
    <div
      className="flex h-full w-full flex-col overflow-hidden rounded-xl border bg-white shadow-sm"
      style={{ borderColor: "#e8d5c9" }}
    >
      <div className="px-4 pb-0 pt-5 sm:px-6 sm:pt-6 lg:px-8 lg:pt-8">
        <h2 className="mb-4 text-xl font-bold sm:mb-6 sm:text-2xl">
          Histórico de Usuários
        </h2>
      </div>
      <div className="flex flex-1 flex-col px-4 pb-4 sm:px-6 sm:pb-6 lg:px-8 lg:pb-8">
        {children}
      </div>
    </div>
  );
}

import type { ReactNode } from "react";

interface ManagementPanelTemplateProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}

export default function ManagementPanelTemplate({
  title,
  description,
  actions,
  children,
}: ManagementPanelTemplateProps) {
  return (
    <div
      className="flex h-full w-full flex-col overflow-hidden rounded-xl border bg-white shadow-sm"
      style={{ borderColor: "#e8d5c9" }}
    >
      <div className="flex flex-col gap-3 px-4 pb-0 pt-5 sm:px-6 sm:pt-6 lg:px-8 lg:pt-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <h2 className="text-xl font-bold sm:text-2xl">{title}</h2>
            {description ? (
              <p className="mt-2 max-w-3xl text-sm text-[#7a4430]">
                {description}
              </p>
            ) : null}
          </div>
          {actions ? <div className="shrink-0">{actions}</div> : null}
        </div>
      </div>
      <div className="flex flex-1 flex-col px-4 pb-4 pt-4 sm:px-6 sm:pb-6 lg:px-8 lg:pb-8 lg:pt-6">
        {children}
      </div>
    </div>
  );
}

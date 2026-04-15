import type { ReactNode } from "react";
import { colors, radii, typography } from "../../config";

interface SectionCardProps {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

export default function SectionCard({
  title,
  description,
  action,
  children,
  className = "",
}: SectionCardProps) {
  return (
    <section
      className={`overflow-hidden rounded-2xl border bg-white shadow-sm ${className}`}
      style={{ borderColor: colors.brown[100], borderRadius: radii.lg }}
    >
      <div className="flex flex-col gap-3 border-b px-4 py-4 sm:px-6 sm:py-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <h3
            className="text-base font-semibold sm:text-lg"
            style={{
              color: colors.brown[800],
              fontFamily: typography.fontFamily,
            }}
          >
            {title}
          </h3>
          {description && (
            <p
              className="mt-1 text-sm leading-6"
              style={{
                color: colors.brown[500],
                fontFamily: typography.fontFamily,
              }}
            >
              {description}
            </p>
          )}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      <div className="px-4 py-4 sm:px-6 sm:py-5">{children}</div>
    </section>
  );
}

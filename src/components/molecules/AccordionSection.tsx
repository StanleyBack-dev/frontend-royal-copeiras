import type { ReactNode } from "react";
import { ChevronDown } from "lucide-react";

interface AccordionSectionProps {
  title: string;
  description?: string;
  stepNumber?: number;
  isOpen: boolean;
  onToggle: () => void;
  hasError?: boolean;
  children: ReactNode;
  className?: string;
}

export default function AccordionSection({
  title,
  description,
  stepNumber,
  isOpen,
  onToggle,
  hasError = false,
  children,
  className = "",
}: AccordionSectionProps) {
  return (
    <div
      className={`overflow-hidden rounded-2xl border border-[#e8d5c9] bg-[#faf6f2] ${className}`}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="flex w-full items-start justify-between gap-3 px-4 py-4 text-left sm:px-5"
      >
        <div className="flex items-start gap-3">
          {stepNumber ? (
            <span
              className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                hasError
                  ? "bg-red-100 text-red-700"
                  : "bg-[#e8d5c9] text-[#7a4430]"
              }`}
            >
              {stepNumber}
            </span>
          ) : null}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-[#7a4430]">
              {title}
            </h3>
            {description ? (
              <p className="mt-1 text-sm text-[#7a4430]">{description}</p>
            ) : null}
          </div>
        </div>
        <ChevronDown
          size={20}
          className={`mt-0.5 shrink-0 text-[#7a4430] transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      {isOpen ? (
        <div className="border-t border-[#eadfd6] bg-white/40 px-4 py-4 sm:px-5">
          {children}
        </div>
      ) : null}
    </div>
  );
}

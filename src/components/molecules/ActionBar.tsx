import { useEffect, useRef, useState, type ReactNode } from "react";
import { MoreVertical, X } from "lucide-react";

export interface ActionBarAction {
  key: string;
  label: string;
  icon: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  title?: string;
  tone?: "default" | "danger";
}

interface ActionBarProps {
  primary?: ActionBarAction;
  secondary?: ActionBarAction[];
  className?: string;
}

export default function ActionBar({
  primary,
  secondary = [],
  className = "",
}: ActionBarProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  if (!primary && secondary.length === 0) {
    return null;
  }

  function handleActionClick(action: ActionBarAction) {
    setOpen(false);
    action.onClick();
  }

  function renderMenuItem(action: ActionBarAction, size: "sm" | "lg") {
    const toneClass =
      action.tone === "danger" ? "text-[#c22727]" : "text-[#2C1810]";
    const iconClass =
      action.tone === "danger" ? "text-[#c22727]" : "text-[#C9A227]";

    return (
      <button
        key={action.key}
        type="button"
        onClick={() => handleActionClick(action)}
        disabled={action.disabled}
        title={action.title}
        className={`flex w-full items-center gap-3 text-left font-semibold transition hover:bg-[#f5ede8] disabled:cursor-not-allowed disabled:opacity-50 ${toneClass} ${
          size === "lg" ? "px-5 py-3.5 text-sm" : "px-4 py-2.5 text-sm"
        }`}
      >
        <span className={iconClass}>{action.icon}</span>
        {action.label}
      </button>
    );
  }

  return (
    <div
      className={`flex items-center gap-2 ${className}`}
      ref={containerRef}
    >
      {primary ? (
        <button
          type="button"
          onClick={primary.onClick}
          disabled={primary.disabled}
          title={primary.title}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-gradient-to-tr from-[#C9A227] to-[#a8811a] px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none sm:px-6"
        >
          {primary.icon}
          {primary.label}
        </button>
      ) : null}

      {secondary.length > 0 ? (
        <div className="relative">
          <button
            type="button"
            onClick={() => setOpen((current) => !current)}
            aria-haspopup="true"
            aria-expanded={open}
            title="Mais ações"
            className="flex items-center justify-center rounded-lg border border-[#e8d5c9] p-3 text-[#7a4430] transition hover:bg-[#f5ede8]"
          >
            <MoreVertical size={18} />
          </button>

          {open ? (
            <>
              {/* Menu suspenso no desktop */}
              <div className="absolute left-0 top-full z-20 mt-2 hidden w-56 overflow-hidden rounded-xl border border-[#e8d5c9] bg-white py-1 shadow-xl sm:block">
                {secondary.map((action) => renderMenuItem(action, "sm"))}
              </div>

              {/* Bottom sheet no mobile */}
              <div className="fixed inset-0 z-50 flex items-end sm:hidden">
                <div
                  className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                  onClick={() => setOpen(false)}
                />
                <div className="relative z-10 w-full rounded-t-2xl border border-[#e8d5c4] bg-white shadow-2xl">
                  <div className="flex items-center justify-between border-b border-[#e8d5c9] px-4 py-3">
                    <span className="text-sm font-bold text-[#2C1810]">
                      Mais ações
                    </span>
                    <button
                      type="button"
                      onClick={() => setOpen(false)}
                      className="rounded-full p-1 text-[#7a4430] hover:bg-[#f5ede8]"
                    >
                      <X size={18} />
                    </button>
                  </div>
                  <div className="pb-[max(0.5rem,env(safe-area-inset-bottom))]">
                    {secondary.map((action) => renderMenuItem(action, "lg"))}
                  </div>
                </div>
              </div>
            </>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

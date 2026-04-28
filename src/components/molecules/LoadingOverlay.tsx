import Loading from "@/components/atoms/Loading";

type LoadingOverlayProps = {
  open: boolean;
  label?: string;
  // optional class to customize inner container
  className?: string;
};

export default function LoadingOverlay({
  open,
  label,
  className = "",
}: LoadingOverlayProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      <div className="absolute inset-0 bg-black/40 pointer-events-auto" />
      <div className={`relative z-10 pointer-events-auto ${className}`}>
        <div className="rounded-lg bg-white/95 px-6 py-4 shadow-lg flex items-center gap-4">
          <Loading size={28} label={label || "Carregando..."} />
        </div>
      </div>
    </div>
  );
}

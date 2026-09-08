import { useState } from "react";
import { Link2 } from "lucide-react";
import type { Lead } from "../../../api/leads/schema";
import { getHttpErrorMessage } from "../../../api/shared/http-error";
import { generatePublicIntakeCode } from "../../../api/public-intake/methods";
import type { GeneratedPublicIntakeCode } from "../../../api/public-intake/schema";
import { GeneratedCodeDialog } from "../../public-intake";
import { useToast } from "../../../shared/toast/useToast";

export default function GenerateLinkAction({ lead }: { lead: Lead }) {
  const [generating, setGenerating] = useState(false);
  const [issued, setIssued] = useState<GeneratedPublicIntakeCode | null>(null);
  const { showError } = useToast();

  async function handleGenerate() {
    setGenerating(true);
    try {
      const result = await generatePublicIntakeCode();
      setIssued(result);
    } catch (error) {
      const message = getHttpErrorMessage(error, "Erro ao gerar código");
      showError("Erro ao gerar código", message);
    } finally {
      setGenerating(false);
    }
  }

  return (
    <>
      <button
        type="button"
        title="Gerar link de orçamento para o cliente preencher"
        onClick={() => void handleGenerate()}
        disabled={generating}
        className="hover:text-yellow-700 disabled:opacity-50"
        style={{ display: "flex", alignItems: "center" }}
      >
        <Link2 size={18} />
      </button>
      {issued ? (
        <GeneratedCodeDialog
          issued={issued}
          leadName={lead.name}
          leadPhone={lead.phone}
          onClose={() => setIssued(null)}
        />
      ) : null}
    </>
  );
}

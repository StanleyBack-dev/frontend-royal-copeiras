import { updateContract } from "@/api/contracts/methods";
import { getHttpErrorMessage } from "@/api/shared/http-error";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Select from "@/components/atoms/Select";
import Textarea from "@/components/atoms/Textarea";
import ManagementPanelTemplate from "@/components/templates/management/ManagementPanelTemplate";
import { useAuthSession } from "@/features/auth";
import { contractUiCopy, useContractPdfActions } from "@/features/contracts";
import { useContractsContext } from "@/features/contracts/context/useContractsContext";
import { contractRoutePaths } from "@/router";
import { useToast } from "@/shared/toast/useToast";
import { type Budget, type BudgetItem } from "@/api/budgets/schema";
import {
  inferBudgetServiceType,
  getServiceLabels,
  buildBudgetServiceDescription,
} from "@/features/budgets/model/service-items";
import {
  FileSignature,
  FileText,
  Mail,
  MessageCircle,
  RefreshCcw,
  RotateCcw,
  Save,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { getSignatures } from "@/api/signature/methods";
import type { SignatureListItem } from "@/api/signature/schema";
import CopyIcon from "@/components/atoms/icons/CopyIcon";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

function ContractSignatures({
  contractId,
  userId,
}: {
  contractId?: string;
  userId: string;
}) {
  const [signatures, setSignatures] = useState<SignatureListItem[]>([]);

  useEffect(() => {
    let mounted = true;
    if (!contractId || !userId) return;
    void (async () => {
      try {
        const res = await getSignatures(userId, {
          idContracts: contractId,
          limit: 10,
        });
        if (!mounted) return;
        setSignatures(res.items || []);
      } catch {
        // ignore
      }
    })();

    return () => {
      mounted = false;
    };
  }, [contractId, userId]);

  if (!signatures || signatures.length === 0) {
    return (
      <div className="col-span-2 text-sm text-[#6b4b3a]">
        Nenhuma assinatura registrada.
      </div>
    );
  }

  return (
    <>
      {signatures.map((sig) => (
        <div
          key={sig.idSignatures}
          className="flex items-center justify-between gap-4"
        >
          <div>
            <div className="font-semibold">{sig.signedByName || "—"}</div>
            <div className="text-xs text-[#7a4430]">
              {sig.signedByEmail || sig.signedByDocument || ""}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-xs font-semibold">
              {String(sig.status).toLowerCase()}
            </div>
            {sig.signatureUrl ? (
              <button
                type="button"
                title="Copiar link"
                onClick={() =>
                  void navigator.clipboard.writeText(sig.signatureUrl || "")
                }
                className="text-sky-500"
              >
                <CopyIcon size={16} />
              </button>
            ) : null}
          </div>
        </div>
      ))}
    </>
  );
}

type ContractFormValues = {
  idBudgets: string;
  status: string;
  issueDate: string;
  body: string;
  notes: string;
};

type ContractFormErrors = Partial<Record<keyof ContractFormValues, string>>;

function formatCurrencyBRL(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function formatEventDateWithWeekday(dateString: string) {
  const date = new Date(`${dateString}T12:00:00`);
  if (Number.isNaN(date.getTime())) {
    return dateString;
  }

  const dayMonthYear = new Intl.DateTimeFormat("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
  const weekday = new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
  }).format(date);

  return `${dayMonthYear} (${weekday})`;
}

function formatEventDatesText(eventDates: string[]) {
  if (!eventDates.length) {
    return "a definir";
  }

  if (eventDates.length === 1) {
    return `no dia ${formatEventDateWithWeekday(eventDates[0])}`;
  }

  return eventDates
    .map((eventDate, index) => {
      const prefix = index === 0 ? "no dia" : "e no dia";
      return `${prefix} ${formatEventDateWithWeekday(eventDate)}`;
    })
    .join(", ");
}

function buildServicesAndQuantities(items: BudgetItem[]) {
  if (!items.length) {
    return "1 - servico";
  }

  const grouped = new Map<
    string,
    { quantity: number; singular: string; plural: string }
  >();

  for (const item of items) {
    const safeQuantity =
      Number.isFinite(item.quantity) && item.quantity > 0 ? item.quantity : 1;
    const inferredType = inferBudgetServiceType(item.description);
    const labels = inferredType
      ? getServiceLabels(inferredType)
      : { singular: "servico", plural: "servicos" };
    const groupKey = inferredType || "servico";

    const previous = grouped.get(groupKey);
    if (previous) {
      previous.quantity += safeQuantity;
      grouped.set(groupKey, previous);
      continue;
    }

    grouped.set(groupKey, {
      quantity: safeQuantity,
      singular: labels.singular,
      plural: labels.plural,
    });
  }

  return Array.from(grouped.values())
    .map((entry) => {
      const label = entry.quantity === 1 ? entry.singular : entry.plural;
      return `${entry.quantity} - ${label}`;
    })
    .join(", ");
}

function buildDefaultContractBody(budget: Budget | null) {
  const servicesAndQuantities = buildServicesAndQuantities(budget?.items || []);
  const eventDatesText = formatEventDatesText(budget?.eventDates || []);
  const eventHours = budget?.durationHours
    ? String(budget.durationHours).padStart(2, "0")
    : "08";
  const totalAmount =
    typeof budget?.totalAmount === "number" ? budget.totalAmount : 0;
  const totalAmountLabel = formatCurrencyBRL(totalAmount);
  const advancePercentage =
    typeof budget?.advancePercentage === "number"
      ? budget.advancePercentage
      : 30;

  // build services block: one line per item with quantity, service label and description
  const items = budget?.items || [];

  const buildItemLine = (it: BudgetItem) => {
    const qty =
      Number.isFinite(it.quantity) && it.quantity > 0 ? it.quantity : 1;

    const inferred = inferBudgetServiceType(it.description);

      const rawDesc =
        it.description ||
        (inferred
          ? buildBudgetServiceDescription(inferred as import("@/features/budgets/model/service-items").BudgetServiceType, qty)
          : "Execução do serviço contratado");

    const desc = String(rawDesc)
      .replace(/\r?\n+/g, " ")
      .trim();

    return desc;
  };

  const servicesBlock = items.length
    ? items
        .map((it, index) => {
          const line = buildItemLine(it);
          return `1.1.${index + 1}. ${line}`;
        })
        .join("\n")
    : `1.1.1. ${servicesAndQuantities}`;

  return `CLÁUSULA 1ª - SERVIÇOS CONTRATADOS:

1.1. O presente contrato tem por objeto a prestação de serviços por parte da contratada, consistentes na disponibilização de:
${servicesBlock}  
1.2. Pelo período de ${eventHours} horas consecutivas.
1.3. O evento está previsto para ocorrer ${eventDatesText}.\n\nCLAUSULA 2a - VALOR DO SERVIÇO E FORMA DE PAGAMENTO:\n\n2.1. O valor dos serviços prestados é de ${totalAmountLabel}.\n2.2. O pagamento deverá ser realizado à vista, via pix (CNPJ 64.062.038/0001-71) ou dinheiro. Sendo ${advancePercentage}% do valor antes do evento para confirmação do mesmo e ${100 - advancePercentage}% após o evento. Alternativamente, o contratante poderá optar pelo pagamento integral do valor total à vista, no ato da contratação.\n\nCLAUSULA 3a - RESPONSABILIDADES DO CONTRATANTE:\n\n3.1. O contratante deve informar, com antecedência mínima de 5 dias, quaisquer particularidades do evento que possam impactar a prestação dos serviços, como número de convidados, horários e protocolos específicos a serem seguidos.\n3.2. Caso haja necessidade de serviços adicionais não previstos no contrato, o contratante deverá comunicar a empresa com antecedência e arcar com os custos extras.\n\nCLAUSULA 4a - RESPONSABILIDADES DA CONTRATADA:\n\n4.1. A Royal Copeiras compromete-se a prestar os serviços contratados com profissional qualificada e devidamente treinada para atender as necessidades do evento.\n4.2. A contratada se compromete a garantir a pontualidade e a boa apresentação da equipe durante todo o evento.\n4.3. A contratada se responsabiliza pela supervisão e acompanhamento da equipe para assegurar o cumprimento das atividades conforme o acordado neste contrato.\n\nCLAUSULA 5a - CANCELAMENTO E REEMBOLSO:\n\n5.1. O contratante poderá cancelar o serviço a qualquer momento, desde que o faça com pelo menos 5 dias de antecedência em relação à data do evento.\n5.2. Caso o cancelamento ocorra antes do prazo de 5 dias, o valor pago a título de sinal será devolvido ao contratante de forma integral pela contratada.\n5.3. Se o cancelamento for realizado após o prazo de 5 dias, o contratante não terá direito ao reembolso do sinal já pago.\n\nCLAUSULA 6a - ALTERAÇÕES CONTRATUAIS (ADENDOS E ADITIVOS):\n\n6.1. Este contrato poderá sofrer alterações mediante comum acordo entre as partes, formalizado por meio de adendos ou aditivos contratuais assinados por ambas as partes.\n6.2. As alterações devem ser solicitadas com antecedência mínima de 5 dias antes da data do evento e estarão sujeitas à aprovação da Royal Copeiras.\n6.3. Qualquer alteração de valores, condições ou quantidade de profissionais será formalizada e anexada ao presente contrato como adendo ou aditivo, conforme necessário.\n\nCLAUSULA 7a - VIGÊNCIA:\n\n7.1. O presente contrato tem início na data de sua assinatura e terá vigência até a conclusão de todas as obrigações previstas neste instrumento, podendo ser prorrogado por acordo entre as partes.\n\nCLAUSULA 8a - CONDIÇÕES GERAIS:\n\n8.1. O contratante declara que todas as suas dúvidas sobre os serviços foram devidamente esclarecidas antes da assinatura deste contrato.\n\nDISPOSIÇÕES FINAIS:\n\nPara quaisquer dúvidas ou maiores esclarecimentos, estamos à disposição.\nAtenciosamente,\nEquipe Royal Copeiras`;
}

function buildDefaultFormValues(initialBudgetId?: string): ContractFormValues {
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

  return {
    idBudgets: initialBudgetId || "",
    status: "draft",
    issueDate: today,
    body: "",
    notes: "",
  };
}

export default function ContractForm({ mode }: { mode: "create" | "edit" }) {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { session } = useAuthSession();
  const { showError, showSuccess } = useToast();
  const { contracts, budgets, leads, save, saving, setContracts, load } =
    useContractsContext();

  const initialBudgetId = searchParams.get("budgetId") || undefined;
  const [form, setForm] = useState<ContractFormValues>(
    buildDefaultFormValues(initialBudgetId),
  );
  const [errors, setErrors] = useState<ContractFormErrors>({});

  const editing = useMemo(
    () => contracts.find((contract) => contract.idContracts === id) || null,
    [contracts, id],
  );

  const selectedBudget = useMemo(
    () => budgets.find((budget) => budget.idBudgets === form.idBudgets) || null,
    [budgets, form.idBudgets],
  );

  const selectedLead = useMemo(() => {
    const leadId = selectedBudget?.idLeads || editing?.idLeads;
    if (!leadId) {
      return null;
    }

    return leads.find((lead) => lead.idLeads === leadId) || null;
  }, [editing?.idLeads, leads, selectedBudget?.idLeads]);

  const defaultContractBody = useMemo(
    () => buildDefaultContractBody(selectedBudget),
    [selectedBudget],
  );

  const isNonDraftLocked =
    mode === "edit" && Boolean(editing && editing.status !== "draft");
  const isGenerated = editing?.status === "generated";
  const canSendWhatsApp =
    isNonDraftLocked &&
    (editing?.status === "generated" ||
      editing?.status === "pending_signature");
  const leadHasEmail = Boolean(selectedLead?.email);
  const leadHasPhone = Boolean(selectedLead?.phone);

  useEffect(() => {
    if (!session?.user.idUsers || editing?.status !== "pending_signature") {
      return;
    }

    const intervalId = window.setInterval(() => {
      void load();
    }, 30000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [editing?.status, load, session?.user.idUsers]);

  useEffect(() => {
    if (mode === "edit" && editing) {
      setForm({
        idBudgets: editing.idBudgets,
        status: editing.status,
        issueDate: editing.issueDate || "",
        body: editing.body || "",
        notes: editing.notes || "",
      });
      setErrors({});
      return;
    }

    setForm(buildDefaultFormValues(initialBudgetId));
    setErrors({});
  }, [editing, initialBudgetId, mode]);

  const pdfActions = useContractPdfActions({
    userId: session?.user.idUsers || "",
    contractId: editing?.idContracts,
    contractNumber: editing?.contractNumber,
    onEmailSent: () => {},
  });
  function updateField<K extends keyof ContractFormValues>(
    key: K,
    value: ContractFormValues[K],
  ) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  async function handleSave() {
    if (isNonDraftLocked) {
      return;
    }

    const fieldErrors: ContractFormErrors = {};

    if (!form.idBudgets) {
      fieldErrors.idBudgets = "Selecione um orçamento aprovado.";
    }

    if (!form.issueDate) {
      fieldErrors.issueDate = "Informe a data de emissão.";
    }

    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      return;
    }

    setErrors({});

    const payload = {
      idBudgets: form.idBudgets,
      status: form.status as
        | "draft"
        | "generated"
        | "pending_signature"
        | "signed"
        | "rejected"
        | "expired"
        | "canceled",
      issueDate: form.issueDate,
      body: defaultContractBody,
      notes: form.notes,
    };

    const savedContract = await save(payload, editing);
    if (!savedContract) {
      return;
    }

    if (mode === "create") {
      navigate(contractRoutePaths.edit(savedContract.idContracts), {
        replace: true,
      });
    }
  }

  function updateLocalStatus(
    status: string,
    extra?: Record<string, string | undefined>,
  ) {
    if (!editing) {
      return;
    }

    setContracts((previous) =>
      previous.map((contract) =>
        contract.idContracts === editing.idContracts
          ? {
              ...contract,
              status: status as typeof contract.status,
              ...(extra !== undefined ? extra : {}),
            }
          : contract,
      ),
    );
  }

  async function handleGenerateContract() {
    if (!editing?.idContracts) {
      return;
    }

    try {
      await updateContract(
        editing.idContracts,
        { status: "generated" },
        session?.user.idUsers || "",
      );
      updateLocalStatus("generated");
      showSuccess("Contrato gerado com sucesso");
    } catch (error) {
      const message = getHttpErrorMessage(error, "Erro ao gerar contrato");
      showError("Erro ao gerar contrato", message);
    }
  }

  async function handleRevertToDraft() {
    if (!editing?.idContracts) {
      return;
    }

    try {
      await updateContract(
        editing.idContracts,
        { status: "draft" },
        session?.user.idUsers || "",
      );
      updateLocalStatus("draft", { sentVia: undefined, sentAt: undefined });
      showSuccess("Contrato voltou para rascunho");
    } catch (error) {
      const message = getHttpErrorMessage(error, "Erro ao reverter status");
      showError("Erro ao reverter para rascunho", message);
    }
  }

  async function handleSendEmail() {
    if (!editing?.idContracts) {
      return;
    }

    await pdfActions.sendEmail();
    const now = new Date().toISOString();
    try {
      await updateContract(
        editing.idContracts,
        { sentVia: "email_preview", sentAt: now },
        session?.user.idUsers || "",
      );
    } catch {
      // ignora erro de persistencia, estado local ja foi atualizado
    }
    updateLocalStatus(editing.status, {
      sentVia: "email_preview",
      sentAt: now,
    });
  }

  async function handleSendSignatureRequest() {
    if (!editing?.idContracts) {
      return;
    }

    await pdfActions.sendSignatureRequest();
    const now = new Date().toISOString();
    try {
      await updateContract(
        editing.idContracts,
        { sentVia: "signature_provider", sentAt: now },
        session?.user.idUsers || "",
      );
    } catch {
      // ignora erro de persistencia, estado local ja foi atualizado
    }
    updateLocalStatus("pending_signature", {
      sentVia: "signature_provider",
      sentAt: now,
    });
  }

  async function handleSendWhatsApp() {
    if (!editing?.idContracts || !selectedLead?.phone || !selectedLead?.name) {
      return;
    }

    const outcome = await pdfActions.shareWhatsApp(
      selectedLead.name,
      selectedLead.phone,
    );

    if (outcome === null) {
      return;
    }

    const now = new Date().toISOString();
    try {
      await updateContract(
        editing.idContracts,
        { sentVia: "whatsapp", sentAt: now },
        session?.user.idUsers || "",
      );
    } catch {
      // ignora erro de persistencia, estado local ja foi atualizado
    }
    updateLocalStatus("pending_signature", {
      sentVia: "whatsapp",
      sentAt: now,
    });
  }

  const formGuidanceContent =
    isNonDraftLocked || editing?.sentAt ? (
      <div className="space-y-4">
        {isNonDraftLocked ? (
          <div className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-800">
              Edição bloqueada
            </p>
            <p className="mt-1 text-sm text-amber-900">
              {contractUiCopy.form.notices.nonDraftLocked}
            </p>
          </div>
        ) : null}

        {editing?.sentAt ? (
          <div className="rounded-xl border border-[#e8d5c9] bg-[#faf6f2] px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#7a4430]">
              Envio registrado
            </p>
            <p className="mt-1 text-sm text-[#2c1810]">
              Enviado via{" "}
              <span className="font-semibold">
                {editing.sentVia === "email"
                  ? "E-mail"
                  : editing.sentVia === "email_preview"
                    ? "E-mail (prévia)"
                    : editing.sentVia === "whatsapp"
                      ? "WhatsApp"
                      : editing.sentVia === "signature_provider"
                        ? "Plataforma de assinatura"
                        : editing.sentVia}
              </span>{" "}
              em{" "}
              <span className="font-semibold">
                {new Intl.DateTimeFormat("pt-BR", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                }).format(new Date(editing.sentAt))}
              </span>
            </p>
          </div>
        ) : null}
      </div>
    ) : null;

  const signatureDetailsContent =
    mode === "edit" && editing ? (
      <div className="mt-4 rounded-xl border border-[#e8d5c9] bg-white px-4 py-4">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-semibold text-[#2c1810]">
            {contractUiCopy.form.signature.title}
          </p>
          {editing.status === "pending_signature" ? (
            <span className="inline-flex items-center gap-2 text-xs text-[#7a4430]">
              <RefreshCcw size={14} />
              Atualizacao automatica a cada 30s
            </span>
          ) : null}
        </div>

        <div className="grid grid-cols-1 gap-3 text-sm text-[#2c1810] md:grid-cols-2">
          <ContractSignatures
            contractId={editing.idContracts}
            userId={session?.user.idUsers || ""}
          />
        </div>
      </div>
    ) : null;

  return (
    <ManagementPanelTemplate
      title={
        mode === "edit"
          ? contractUiCopy.form.editTitle
          : contractUiCopy.form.createTitle
      }
      description="Formalize contratos a partir de orçamentos aprovados, com preview em PDF."
      actions={
        <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              navigate(contractRoutePaths.list);
            }}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="primary"
            leftIcon={<Save size={16} />}
            onClick={() => {
              void handleSave();
            }}
            disabled={saving || !session?.user.idUsers || isNonDraftLocked}
          >
            {saving ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      }
    >
      <div className="mb-6 flex justify-center">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5 sm:gap-6">
          <button
            type="button"
            onClick={() => {
              void pdfActions.preview();
            }}
            disabled={
              !editing?.idContracts ||
              pdfActions.previewing ||
              !session?.user.idUsers
            }
            className="flex flex-col items-center gap-2 rounded-lg p-3 transition-colors hover:bg-[#f5ede8] disabled:cursor-not-allowed disabled:opacity-50"
            title="Visualizar previa do contrato"
          >
            <FileText size={32} className="text-[#C9A227]" />
            <span className="text-center text-xs font-semibold text-[#2C1810]">
              {pdfActions.previewing ? "Carregando..." : "Preview"}
            </span>
          </button>

          {!isNonDraftLocked && editing?.idContracts ? (
            <button
              type="button"
              onClick={() => {
                void handleGenerateContract();
              }}
              disabled={!editing?.idContracts || !session?.user.idUsers}
              className="flex flex-col items-center gap-2 rounded-lg p-3 transition-colors hover:bg-[#f5ede8] disabled:cursor-not-allowed disabled:opacity-50"
              title="Gerar contrato"
            >
              <FileSignature size={32} className="text-[#C9A227]" />
              <span className="text-center text-xs font-semibold text-[#2C1810]">
                Gerar
              </span>
            </button>
          ) : null}

          {isNonDraftLocked && isGenerated ? (
            <button
              type="button"
              onClick={() => {
                void handleSendEmail();
              }}
              disabled={
                !editing?.idContracts ||
                !leadHasEmail ||
                !session?.user.idUsers ||
                pdfActions.sendingEmail
              }
              className="flex flex-col items-center gap-2 rounded-lg p-3 transition-colors hover:bg-[#f5ede8] disabled:cursor-not-allowed disabled:opacity-50"
              title={
                leadHasEmail
                  ? "Enviar prévia por e-mail"
                  : "Lead sem e-mail cadastrado"
              }
            >
              <Mail size={32} className="text-[#C9A227]" />
              <span className="text-center text-xs font-semibold text-[#2C1810]">
                {pdfActions.sendingEmail ? "Enviando..." : "Prévia"}
              </span>
            </button>
          ) : null}

          {isNonDraftLocked && isGenerated ? (
            <button
              type="button"
              onClick={() => {
                void handleSendSignatureRequest();
              }}
              disabled={
                !editing?.idContracts ||
                !leadHasEmail ||
                !session?.user.idUsers ||
                pdfActions.sendingSignatureRequest
              }
              className="flex flex-col items-center gap-2 rounded-lg p-3 transition-colors hover:bg-[#f5ede8] disabled:cursor-not-allowed disabled:opacity-50"
              title={
                leadHasEmail
                  ? "Enviar para assinatura online"
                  : "Lead sem e-mail cadastrado"
              }
            >
              <FileSignature size={32} className="text-[#C9A227]" />
              <span className="text-center text-xs font-semibold text-[#2C1810]">
                {pdfActions.sendingSignatureRequest
                  ? "Enviando..."
                  : "Assinatura"}
              </span>
            </button>
          ) : null}

          {canSendWhatsApp ? (
            <button
              type="button"
              onClick={() => {
                void handleSendWhatsApp();
              }}
              disabled={
                !editing?.idContracts ||
                !leadHasPhone ||
                !session?.user.idUsers ||
                pdfActions.sharingWhatsApp
              }
              className="flex flex-col items-center gap-2 rounded-lg p-3 transition-colors hover:bg-[#f5ede8] disabled:cursor-not-allowed disabled:opacity-50"
              title={
                leadHasPhone
                  ? "Compartilhar via WhatsApp"
                  : "Lead sem telefone cadastrado"
              }
            >
              <MessageCircle size={32} className="text-[#C9A227]" />
              <span className="text-center text-xs font-semibold text-[#2C1810]">
                {pdfActions.sharingWhatsApp ? "Compart..." : "WhatsApp"}
              </span>
            </button>
          ) : null}

          {isNonDraftLocked && isGenerated ? (
            <button
              type="button"
              onClick={() => {
                void handleRevertToDraft();
              }}
              disabled={!editing?.idContracts || !session?.user.idUsers}
              className="flex flex-col items-center gap-2 rounded-lg p-3 transition-colors hover:bg-[#f5ede8] disabled:cursor-not-allowed disabled:opacity-50"
              title="Voltar ao rascunho"
            >
              <RotateCcw size={32} className="text-[#C9A227]" />
              <span className="text-center text-xs font-semibold text-[#2C1810]">
                Voltar
              </span>
            </button>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {mode === "edit" && editing ? (
          <>
            <Input
              label="Número do contrato"
              value={editing.contractNumber}
              readOnly
              disabled
            />
            <Input
              label="Criado em"
              value={new Intl.DateTimeFormat("pt-BR", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              }).format(new Date(editing.createdAt))}
              readOnly
              disabled
            />
          </>
        ) : null}

        {formGuidanceContent ? (
          <div className="md:col-span-2">{formGuidanceContent}</div>
        ) : null}

        <Select
          label="Orçamento aprovado *"
          value={form.idBudgets}
          onChange={(event) => updateField("idBudgets", event.target.value)}
          disabled={mode === "edit"}
          required
          error={errors.idBudgets}
        >
          <option value="">Selecione</option>
          {budgets.map((budget) => {
            const lead = leads.find((l) => l.idLeads === budget.idLeads);
            return (
              <option key={budget.idBudgets} value={budget.idBudgets}>
                {budget.budgetNumber}
                {lead ? ` — ${lead.name}` : ""}
              </option>
            );
          })}
        </Select>

        <Select label="Status" value={form.status} onChange={() => {}} disabled>
          <option value="draft">{contractUiCopy.form.options.draft}</option>
          <option value="generated">
            {contractUiCopy.form.options.generated}
          </option>
          <option value="pending_signature">
            {contractUiCopy.form.options.pending_signature}
          </option>
          <option value="signed">{contractUiCopy.form.options.signed}</option>
          <option value="rejected">
            {contractUiCopy.form.options.rejected}
          </option>
          <option value="expired">{contractUiCopy.form.options.expired}</option>
          <option value="canceled">
            {contractUiCopy.form.options.canceled}
          </option>
        </Select>

        <Input
          label="Data de emissão *"
          type="date"
          value={form.issueDate}
          onChange={(event) => updateField("issueDate", event.target.value)}
          disabled={mode === "edit"}
          required
          error={errors.issueDate}
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4">
        <Textarea
          label="Corpo do contrato"
          rows={8}
          value={defaultContractBody}
          readOnly
          disabled
        />
        <Textarea
          label="Observações"
          rows={3}
          value={form.notes}
          onChange={(event) => updateField("notes", event.target.value)}
          disabled={isNonDraftLocked}
        />
      </div>
      {signatureDetailsContent}
    </ManagementPanelTemplate>
  );
}

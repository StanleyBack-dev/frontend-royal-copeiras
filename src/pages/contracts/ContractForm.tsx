import { updateContract } from "@/api/contracts/methods";
import { getHttpErrorMessage } from "@/api/shared/http-error";
import Button from "@/components/atoms/Button";
import ConfirmDialog from "@/components/molecules/ConfirmDialog";
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
  RotateCcw,
  Save,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { getSignatures } from "@/api/signature/methods";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import LoadingOverlay from "@/components/molecules/LoadingOverlay";

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

function parseTimeToMinutes(time?: string) {
  if (!time || !/^\d{2}:\d{2}$/.test(time)) {
    return undefined;
  }

  const [hours, minutes] = time.split(":").map(Number);
  if (
    !Number.isInteger(hours) ||
    !Number.isInteger(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    return undefined;
  }

  return hours * 60 + minutes;
}

function addOneDayIsoDate(date: string) {
  const parsed = new Date(`${date}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  parsed.setDate(parsed.getDate() + 1);
  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const day = String(parsed.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatEventScheduleText(
  eventDates: string[],
  eventArrivalTimes: string[],
  eventDepartureTimes: string[],
) {
  const dayCount = Math.max(
    eventDates.length,
    eventArrivalTimes.length,
    eventDepartureTimes.length,
  );

  if (!dayCount) {
    return "com horários de chegada e partida a definir";
  }

  if (dayCount === 1) {
    const arrival = eventArrivalTimes[0] || "a definir";
    const departure = eventDepartureTimes[0] || "a definir";
    const arrivalMinutes = parseTimeToMinutes(arrival);
    const departureMinutes = parseTimeToMinutes(departure);
    const isNextDay =
      arrivalMinutes !== undefined &&
      departureMinutes !== undefined &&
      departureMinutes > 0 &&
      departureMinutes < arrivalMinutes;

    if (isNextDay && eventDates[0]) {
      return `com chegada às ${arrival} e saída em ${formatEventDateWithWeekday(addOneDayIsoDate(eventDates[0]))} (dia seguinte), às ${departure}`;
    }

    return `com chegada às ${arrival} e saída às ${departure}`;
  }

  const lines = Array.from({ length: dayCount }, (_, index) => {
    const dateLabel = eventDates[index]
      ? formatEventDateWithWeekday(eventDates[index])
      : `${index + 1}o dia`;
    const arrival = eventArrivalTimes[index] || "a definir";
    const departure = eventDepartureTimes[index] || "a definir";
    const arrivalMinutes = parseTimeToMinutes(arrival);
    const departureMinutes = parseTimeToMinutes(departure);
    const isNextDay =
      arrivalMinutes !== undefined &&
      departureMinutes !== undefined &&
      departureMinutes > 0 &&
      departureMinutes < arrivalMinutes;

    const departureDateLabel =
      isNextDay && eventDates[index]
        ? `${formatEventDateWithWeekday(addOneDayIsoDate(eventDates[index]))} (dia seguinte)`
        : dateLabel;

    if (departureDateLabel === dateLabel) {
      return `no dia ${dateLabel}, chegada às ${arrival} e saída às ${departure}`;
    }

    return `no dia ${dateLabel}, chegada às ${arrival} e saída em ${departureDateLabel}, às ${departure}`;
  });

  return `com a seguinte programação: ${lines.join("; ")}`;
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
  const eventScheduleText = formatEventScheduleText(
    budget?.eventDates || [],
    budget?.eventArrivalTimes || [],
    budget?.eventDepartureTimes || [],
  );
  const eventHours = budget?.durationHours
    ? String(budget.durationHours).padStart(2, "0")
    : "08";
  const totalAmount =
    typeof budget?.totalAmount === "number" ? budget.totalAmount : 0;
  const totalAmountLabel = formatCurrencyBRL(totalAmount);
  const displacementFee =
    typeof budget?.displacementFee === "number" ? budget.displacementFee : 0;
  const displacementFeeLabel = formatCurrencyBRL(displacementFee);
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
        ? buildBudgetServiceDescription(
            inferred as import("@/features/budgets/model/service-items").BudgetServiceType,
            qty,
          )
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

  const displacementClause =
    displacementFee > 0
      ? `\n1.4. O presente contrato inclui uma taxa de deslocamento no valor de ${displacementFeeLabel}, referente ao deslocamento da equipe ao local do evento, conforme acordado entre as partes.`
      : "";

  return `CLÁUSULA 1ª - SERVIÇOS CONTRATADOS:

1.1. O presente contrato tem por objeto a prestação de serviços por parte da contratada, consistentes na disponibilização de:
${servicesBlock}  
1.2. Pelo período de ${eventHours} horas consecutivas.
1.3. O evento está previsto para ocorrer ${eventDatesText}, ${eventScheduleText}.${displacementClause}\n\nCLAUSULA 2a - VALOR DO SERVIÇO E FORMA DE PAGAMENTO:\n\n2.1. O valor dos serviços prestados é de ${totalAmountLabel}${displacementFee > 0 ? `, sendo ${displacementFeeLabel} referente à taxa de deslocamento` : ""}.\n2.2. O pagamento deverá ser realizado à vista, via pix (CNPJ 64.062.038/0001-71) ou dinheiro. Sendo ${advancePercentage}% do valor antes do evento para confirmação do mesmo e ${100 - advancePercentage}% após o evento. Alternativamente, o contratante poderá optar pelo pagamento integral do valor total à vista, no ato da contratação.\n2.3. Caso a prestação dos serviços ultrapasse o horário previamente acordado, será necessário contratar horas adicionais, no valor de R$ 90,00 (noventa reais) por hora extra, por profissional.\n\nCLAUSULA 3a - RESPONSABILIDADES DO CONTRATANTE:\n\n3.1. O contratante deve informar, com antecedência mínima de 5 dias, quaisquer particularidades do evento que possam impactar a prestação dos serviços, como número de convidados, horários e protocolos específicos a serem seguidos.\n3.2. Caso haja necessidade de serviços adicionais não previstos no contrato, o contratante deverá comunicar a empresa com antecedência e arcar com os custos extras.\n\nCLAUSULA 4a - RESPONSABILIDADES DA CONTRATADA:\n\n4.1. A Royal Copeiras compromete-se a prestar os serviços contratados com profissional qualificada e devidamente treinada para atender as necessidades do evento.\n4.2. A contratada se compromete a garantir a pontualidade e a boa apresentação da equipe durante todo o evento.\n4.3. A contratada se responsabiliza pela supervisão e acompanhamento da equipe para assegurar o cumprimento das atividades conforme o acordado neste contrato.\n\nCLAUSULA 5a - CANCELAMENTO E REEMBOLSO:\n\n5.1. O contratante poderá cancelar o serviço a qualquer momento, desde que o faça com pelo menos 5 dias de antecedência em relação à data do evento.\n5.2. Caso o cancelamento ocorra antes do prazo de 5 dias, o valor pago a título de sinal será devolvido ao contratante de forma integral pela contratada.\n5.3. Se o cancelamento for realizado após o prazo de 5 dias, o contratante não terá direito ao reembolso do sinal já pago.\n\nCLAUSULA 6a - ALTERAÇÕES CONTRATUAIS (ADENDOS E ADITIVOS):\n\n6.1. Este contrato poderá sofrer alterações mediante comum acordo entre as partes, formalizado por meio de adendos ou aditivos contratuais assinados por ambas as partes.\n6.2. As alterações devem ser solicitadas com antecedência mínima de 5 dias antes da data do evento e estarão sujeitas à aprovação da Royal Copeiras.\n6.3. Qualquer alteração de valores, condições ou quantidade de profissionais será formalizada e anexada ao presente contrato como adendo ou aditivo, conforme necessário.\n\nCLAUSULA 7a - VIGÊNCIA:\n\n7.1. O presente contrato tem início na data de sua assinatura e terá vigência até a conclusão de todas as obrigações previstas neste instrumento, podendo ser prorrogado por acordo entre as partes.\n\nCLAUSULA 8a - CONDIÇÕES GERAIS:\n\n8.1. O contratante declara que todas as suas dúvidas sobre os serviços foram devidamente esclarecidas antes da assinatura deste contrato.\n\nCLAUSULA 9a - DOS MATERIAIS DE LIMPEZA:\n\n9.1. A CONTRATADA se responsabiliza por disponibilizar, para a adequada execução dos serviços durante o evento, os seguintes materiais de limpeza: desinfetante, aromatizante de ambiente (cheirinho de banheiro), pano de chão, rodo, vassoura, pá de lixo, sacos de lixo, luvas e álcool.\n9.2. Caso o CONTRATANTE deseje a inclusão de papel toalha e papel higiênico, este valor será cobrado à parte e adicionado ao valor total do serviço. Ressalta-se que os materiais mencionados acima serão utilizados exclusivamente para a manutenção da organização, higiene e limpeza dos ambientes relacionados ao serviço contratado.\n\nDISPOSIÇÕES FINAIS:\n\nPara quaisquer dúvidas ou maiores esclarecimentos, estamos à disposição.\nAtenciosamente,\nEquipe Royal Copeiras`;
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
  const { contracts, budgets, leads, save, saving, setContracts } =
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
  const leadHasEmail = Boolean(selectedLead?.email);
  const leadHasPhone = Boolean(selectedLead?.phone);
  const [confirmSendEmail, setConfirmSendEmail] = useState(false);
  const [confirmSendSignature, setConfirmSendSignature] = useState(false);

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
      await updateContract(editing.idContracts, { status: "generated" });
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
      await updateContract(editing.idContracts, { status: "draft" });
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
      await updateContract(editing.idContracts, {
        sentVia: "email_preview",
        sentAt: now,
      });
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
      await updateContract(editing.idContracts, {
        sentVia: "signature_provider",
        sentAt: now,
      });
    } catch {
      // ignora erro de persistencia, estado local ja foi atualizado
    }
    updateLocalStatus("pending_signature", {
      sentVia: "signature_provider",
      sentAt: now,
    });

    try {
      let signatureUrl: string | undefined;
      for (let i = 0; i < 6; i++) {
        const res = await getSignatures({
          idContracts: editing.idContracts,
          limit: 10,
        });
        const items = res.items || [];
        const match = items.find((s) => {
          if (selectedLead?.email && s.signedByEmail) {
            return (
              String(s.signedByEmail).toLowerCase() ===
              String(selectedLead.email).toLowerCase()
            );
          }
          const name = (s.signedByName || "").toLowerCase().trim();
          return name && selectedLead?.name
            ? selectedLead.name.toLowerCase().includes(name)
            : false;
        });
        signatureUrl = match?.signatureUrl || undefined;
        if (signatureUrl) break;
        // wait 1s before retry
        await new Promise((r) => setTimeout(r, 1000));
      }

      if (signatureUrl && selectedLead?.phone) {
        const digits = selectedLead.phone.replace(/\D/g, "");
        const normalized = digits.startsWith("55") ? digits : `55${digits}`;
        const text = `Olá, ${selectedLead.name}! Enviamos a solicitação de assinatura. Assine aqui: ${signatureUrl}`;
        window.open(
          `https://wa.me/${normalized}?text=${encodeURIComponent(text)}`,
          "_blank",
        );
      }
    } catch {
      // ignore errors on redirect attempt
    }
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
      await updateContract(editing.idContracts, {
        sentVia: "whatsapp",
        sentAt: now,
      });
    } catch {
      // ignora erro de persistencia, estado local ja foi atualizado
    }
    updateLocalStatus(editing.status, {
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
      <LoadingOverlay
        open={pdfActions.sendingSignatureRequest}
        label="Enviando para assinatura..."
      />
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
            <>
              <button
                type="button"
                onClick={() => {
                  setConfirmSendEmail(true);
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
                  {pdfActions.sendingEmail ? "Enviando..." : "Email"}
                </span>
              </button>
              <ConfirmDialog
                open={confirmSendEmail}
                title="Enviar por e-mail"
                description={
                  <p>
                    Você está prestes a enviar a prévia deste contrato por
                    e-mail para o lead selecionado.
                    <br />
                    <br />
                    Deseja continuar?
                  </p>
                }
                confirmLabel="Sim, enviar"
                cancelLabel="Voltar"
                onConfirm={() => {
                  setConfirmSendEmail(false);
                  void handleSendEmail();
                }}
                onCancel={() => setConfirmSendEmail(false)}
              />

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
                <MessageCircle size={32} className="text-[#25D366]" />
                <span className="text-center text-xs font-semibold text-[#2C1810]">
                  {pdfActions.sharingWhatsApp ? "Compart..." : "WhatsApp"}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setConfirmSendSignature(true);
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
              <ConfirmDialog
                open={confirmSendSignature}
                title="Enviar para assinatura"
                description={
                  <p>
                    Você está prestes a enviar este contrato para assinatura
                    online. O lead receberá um e-mail com o link para assinar.
                    <br />
                    <br />
                    Deseja continuar?
                  </p>
                }
                confirmLabel="Sim, enviar"
                cancelLabel="Voltar"
                onConfirm={() => {
                  setConfirmSendSignature(false);
                  void handleSendSignatureRequest();
                }}
                onCancel={() => setConfirmSendSignature(false)}
              />
            </>
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
    </ManagementPanelTemplate>
  );
}

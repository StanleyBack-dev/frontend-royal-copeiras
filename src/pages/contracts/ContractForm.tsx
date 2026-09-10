import { updateContract } from "@/api/contracts/methods";
import { getHttpErrorMessage } from "@/api/shared/http-error";
import ActionBar, {
  type ActionBarAction,
} from "@/components/molecules/ActionBar";
import Button from "@/components/atoms/Button";
import ConfirmDialog from "@/components/molecules/ConfirmDialog";
import Input from "@/components/atoms/Input";
import Select from "@/components/atoms/Select";
import StatusBadge from "@/components/atoms/StatusBadge";
import {
  getContractStatusLabel,
  getContractStatusTone,
} from "@/features/contracts/model/status";
import Textarea from "@/components/atoms/Textarea";
import ManagementPanelTemplate from "@/components/templates/management/ManagementPanelTemplate";
import { useAuthSession } from "@/features/auth";
import { contractUiCopy, useContractPdfActions } from "@/features/contracts";
import { useContractsContext } from "@/features/contracts/context/useContractsContext";
import { fetchContracts } from "@/features/contracts/services/contract.service";
import {
  budgetRoutePaths,
  contractRoutePaths,
  paymentRoutePaths,
} from "@/router";
import { getEvents } from "@/api/events/methods";
import { useToast } from "@/shared/toast/useToast";
import { type Budget, type BudgetItem } from "@/api/budgets/schema";
import {
  isFeminineSupplyUnit,
  pluralizeSupplyUnit,
} from "@/features/supplies/model/units";
import {
  inferBudgetServiceType,
  getServiceLabels,
  buildBudgetServiceDescription,
  getServiceGender,
} from "@/features/budgets/model/service-items";
import type { BudgetServiceType } from "@/features/budgets/model/service-items";
import {
  formatCurrencyExtended,
  formatDateTimeDisplay,
  getSentViaLabel,
} from "@/utils/format";
import {
  Archive,
  Copy,
  FileText,
  Mail,
  MessageCircle,
  PenLine,
  RotateCcw,
  Wallet,
  X,
  Save,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  CONTRACTOR_FIELD_GROUPS,
  CONTRACTOR_FIELD_KEYS,
  contractorPaymentReference,
  contractorTradeName,
  contractorValuesToPayload,
  fetchCompanyProfile,
  mapContractPartyToContractorValues,
  mapProfileToContractorValues,
  PIX_KEY_TYPE_LABELS,
  type ContractorFieldKey,
  type ContractorValues,
} from "@/features/company-profile";
import { PIX_KEY_TYPE_OPTIONS } from "@/api/company-profile/schema";
import type { CompanyProfile } from "@/api/company-profile/schema";
import { getSignatures } from "@/api/signature/methods";
import { cancelSignatureRequest } from "@/api/signature/methods/cancel-request";
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

function allEqual<T>(values: T[]): boolean {
  return values.length > 0 && values.every((value) => value === values[0]);
}

function dayLabel(eventDates: string[], index: number) {
  return eventDates[index]
    ? `no dia ${formatEventDateWithWeekday(eventDates[index])}`
    : `no ${index + 1}º dia`;
}

function buildEventLocationText(eventDates: string[], locations: string[]) {
  const trimmed = locations.map((location) => location?.trim() || "");

  if (!trimmed.some(Boolean)) {
    return "local a definir";
  }

  if (allEqual(trimmed)) {
    return trimmed[0] || "local a definir";
  }

  return trimmed
    .map(
      (location, index) =>
        `${dayLabel(eventDates, index)}, no local ${location || "a definir"}`,
    )
    .join("; ");
}

function buildDurationClauseText(eventDates: string[], durations: number[]) {
  const validDurations = durations.filter(
    (duration) => Number.isFinite(duration) && duration > 0,
  );

  if (!validDurations.length) {
    return "Pelo período de 08 horas consecutivas.";
  }

  if (allEqual(durations)) {
    return `Pelo período de ${String(durations[0]).padStart(2, "0")} horas consecutivas.`;
  }

  const parts = durations.map((duration, index) => {
    const hours =
      Number.isFinite(duration) && duration > 0
        ? String(duration).padStart(2, "0")
        : "08";
    return `${dayLabel(eventDates, index)} por ${hours} horas consecutivas`;
  });

  return `Sendo ${parts.join(", ")}.`;
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

function buildServicesBlockPerDay(
  items: BudgetItem[],
  eventDates: string[],
  buildItemLine: (item: BudgetItem) => string,
): string {
  const byDay = new Map<number, BudgetItem[]>();

  items.forEach((item) => {
    const day = item.eventDateIndex ?? 0;
    const existing = byDay.get(day) ?? [];
    existing.push(item);
    byDay.set(day, existing);
  });

  const sortedDays = Array.from(byDay.keys()).sort(
    (left, right) => left - right,
  );
  const lines: string[] = [];
  let clauseIndex = 1;

  sortedDays.forEach((day) => {
    const label = dayLabel(eventDates, day);
    const capitalizedLabel = `${label.charAt(0).toUpperCase()}${label.slice(1)}`;
    lines.push(`1.1.${clauseIndex}. ${capitalizedLabel}:`);
    clauseIndex += 1;
    byDay.get(day)!.forEach((item) => {
      lines.push(`   - ${buildItemLine(item)}`);
    });
  });

  return lines.join("\n");
}

function buildDefaultContractBody(
  budget: Budget | null,
  contractor: ContractorValues,
) {
  const tradeName = contractorTradeName(contractor);
  const paymentReference = contractorPaymentReference(contractor);
  const servicesAndQuantities = buildServicesAndQuantities(budget?.items || []);
  const eventDates = budget?.eventDates || [];
  const eventDatesText = formatEventDatesText(eventDates);
  const eventLocationText = buildEventLocationText(
    eventDates,
    budget?.eventLocation || [],
  );
  const eventScheduleText = formatEventScheduleText(
    budget?.eventDates || [],
    budget?.eventArrivalTimes || [],
    budget?.eventDepartureTimes || [],
  );
  const durationClauseText = buildDurationClauseText(
    eventDates,
    budget?.durationHours || [],
  );
  const totalAmount =
    typeof budget?.totalAmount === "number" ? budget.totalAmount : 0;
  const totalAmountLabel = formatCurrencyExtended(totalAmount);
  const displacementPerDay = (budget?.displacementFee || []).map((value) =>
    typeof value === "number" ? value : 0,
  );
  const displacementFee = displacementPerDay.reduce(
    (sum, value) => sum + value,
    0,
  );
  const displacementFeeLabel = formatCurrencyExtended(displacementFee);
  const displacementPerDayParts = displacementPerDay
    .map((value, index) => ({ value, day: index + 1 }))
    .filter((entry) => entry.value > 0)
    .map(
      (entry) =>
        `${formatCurrencyExtended(entry.value)} referente ao ${entry.day}º dia`,
    );
  const displacementValueText =
    displacementPerDayParts.length > 1
      ? `no valor total de ${displacementFeeLabel}, sendo ${displacementPerDayParts.join(
          ", ",
        )}`
      : `no valor de ${displacementFeeLabel}`;
  const advancePercentage =
    typeof budget?.advancePercentage === "number"
      ? budget.advancePercentage
      : 30;

  // Staffing lines feed Cláusula 1ª and 5.4; material/supply lines feed 3.2.
  const allItems = budget?.items || [];
  const items = allItems.filter((it) => it.itemType !== "SUPPLY");
  const supplyItems = allItems.filter((it) => it.itemType === "SUPPLY");

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

  const servicesBlock = !items.length
    ? `1.1.1. ${servicesAndQuantities}`
    : eventDates.length <= 1
      ? items
          .map((it, index) => {
            const line = buildItemLine(it);
            return `1.1.${index + 1}. ${line}`;
          })
          .join("\n")
      : buildServicesBlockPerDay(items, eventDates, buildItemLine);

  const displacementClause =
    displacementFee > 0
      ? `\n1.4. O presente contrato inclui uma taxa de deslocamento ${displacementValueText}, referente ao deslocamento da equipe ao local do evento, conforme acordado entre as partes.`
      : "";

  function numberToPtWords(
    n: number,
    gender: "masculine" | "feminine" = "masculine",
  ) {
    if (!Number.isFinite(n)) return String(n);
    const num = Math.abs(Math.trunc(n));

    const unitsMasculine: Record<number, string> = {
      0: "zero",
      1: "um",
      2: "dois",
      3: "três",
      4: "quatro",
      5: "cinco",
      6: "seis",
      7: "sete",
      8: "oito",
      9: "nove",
      10: "dez",
      11: "onze",
      12: "doze",
      13: "treze",
      14: "quatorze",
      15: "quinze",
      16: "dezesseis",
      17: "dezessete",
      18: "dezoito",
      19: "dezenove",
    };

    const unitsFeminine: Record<number, string> = {
      ...unitsMasculine,
      1: "uma",
      2: "duas",
    };

    const tens: Record<number, string> = {
      20: "vinte",
      30: "trinta",
      40: "quarenta",
      50: "cinquenta",
      60: "sessenta",
      70: "setenta",
      80: "oitenta",
      90: "noventa",
    };

    const hundreds: Record<number, string> = {
      100: "cem",
      200: "duzentos",
      300: "trezentos",
      400: "quatrocentos",
      500: "quinhentos",
      600: "seiscentos",
      700: "setecentos",
      800: "oitocentos",
      900: "novecentos",
    };

    const units = gender === "feminine" ? unitsFeminine : unitsMasculine;

    function belowThousand(value: number): string {
      if (value === 0) return "";
      if (value < 20) return units[value];
      if (value < 100) {
        const t = Math.floor(value / 10) * 10;
        const r = value % 10;
        return r === 0 ? tens[t] : `${tens[t]} e ${units[r]}`;
      }
      if (value < 1000) {
        const h = Math.floor(value / 100) * 100;
        const r = value % 100;
        if (value === 100) return "cem";
        const hText = hundreds[h] || "";
        if (r === 0) return hText;
        return `${hText} e ${belowThousand(r)}`;
      }
      return "";
    }

    if (num < 1000) return belowThousand(num);

    if (num < 1000000) {
      const thousands = Math.floor(num / 1000);
      const rest = num % 1000;
      const thousandsText =
        thousands === 1 ? "mil" : `${belowThousand(thousands)} mil`;
      if (rest === 0) return thousandsText;
      const sep = rest < 100 ? " e " : " ";
      return `${thousandsText}${sep}${belowThousand(rest)}`;
    }

    // fallback for larger numbers
    return String(n);
  }

  const guestCounts = budget?.guestCount || [];
  const validGuestCounts = guestCounts.filter(
    (value) => Number.isFinite(value) && value > 0,
  );

  const guestCountLabel = !validGuestCounts.length
    ? null
    : allEqual(guestCounts)
      ? `${guestCounts[0]} (${numberToPtWords(guestCounts[0])}) convidados`
      : guestCounts
          .map((count, index) =>
            Number.isFinite(count) && count > 0
              ? `${dayLabel(eventDates, index)}, ${count} (${numberToPtWords(count)}) convidados`
              : null,
          )
          .filter((value): value is string => Boolean(value))
          .join("; ");

  const replacementList = items.length
    ? items
        .map((it) => {
          const qty =
            it.quantity && Number.isFinite(it.quantity) && it.quantity > 0
              ? it.quantity
              : 1;
          const serviceType = inferBudgetServiceType(
            it.description,
          ) as BudgetServiceType;
          const labels = serviceType ? getServiceLabels(serviceType) : null;
          const label = labels
            ? qty === 1
              ? labels.singular
              : labels.plural
            : String(it.description || "serviço").toLowerCase() +
              (qty === 1 ? "" : "s");
          const gender = serviceType
            ? getServiceGender(serviceType)
            : String(label).toLowerCase().endsWith("a")
              ? "feminine"
              : "masculine";
          const qtyWords = numberToPtWords(qty, gender);
          return `${qty} (${qtyWords}) ${label}`;
        })
        .join(", ")
    : "copeira, garçom, recepcionista, segurança ou similares";

  const replacementClause = `\n5.4. A contratada responsabiliza-se pela substituição de qualquer profissional contratado ${replacementList} em caso de ausência, atraso ou impossibilidade de comparecimento, sem custos adicionais à contratante.`;

  const penaltyClause = `\n5.5. Em caso de descumprimento, pela CONTRATADA, das obrigações previstas nas Cláusulas 5.1 a 5.3 (pontualidade, qualidade e adequação da equipe, fornecimento dos materiais previstos na Cláusula 3ª), a CONTRATADA sujeitar-se-á à multa de 10% (dez por cento) sobre o valor total do contrato, sem prejuízo do direito da CONTRATANTE de exigir o cumprimento da obrigação ou de rescindir o contrato, bem como de pleitear indenização por perdas e danos comprovados.`;

  // Cláusula 3.2 — mirror do backend: quando o orçamento tem materiais, lista-os
  // com a frase padrão "qtd unidade de nome"; senão mantém o texto genérico.
  const buildSupplyLine = (it: BudgetItem) => {
    const qty =
      Number.isFinite(it.quantity) && it.quantity > 0 ? it.quantity : 1;
    const name = String(it.supply || it.description || "material")
      .trim()
      .toLowerCase();
    const rawUnit = String(it.unit || "unidade").trim();
    const qtyWords = numberToPtWords(
      qty,
      isFeminineSupplyUnit(rawUnit) ? "feminine" : "masculine",
    );
    return `${qty} (${qtyWords}) ${pluralizeSupplyUnit(rawUnit, qty)} de ${name}`;
  };

  const suppliesClause = supplyItems.length
    ? `3.2. A CONTRATADA fornecerá ainda os seguintes materiais, cujos valores já estão incluídos no valor total deste contrato: ${supplyItems
        .map((it) => buildSupplyLine(it))
        .join(
          "; ",
        )}. Ressalta-se que os materiais mencionados serão utilizados exclusivamente para a manutenção da organização, higiene e limpeza dos ambientes relacionados ao serviço contratado.`
    : `3.2. Caso o contratante deseje a inclusão de papel toalha e papel higiênico, este valor será cobrado à parte e adicionado ao valor total do serviço. Ressalta-se que os materiais mencionados acima serão utilizados exclusivamente para a manutenção da organização, higiene e limpeza dos ambientes relacionados ao serviço contratado.`;

  return `CLÁUSULA 1ª - SERVIÇOS CONTRATADOS:\n\n1.1. O presente contrato tem por objeto a prestação de serviços por parte da contratada, consistentes na disponibilização de:\n${servicesBlock}\n1.2. ${durationClauseText}\n1.3. O evento está previsto para ocorrer ${eventDatesText}, ${eventScheduleText}, ${guestCountLabel ? `com previsão de ${guestCountLabel},` : ""} no local ${eventLocationText}.${displacementClause}\n\nCLÁUSULA 2ª - VALOR DO SERVIÇO E FORMA DE PAGAMENTO:\n\n2.1. O valor dos serviços prestados é de ${totalAmountLabel}${displacementFee > 0 ? `, sendo ${displacementFeeLabel} referente à taxa de deslocamento` : ""}.\n2.2. O pagamento deverá ser realizado à vista, via pix (${paymentReference}) ou dinheiro. Sendo ${advancePercentage}% do valor antes do evento para confirmação do mesmo e ${100 - advancePercentage}% após o evento. Alternativamente, o contratante poderá optar pelo pagamento integral do valor total à vista, no ato da contratação.\n2.3. Caso a prestação dos serviços ultrapasse o horário previamente acordado, será necessário contratar horas adicionais, no valor de R$ 90,00 (noventa reais) por hora extra, por profissional.\n\nCLÁUSULA 3ª - DOS MATERIAIS DE LIMPEZA:\n\n3.1. A contratada se responsabiliza por disponibilizar, para a adequada execução dos serviços durante o evento, os seguintes materiais de limpeza: desinfetante, aromatizante de ambiente (cheirinho de banheiro), pano de chão, rodo, vassoura, pá de lixo, sacos de lixo, luvas e álcool.\n${suppliesClause}\n\nCLÁUSULA 4ª - RESPONSABILIDADES DO CONTRATANTE:\n\n4.1. O contratante deve informar, com antecedência mínima de 5 dias, quaisquer particularidades do evento que possam impactar a prestação dos serviços, como número de convidados, horários e protocolos específicos a serem seguidos.\n4.2. Caso haja necessidade de serviços adicionais não previstos no contrato, o contratante deverá comunicar a empresa com antecedência e arcar com os custos extras.\n\nCLÁUSULA 5ª - RESPONSABILIDADES DA CONTRATADA:\n\n5.1. A ${tradeName} compromete-se a cumprir rigorosamente os horários acordados para a prestação dos serviços, garantindo a pontualidade da equipe designada para o evento.\n5.2. A ${tradeName} compromete-se a prestar os serviços contratados com equipe qualificada, assegurando a adequação técnica e comportamental dos profissionais designados.\n5.3. A contratada se responsabiliza pelo fornecimento dos materiais previstos na Cláusula 3ª, necessários à adequada execução dos serviços contratados.${replacementClause}${penaltyClause}\n\nCLÁUSULA 6ª - CANCELAMENTO E REEMBOLSO:\n\n6.1. O contratante poderá cancelar o serviço a qualquer momento, desde que o faça com pelo menos 5 dias de antecedência em relação à data do evento.\n6.2. Caso o cancelamento ocorra antes do prazo de 5 dias, o valor pago a título de sinal será devolvido ao contratante de forma integral pela contratada.\n6.3. Se o cancelamento for realizado após o prazo de 5 dias, o contratante não terá direito ao reembolso do sinal já pago.\n\nCLÁUSULA 7ª - ALTERAÇÕES CONTRATUAIS (ADENDOS E ADITIVOS):\n\n7.1. Este contrato poderá sofrer alterações mediante comum acordo entre as partes, formalizado por meio de adendos ou aditivos contratuais assinados por ambas as partes.\n7.2. As alterações devem ser solicitadas com antecedência mínima de 5 dias antes da data do evento e estarão sujeitas à aprovação da ${tradeName}.\n7.3. Qualquer alteração de valores, condições ou quantidade de profissionais será formalizada e anexada ao presente contrato como adendo ou aditivo, conforme necessário.\n\nCLÁUSULA 8ª - VIGÊNCIA:\n\n8.1. O presente contrato tem início na data de sua assinatura e terá vigência até a conclusão de todas as obrigações previstas neste instrumento, podendo ser prorrogado por acordo entre as partes.\n\nCLÁUSULA 9ª - CONDIÇÕES GERAIS:\n\n9.1. O contratante declara que todas as suas dúvidas sobre os serviços foram devidamente esclarecidas antes da assinatura deste contrato.\n\nDISPOSIÇÕES FINAIS:\n\nPara quaisquer dúvidas ou maiores esclarecimentos, estamos à disposição.\nAtenciosamente,\nEquipe ${tradeName}`;
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

  // Only approved budgets that don't already have a contract can back a new
  // one — keeping the currently-selected id visible so the edit view (and a
  // ?budgetId deep-link) still renders its option.
  const budgetsWithContract = useMemo(
    () => new Set(contracts.map((contract) => contract.idBudgets)),
    [contracts],
  );
  const selectableBudgets = useMemo(
    () =>
      budgets.filter(
        (budget) =>
          budget.idBudgets === form.idBudgets ||
          (budget.status === "approved" &&
            !budgetsWithContract.has(budget.idBudgets)),
      ),
    [budgets, budgetsWithContract, form.idBudgets],
  );

  const selectedLead = useMemo(() => {
    const leadId = selectedBudget?.idLeads || editing?.idLeads;
    if (!leadId) {
      return null;
    }

    return leads.find((lead) => lead.idLeads === leadId) || null;
  }, [editing?.idLeads, leads, selectedBudget?.idLeads]);

  const [companyProfile, setCompanyProfile] = useState<CompanyProfile | null>(
    null,
  );
  const [contractor, setContractor] = useState<ContractorValues>(() =>
    mapProfileToContractorValues(null),
  );
  const [showContractor, setShowContractor] = useState(false);

  useEffect(() => {
    let active = true;
    void fetchCompanyProfile()
      .then((profile) => {
        if (active) {
          setCompanyProfile(profile);
        }
      })
      .catch(() => {
        // The contract still works with the built-in fallback identity.
      });
    return () => {
      active = false;
    };
  }, []);

  const contractorDefaults = useMemo(
    () => mapProfileToContractorValues(companyProfile),
    [companyProfile],
  );

  useEffect(() => {
    if (mode === "edit" && editing) {
      setContractor(
        mapContractPartyToContractorValues(
          editing.contractor,
          contractorDefaults,
        ),
      );
      return;
    }

    setContractor(contractorDefaults);
  }, [mode, editing, contractorDefaults]);

  const defaultContractBody = useMemo(
    () => buildDefaultContractBody(selectedBudget, contractor),
    [selectedBudget, contractor],
  );

  const isNonDraftLocked =
    mode === "edit" && Boolean(editing && editing.status !== "draft");
  const isGenerated = editing?.status === "generated";
  const isPendingSignature = editing?.status === "pending_signature";
  const leadHasEmail = Boolean(selectedLead?.email);
  const leadHasPhone = Boolean(selectedLead?.phone);
  const [confirmCloseWithoutSignature, setConfirmCloseWithoutSignature] =
    useState(false);
  const [confirmCancelContract, setConfirmCancelContract] = useState(false);
  const [cancellingContract, setCancellingContract] = useState(false);
  const [confirmRevertToDraft, setConfirmRevertToDraft] = useState(false);
  const [confirmDuplicateBudget, setConfirmDuplicateBudget] = useState(false);
  const [revertingToDraft, setRevertingToDraft] = useState(false);

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

  // If we land on "create a contract" for a budget that already has one, send
  // the user straight to the existing contract instead of letting them submit
  // into an "orçamento já vinculado" error.
  useEffect(() => {
    if (mode !== "create" || !initialBudgetId) {
      return;
    }
    const existing = contracts.find(
      (contract) => contract.idBudgets === initialBudgetId,
    );
    if (existing) {
      navigate(contractRoutePaths.edit(existing.idContracts), {
        replace: true,
      });
    }
  }, [mode, initialBudgetId, contracts, navigate]);

  const [linkedEventId, setLinkedEventId] = useState<string | undefined>();

  useEffect(() => {
    let active = true;

    if (!editing?.idContracts) {
      setLinkedEventId(undefined);
      return;
    }

    void getEvents({ idContracts: editing.idContracts, limit: 1 })
      .then((result) => {
        if (active) {
          setLinkedEventId(result.items[0]?.idEvents);
        }
      })
      .catch(() => {
        if (active) {
          setLinkedEventId(undefined);
        }
      });

    return () => {
      active = false;
    };
  }, [editing?.idContracts]);

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

  function updateContractorField(key: ContractorFieldKey, value: string) {
    setContractor((current) => ({ ...current, [key]: value }));
  }

  const contractorDiffersFromDefaults = CONTRACTOR_FIELD_KEYS.some(
    (key) => contractor[key].trim() !== contractorDefaults[key].trim(),
  );

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
        | "closed_without_signature"
        | "rejected"
        | "expired"
        | "canceled",
      issueDate: form.issueDate,
      body: defaultContractBody,
      notes: form.notes,
      contractor: contractorValuesToPayload(contractor),
    };

    const savedContract = await save(payload, editing);
    if (!savedContract) {
      // The most common create failure is "orçamento já vinculado" — recover by
      // fetching the contract that owns this budget and opening it.
      if (mode === "create" && form.idBudgets) {
        try {
          const owning = await fetchContracts({
            page: 1,
            limit: 1,
            idBudgets: form.idBudgets,
          });
          if (owning.items[0]) {
            navigate(contractRoutePaths.edit(owning.items[0].idContracts), {
              replace: true,
            });
          }
        } catch {
          // keep the error toast already shown by `save`
        }
      }
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

  /**
   * "Gerar" used to be its own button that only flipped draft -> generated
   * and asked for nothing. It's now an invisible first step folded into
   * whichever real action (email, WhatsApp, assinatura, encerrar) the user
   * clicks first from a draft contract, so there's no empty click in between.
   */
  async function ensureContractGenerated(): Promise<boolean> {
    if (!editing?.idContracts) {
      return false;
    }

    if (isNonDraftLocked) {
      return true;
    }

    try {
      await updateContract(editing.idContracts, { status: "generated" });
      updateLocalStatus("generated");
      return true;
    } catch (error) {
      const message = getHttpErrorMessage(error, "Erro ao gerar contrato");
      showError("Erro ao gerar contrato", message);
      return false;
    }
  }

  /**
   * Best-effort cancellation of any signature envelope still pending for
   * this contract at the provider — used both when cancelling the contract
   * outright and when pulling a sent-for-signature contract back to draft,
   * so a stale signing link never outlives the version the client is
   * actually looking at. Failures here are surfaced but don't block the
   * caller: the local status change is what matters most to the user.
   */
  async function cancelPendingSignatureEnvelope(idContracts: string) {
    try {
      const sigRes = await getSignatures({ idContracts, limit: 10 });
      const envelopeId = sigRes.items?.[0]?.envelopeId;
      if (!envelopeId) return;

      try {
        await cancelSignatureRequest(envelopeId);
      } catch (err) {
        const msg = getHttpErrorMessage(
          err,
          "Falha ao cancelar solicitação de assinatura",
        );
        showError("Erro ao cancelar solicitação de assinatura", msg);
      }
    } catch {
      // ignore signature listing errors, continue regardless
    }
  }

  async function handleRevertToDraft() {
    if (!editing?.idContracts) {
      return;
    }

    setRevertingToDraft(true);
    try {
      if (editing.status === "pending_signature") {
        await cancelPendingSignatureEnvelope(editing.idContracts);
      }

      await updateContract(editing.idContracts, { status: "draft" });
      updateLocalStatus("draft", { sentVia: undefined, sentAt: undefined });
      showSuccess("Contrato voltou para rascunho");
    } catch (error) {
      const message = getHttpErrorMessage(error, "Erro ao reverter status");
      showError("Erro ao reverter para rascunho", message);
    } finally {
      setRevertingToDraft(false);
    }
  }

  async function handleSendEmail() {
    if (!editing?.idContracts) {
      return;
    }

    if (!(await ensureContractGenerated())) {
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

    if (!(await ensureContractGenerated())) {
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

    if (!(await ensureContractGenerated())) {
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

  async function handleCloseWithoutSignature() {
    if (!editing?.idContracts) {
      return;
    }

    if (!(await ensureContractGenerated())) {
      return;
    }

    const closed = await pdfActions.closeWithoutSignature();
    if (!closed) {
      return;
    }

    updateLocalStatus("closed_without_signature", {
      sentVia: "manual_close",
      sentAt: new Date().toISOString(),
    });
  }

  async function handleCancelContract() {
    if (!editing?.idContracts) {
      return;
    }

    setCancellingContract(true);
    try {
      // If there's a pending signature request, try to cancel the envelope first
      if (editing.status === "pending_signature") {
        await cancelPendingSignatureEnvelope(editing.idContracts);
      }

      await updateContract(editing.idContracts, { status: "canceled" });
      updateLocalStatus("canceled");
      showSuccess("Contrato cancelado com sucesso");
    } catch (error) {
      const message = getHttpErrorMessage(error, "Erro ao cancelar contrato");
      showError("Erro ao cancelar contrato", message);
    } finally {
      setCancellingContract(false);
    }
  }

  const previewAction: ActionBarAction = {
    key: "preview",
    label: pdfActions.previewing ? "Carregando..." : "Preview",
    icon: <FileText size={18} />,
    onClick: () => void pdfActions.preview(),
    disabled:
      !editing?.idContracts || pdfActions.previewing || !session?.user.idUsers,
    title: "Visualizar prévia do contrato",
  };

  const emailAction: ActionBarAction = {
    key: "email",
    label: pdfActions.sendingEmail ? "Enviando..." : "Enviar por e-mail",
    icon: <Mail size={18} />,
    onClick: () => void handleSendEmail(),
    disabled:
      !leadHasEmail || !session?.user.idUsers || pdfActions.sendingEmail,
    title: leadHasEmail
      ? "Enviar prévia por e-mail"
      : "Lead sem e-mail cadastrado",
  };

  const whatsappAction: ActionBarAction = {
    key: "whatsapp",
    label: pdfActions.sharingWhatsApp ? "Compartilhando..." : "WhatsApp",
    icon: <MessageCircle size={18} />,
    onClick: () => void handleSendWhatsApp(),
    disabled:
      !leadHasPhone || !session?.user.idUsers || pdfActions.sharingWhatsApp,
    title: leadHasPhone
      ? "Compartilhar via WhatsApp"
      : "Lead sem telefone cadastrado",
  };

  const cancelAction: ActionBarAction = {
    key: "cancel",
    label: "Cancelar contrato",
    icon: <X size={18} />,
    onClick: () => setConfirmCancelContract(true),
    disabled: !session?.user.idUsers || cancellingContract,
    title: "Cancelar contrato",
    tone: "danger",
  };

  const revertToDraftAction: ActionBarAction = {
    key: "revert-to-draft",
    label: revertingToDraft ? "Revertendo..." : "Voltar ao rascunho",
    icon: <RotateCcw size={18} />,
    onClick: () =>
      isPendingSignature
        ? setConfirmRevertToDraft(true)
        : void handleRevertToDraft(),
    disabled: !session?.user.idUsers || revertingToDraft,
    title: isPendingSignature
      ? "Cancela a solicitação de assinatura pendente e volta o contrato para rascunho"
      : "Voltar ao rascunho",
  };

  const duplicateBudgetAction: ActionBarAction = {
    key: "duplicate-budget",
    label: "Duplicar orçamento",
    icon: <Copy size={18} />,
    onClick: () => setConfirmDuplicateBudget(true),
    disabled: !editing?.idBudgets,
    title:
      "Cria um novo orçamento em rascunho com os mesmos dados deste, pronto para ajustar",
  };

  const registerPaymentAction: ActionBarAction = {
    key: "register-payment",
    label: "Registrar pagamento",
    icon: <Wallet size={18} />,
    onClick: () => {
      if (!editing?.idContracts) return;
      const params = new URLSearchParams();
      if (selectedLead?.idLeads) params.set("leadId", selectedLead.idLeads);
      if (editing.idBudgets) params.set("budgetId", editing.idBudgets);
      params.set("contractId", editing.idContracts);
      if (linkedEventId) params.set("eventId", linkedEventId);
      navigate(`${paymentRoutePaths.create}?${params.toString()}`);
    },
    disabled: !session?.user.idUsers,
    title:
      "Registrar pagamento com lead, orçamento, contrato e evento já vinculados",
  };

  let primaryAction: ActionBarAction | undefined;
  const secondaryActions: ActionBarAction[] = [];

  if (editing?.idContracts) {
    secondaryActions.push(registerPaymentAction, duplicateBudgetAction);

    if (isPendingSignature) {
      secondaryActions.push(
        previewAction,
        emailAction,
        whatsappAction,
        revertToDraftAction,
        cancelAction,
      );
    } else if (!isNonDraftLocked || isGenerated) {
      // Draft-but-ready and already-generated are shown the same way: there's
      // no separate "Gerar" step anymore — clicking any of these actions
      // silently generates the contract first if it hasn't been yet.
      secondaryActions.push(previewAction, emailAction, whatsappAction);

      primaryAction = {
        key: "signature",
        label: pdfActions.sendingSignatureRequest
          ? "Enviando..."
          : "Enviar para assinatura",
        icon: <PenLine size={18} />,
        onClick: () => void handleSendSignatureRequest(),
        disabled:
          !leadHasEmail ||
          !session?.user.idUsers ||
          pdfActions.sendingSignatureRequest,
        title: leadHasEmail
          ? "Enviar para assinatura online"
          : "Lead sem e-mail cadastrado",
      };
      secondaryActions.push({
        key: "close-without-signature",
        label: pdfActions.closingWithoutSignature
          ? "Encerrando..."
          : "Encerrar sem assinatura",
        icon: <Archive size={18} />,
        onClick: () => setConfirmCloseWithoutSignature(true),
        disabled: !session?.user.idUsers || pdfActions.closingWithoutSignature,
        title: "Encerrar sem gerar assinaturas",
        tone: "danger",
      });

      if (isGenerated) {
        secondaryActions.push(revertToDraftAction);
      }

      secondaryActions.push(cancelAction);
    } else {
      secondaryActions.push(previewAction);
    }
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
                {getSentViaLabel(editing.sentVia)}
              </span>{" "}
              em{" "}
              <span className="font-semibold">
                {formatDateTimeDisplay(editing.sentAt)}
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
      badge={
        <StatusBadge
          label={getContractStatusLabel(form.status)}
          tone={getContractStatusTone(form.status)}
        />
      }
      actions={
        <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              navigate(contractRoutePaths.list);
            }}
          >
            Voltar
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
        open={
          pdfActions.sendingSignatureRequest ||
          pdfActions.closingWithoutSignature ||
          cancellingContract
        }
        label={
          cancellingContract
            ? "Cancelando contrato..."
            : pdfActions.closingWithoutSignature
              ? "Encerrando contrato..."
              : "Enviando para assinatura..."
        }
      />
      {primaryAction || secondaryActions.length > 0 ? (
        <div className="mb-6">
          <ActionBar primary={primaryAction} secondary={secondaryActions} />
        </div>
      ) : null}

      <ConfirmDialog
        open={confirmDuplicateBudget}
        title="Duplicar orçamento"
        description="Criar um novo orçamento (rascunho) com os mesmos dados do orçamento deste contrato? Você poderá ajustá-lo antes de salvar."
        confirmLabel="Duplicar"
        onConfirm={() => {
          setConfirmDuplicateBudget(false);
          if (editing?.idBudgets) {
            navigate(
              `${budgetRoutePaths.create}?duplicateFrom=${editing.idBudgets}`,
            );
          }
        }}
        onCancel={() => setConfirmDuplicateBudget(false)}
      />
      <ConfirmDialog
        open={confirmRevertToDraft}
        title="Voltar ao rascunho"
        description={
          <p>
            Este contrato já foi enviado para assinatura. Voltar para rascunho
            vai cancelar a solicitação de assinatura pendente — o link que o
            cliente recebeu deixará de funcionar.
            <br />
            <br />
            Deseja continuar?
          </p>
        }
        confirmLabel="Sim, voltar ao rascunho"
        cancelLabel="Voltar"
        onConfirm={() => {
          setConfirmRevertToDraft(false);
          void handleRevertToDraft();
        }}
        onCancel={() => setConfirmRevertToDraft(false)}
      />
      <ConfirmDialog
        open={confirmCloseWithoutSignature}
        title="Encerrar sem assinaturas"
        description={
          <p>
            Você está prestes a encerrar este contrato sem gerar assinaturas.
            <br />
            <br />
            Essa ação é irreversível e criará automaticamente o cliente e o
            evento vinculados ao contrato.
            <br />
            <br />
            Deseja continuar?
          </p>
        }
        confirmLabel="Sim, encerrar"
        cancelLabel="Voltar"
        onConfirm={() => {
          setConfirmCloseWithoutSignature(false);
          void handleCloseWithoutSignature();
        }}
        onCancel={() => setConfirmCloseWithoutSignature(false)}
      />
      <ConfirmDialog
        open={confirmCancelContract}
        title="Cancelar contrato"
        description={
          <p>
            Você está prestes a cancelar este contrato. Essa ação é
            irreversível.
            <br />
            <br />
            Ao cancelar o contrato, o orçamento vinculado será automaticamente
            cancelado. Se for para corrigir alguma informação, use "Duplicar
            orçamento" para criar um novo rascunho já preenchido com os mesmos
            dados, em vez de recomeçar do zero.
            <br />
            <br />
            Deseja continuar?
          </p>
        }
        confirmLabel="Sim, cancelar contrato"
        cancelLabel="Voltar"
        variant="warning"
        onConfirm={() => {
          setConfirmCancelContract(false);
          void handleCancelContract();
        }}
        onCancel={() => setConfirmCancelContract(false)}
      />

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
              value={formatDateTimeDisplay(editing.createdAt)}
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
          {selectableBudgets.map((budget) => {
            const lead = leads.find((l) => l.idLeads === budget.idLeads);
            return (
              <option key={budget.idBudgets} value={budget.idBudgets}>
                {budget.budgetNumber}
                {lead ? ` — ${lead.name}` : ""}
              </option>
            );
          })}
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

      <div className="mt-6 rounded-xl border border-[#e8d5c9]">
        <button
          type="button"
          onClick={() => setShowContractor((current) => !current)}
          className="flex w-full items-center justify-between px-4 py-3 text-left"
        >
          <span className="text-sm font-semibold text-[#2C1810]">
            Dados da Contratada
            {contractorDiffersFromDefaults ? (
              <span className="ml-2 rounded-full bg-[#f5ede8] px-2 py-0.5 text-xs font-medium text-[#7a4430]">
                personalizado
              </span>
            ) : null}
          </span>
          <span className="text-xs text-[#7a4430]">
            {showContractor ? "Ocultar" : "Editar"}
          </span>
        </button>

        {showContractor ? (
          <div className="space-y-6 border-t border-[#e8d5c9] px-4 py-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-[#7a4430]">
                Preenchido automaticamente com o Perfil da Empresa. Ajuste
                somente se este contrato precisar de outra identificação da
                contratada.
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                leftIcon={<RotateCcw size={14} />}
                onClick={() => setContractor(contractorDefaults)}
                disabled={isNonDraftLocked || !contractorDiffersFromDefaults}
              >
                Restaurar padrão
              </Button>
            </div>

            {CONTRACTOR_FIELD_GROUPS.map((group) => (
              <fieldset
                key={group.id}
                disabled={isNonDraftLocked}
                className="m-0 border-0 p-0"
              >
                <legend className="text-xs font-semibold uppercase tracking-wide text-[#7a4430]">
                  {group.title}
                </legend>
                <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {group.fields.map((field) => {
                    const value = contractor[field.key as ContractorFieldKey];

                    if (field.type === "pixKeyType") {
                      return (
                        <Select
                          key={field.key}
                          label={field.label}
                          value={value}
                          onChange={(event) =>
                            updateContractorField(
                              field.key as ContractorFieldKey,
                              event.target.value,
                            )
                          }
                        >
                          <option value="">Não informado</option>
                          {PIX_KEY_TYPE_OPTIONS.map((option) => (
                            <option key={option} value={option}>
                              {PIX_KEY_TYPE_LABELS[option] ?? option}
                            </option>
                          ))}
                        </Select>
                      );
                    }

                    return (
                      <Input
                        key={field.key}
                        label={field.label}
                        type={field.type === "email" ? "email" : "text"}
                        placeholder={field.placeholder}
                        value={value}
                        wrapperClassName={
                          field.span === 2 ? "sm:col-span-2" : undefined
                        }
                        onChange={(event) =>
                          updateContractorField(
                            field.key as ContractorFieldKey,
                            event.target.value,
                          )
                        }
                      />
                    );
                  })}
                </div>
              </fieldset>
            ))}
          </div>
        ) : null}
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

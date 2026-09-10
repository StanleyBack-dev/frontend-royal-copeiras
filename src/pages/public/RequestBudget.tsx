import { useState, type FormEvent } from "react";
import { CheckCircle2, Info } from "lucide-react";
import AccordionSection from "@/components/molecules/AccordionSection";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Select from "@/components/atoms/Select";
import CrownIcon from "@/components/atoms/icons/CrownIcon";
import { colors, typography } from "@/config";
import {
  verifyPublicIntakeCode,
  submitPublicIntake,
} from "@/api/public-intake/methods";
import type { PublicIntakeSupply } from "@/api/public-intake/schema";
import { getHttpErrorMessage } from "@/api/shared/http-error";
import { formatSupplyUnit } from "@/features/supplies/model/units";
import { BRAZILIAN_STATE_OPTIONS } from "@/shared/constants/brazilian-states";
import {
  formatCEP,
  formatCNPJ,
  formatCPF,
  formatLandline,
  formatPhone,
  onlyDigits,
} from "@/utils/format";
import {
  BUDGET_EVENT_MAX_DAYS,
  budgetDurationOptions,
  budgetEventDateModeOptions,
  budgetServiceTypeOptions,
  buildBudgetServiceDescription,
  buildEventDates,
  buildEventTimes,
  type BudgetServiceType,
} from "@/features/budgets";
import {
  serviceComboKey,
  serviceGenderOptions,
  type ServiceGenderOption,
} from "@/features/budgets/model/service-items";
import { budgetValidationMessages } from "@/features/budgets/model/messages";

type Step = "code" | "form" | "done";
type DocumentType = "individual" | "company";
type ContactType = "mobile" | "landline";
type EventDateMode = (typeof budgetEventDateModeOptions)[number];

interface PublicBudgetItem {
  itemType: "LABOR" | "SUPPLY";
  serviceType: BudgetServiceType | "";
  gender: ServiceGenderOption | "";
  // SUPPLY-only: id of the catalog material chosen (name + unit follow from it)
  idSupplies: string;
  description: string;
  unit: string;
  quantity: string;
  eventDateIndex: number;
}

const DOCUMENT_DIGITS_CPF = 11;
const DOCUMENT_DIGITS_CNPJ = 14;
const CPF_MASK_LENGTH = 14;
const CNPJ_MASK_LENGTH = 18;
const PHONE_DIGITS_MOBILE = 11;
const PHONE_DIGITS_LANDLINE = 10;
const PHONE_MASK_LENGTH_MOBILE = 15;
const PHONE_MASK_LENGTH_LANDLINE = 14;
const EVENT_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const EVENT_TIME_PATTERN = /^(?:[01]\d|2[0-3]):[0-5]\d$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TOTAL_SERVICE_COMBOS =
  budgetServiceTypeOptions.length * serviceGenderOptions.length;

const emptyPublicBudgetItem: PublicBudgetItem = {
  itemType: "LABOR",
  serviceType: "",
  gender: "",
  idSupplies: "",
  description: "",
  unit: "",
  quantity: "1",
  eventDateIndex: 0,
};

const emptyPublicSupplyItem: PublicBudgetItem = {
  ...emptyPublicBudgetItem,
  itemType: "SUPPLY",
};

export default function RequestBudget() {
  const [step, setStep] = useState<Step>("code");
  const [code, setCode] = useState("");
  const [formToken, setFormToken] = useState("");
  const [supplies, setSupplies] = useState<PublicIntakeSupply[]>([]);
  const [verifying, setVerifying] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [contactType, setContactType] = useState<ContactType>("mobile");
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [documentType, setDocumentType] = useState<DocumentType>("individual");
  const [cpf, setCpf] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [documentError, setDocumentError] = useState("");

  const [addressStreet, setAddressStreet] = useState("");
  const [addressNumber, setAddressNumber] = useState("");
  const [addressNoNumber, setAddressNoNumber] = useState(false);
  const [addressComplement, setAddressComplement] = useState("");
  const [addressNeighborhood, setAddressNeighborhood] = useState("");
  const [addressCity, setAddressCity] = useState("");
  const [addressState, setAddressState] = useState("");
  const [addressZipCode, setAddressZipCode] = useState("");

  const [eventDateMode, setEventDateMode] = useState<EventDateMode>("single");
  const [eventDaysCount, setEventDaysCount] = useState("1");
  const [eventDates, setEventDates] = useState<string[]>([""]);
  const [eventArrivalTimes, setEventArrivalTimes] = useState<string[]>([""]);
  const [eventDepartureTimes, setEventDepartureTimes] = useState<string[]>([
    "",
  ]);
  const [eventScheduleError, setEventScheduleError] = useState("");

  const [durationHours, setDurationHours] = useState<string[]>([""]);
  const [durationError, setDurationError] = useState("");

  const [eventLocation, setEventLocation] = useState<string[]>([""]);
  const [eventLocationError, setEventLocationError] = useState("");
  const [guestCount, setGuestCount] = useState<string[]>([""]);
  const [guestCountError, setGuestCountError] = useState("");

  const [items, setItems] = useState<PublicBudgetItem[]>([
    { ...emptyPublicBudgetItem },
  ]);
  const [itemsError, setItemsError] = useState("");

  const [openSteps, setOpenSteps] = useState({
    contact: true,
    address: false,
    event: true,
  });
  const toggleStep = (step: keyof typeof openSteps) =>
    setOpenSteps((previous) => ({ ...previous, [step]: !previous[step] }));

  function handleDocumentTypeChange(nextType: DocumentType) {
    setDocumentType(nextType);
    setDocumentError("");
    if (nextType === "individual") {
      setCnpj("");
    } else {
      setCpf("");
    }
  }

  function handleContactTypeChange(nextType: ContactType) {
    setContactType(nextType);
    setPhoneError("");
    setPhone("");
  }

  function resizeEventSchedule(count: number) {
    setEventDates((previous) => buildEventDates(count, previous));
    setEventArrivalTimes((previous) => buildEventTimes(count, previous));
    setEventDepartureTimes((previous) => buildEventTimes(count, previous));
    setEventLocation((previous) => buildEventTimes(count, previous));
    setGuestCount((previous) => buildEventTimes(count, previous));
    setDurationHours((previous) => buildEventTimes(count, previous));
    setItems((previous) => {
      const resized = previous.map((item) => ({
        ...item,
        eventDateIndex: Math.min(item.eventDateIndex, count - 1),
      }));
      const coveredDays = new Set(resized.map((item) => item.eventDateIndex));
      const missingDayItems = Array.from({ length: count }, (_, day) => day)
        .filter((day) => !coveredDays.has(day))
        .map((day) => ({ ...emptyPublicBudgetItem, eventDateIndex: day }));

      return [...resized, ...missingDayItems];
    });
  }

  function handleEventDateModeChange(nextMode: EventDateMode) {
    setEventDateMode(nextMode);
    setEventScheduleError("");
    const nextCount = nextMode === "multiple" ? 2 : 1;
    setEventDaysCount(String(nextCount));
    resizeEventSchedule(nextCount);
  }

  function handleEventDaysCountChange(value: string) {
    setEventDaysCount(value);
    setEventScheduleError("");
    resizeEventSchedule(Number(value) || 2);
  }

  function updateEventDate(index: number, value: string) {
    setEventScheduleError("");
    setEventDates((previous) => {
      const next = [...previous];
      next[index] = value;
      return next;
    });
  }

  function updateEventArrivalTime(index: number, value: string) {
    setEventScheduleError("");
    setEventArrivalTimes((previous) => {
      const next = [...previous];
      next[index] = value;
      return next;
    });
  }

  function updateEventDepartureTime(index: number, value: string) {
    setEventScheduleError("");
    setEventDepartureTimes((previous) => {
      const next = [...previous];
      next[index] = value;
      return next;
    });
  }

  function updateEventLocation(index: number, value: string) {
    setEventLocationError("");
    setEventLocation((previous) => {
      const next = [...previous];
      next[index] = value;
      return next;
    });
  }

  function updateGuestCount(index: number, value: string) {
    setGuestCountError("");
    setGuestCount((previous) => {
      const next = [...previous];
      next[index] = value;
      return next;
    });
  }

  function updateDurationHours(index: number, value: string) {
    setDurationError("");
    setDurationHours((previous) => {
      const next = [...previous];
      next[index] = value;
      return next;
    });
  }

  function addItem(dayIndex: number) {
    setItemsError("");
    setItems((previous) => [
      ...previous,
      { ...emptyPublicBudgetItem, eventDateIndex: dayIndex },
    ]);
  }

  function addSupplyItem(dayIndex: number) {
    setItemsError("");
    setItems((previous) => [
      ...previous,
      { ...emptyPublicSupplyItem, eventDateIndex: dayIndex },
    ]);
  }

  function removeItem(index: number) {
    setItemsError("");
    setItems((previous) =>
      previous.length > 1 ? previous.filter((_, i) => i !== index) : previous,
    );
  }

  function updateItem(index: number, patch: Partial<PublicBudgetItem>) {
    setItemsError("");
    setItems((previous) =>
      previous.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    );
  }

  const eventDayCount =
    eventDateMode === "multiple"
      ? Math.min(
          Math.max(Number(eventDaysCount || 2), 2),
          BUDGET_EVENT_MAX_DAYS,
        )
      : 1;
  const eventDateValues = buildEventDates(eventDayCount, eventDates);
  const eventArrivalTimeValues = buildEventTimes(
    eventDayCount,
    eventArrivalTimes,
  );
  const eventDepartureTimeValues = buildEventTimes(
    eventDayCount,
    eventDepartureTimes,
  );
  const eventLocationValues = buildEventTimes(eventDayCount, eventLocation);
  const guestCountValues = buildEventTimes(eventDayCount, guestCount);
  const durationHoursValues = buildEventTimes(eventDayCount, durationHours);

  async function handleVerifyCode(event: FormEvent) {
    event.preventDefault();
    setError("");
    setVerifying(true);
    try {
      const verified = await verifyPublicIntakeCode(code.trim());
      setFormToken(verified.formToken);
      setSupplies(verified.supplies ?? []);
      setStep("form");
    } catch (submitError) {
      setError(
        getHttpErrorMessage(submitError, "Código inválido ou expirado."),
      );
    } finally {
      setVerifying(false);
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setEmailError("");
    setDocumentError("");
    setPhoneError("");
    setEventScheduleError("");
    setDurationError("");
    setEventLocationError("");
    setGuestCountError("");
    setItemsError("");

    if (!name.trim()) {
      setError("Preencha ao menos o nome.");
      return;
    }

    if (!email.trim() || !EMAIL_PATTERN.test(email.trim())) {
      setEmailError("Informe um e-mail válido.");
      return;
    }

    const phoneDigits = onlyDigits(phone);
    const requiredPhoneDigits =
      contactType === "mobile" ? PHONE_DIGITS_MOBILE : PHONE_DIGITS_LANDLINE;

    if (!phoneDigits || phoneDigits.length !== requiredPhoneDigits) {
      setPhoneError(
        contactType === "mobile"
          ? `Informe um celular válido (${PHONE_DIGITS_MOBILE} dígitos)`
          : `Informe um telefone fixo válido (${PHONE_DIGITS_LANDLINE} dígitos)`,
      );
      return;
    }

    const documentDigits =
      documentType === "individual" ? onlyDigits(cpf) : onlyDigits(cnpj);
    const requiredDocumentDigits =
      documentType === "individual"
        ? DOCUMENT_DIGITS_CPF
        : DOCUMENT_DIGITS_CNPJ;

    if (!documentDigits || documentDigits.length !== requiredDocumentDigits) {
      setDocumentError(
        documentType === "individual"
          ? `Informe um CPF válido (${DOCUMENT_DIGITS_CPF} dígitos)`
          : `Informe um CNPJ válido (${DOCUMENT_DIGITS_CNPJ} dígitos)`,
      );
      return;
    }

    const selectedEventDates = eventDateValues.slice(0, eventDayCount);
    if (
      selectedEventDates.length !== eventDayCount ||
      selectedEventDates.some((value) => !EVENT_DATE_PATTERN.test(value))
    ) {
      setEventScheduleError(budgetValidationMessages.eventDateRequired);
      return;
    }

    const selectedArrivalTimes = eventArrivalTimeValues.slice(0, eventDayCount);
    if (
      selectedArrivalTimes.length !== eventDayCount ||
      selectedArrivalTimes.some((value) => !EVENT_TIME_PATTERN.test(value))
    ) {
      setEventScheduleError(budgetValidationMessages.eventArrivalTimeRequired);
      return;
    }

    const selectedDepartureTimes = eventDepartureTimeValues.slice(
      0,
      eventDayCount,
    );
    if (
      selectedDepartureTimes.length !== eventDayCount ||
      selectedDepartureTimes.some((value) => !EVENT_TIME_PATTERN.test(value))
    ) {
      setEventScheduleError(
        budgetValidationMessages.eventDepartureTimeRequired,
      );
      return;
    }

    const selectedDurationHours = durationHoursValues.slice(0, eventDayCount);
    if (
      selectedDurationHours.length !== eventDayCount ||
      selectedDurationHours.some((value) => {
        const hours = Number(value);
        return !value || !Number.isInteger(hours) || hours < 1 || hours > 24;
      })
    ) {
      setDurationError(budgetValidationMessages.durationRequired);
      return;
    }

    const selectedEventLocations = eventLocationValues.slice(0, eventDayCount);
    if (
      selectedEventLocations.length !== eventDayCount ||
      selectedEventLocations.some((value) => !value.trim())
    ) {
      setEventLocationError(budgetValidationMessages.eventLocationRequired);
      return;
    }

    const selectedGuestCounts = guestCountValues.slice(0, eventDayCount);
    if (
      selectedGuestCounts.length !== eventDayCount ||
      selectedGuestCounts.some((value) => {
        const guests = Number(value);
        return !value || !Number.isInteger(guests) || guests <= 0;
      })
    ) {
      setGuestCountError(budgetValidationMessages.guestCountInvalid);
      return;
    }

    if (items.length < 1) {
      setItemsError(budgetValidationMessages.itemsRequired);
      return;
    }

    const coveredDays = new Set(items.map((item) => item.eventDateIndex));
    if (coveredDays.size < eventDayCount) {
      setItemsError(budgetValidationMessages.dayMissingItems);
      return;
    }

    const hasIncompleteItem = items.some((item) =>
      item.itemType === "SUPPLY"
        ? !item.idSupplies || Number(item.quantity) <= 0
        : !item.serviceType || !item.gender || Number(item.quantity) <= 0,
    );
    if (hasIncompleteItem) {
      setItemsError(
        items.some((item) => item.itemType === "SUPPLY" && !item.idSupplies)
          ? "Selecione um material do catálogo em cada linha de material."
          : budgetValidationMessages.itemServiceTypeRequired,
      );
      return;
    }

    const itemCombos = items.map((item) =>
      item.itemType === "SUPPLY"
        ? `S:${item.eventDateIndex}:${item.idSupplies}`
        : `L:${item.eventDateIndex}:${serviceComboKey(item.serviceType, item.gender)}`,
    );
    if (new Set(itemCombos).size !== itemCombos.length) {
      setItemsError(budgetValidationMessages.itemServiceTypeDuplicated);
      return;
    }

    setSubmitting(true);
    try {
      await submitPublicIntake({
        formToken,
        name: name.trim(),
        email: email.trim(),
        phone: phoneDigits,
        document: documentDigits,
        addressStreet: addressStreet.trim(),
        addressNumber: addressNumber.trim(),
        addressComplement: addressComplement.trim(),
        addressNeighborhood: addressNeighborhood.trim(),
        addressCity: addressCity.trim(),
        addressState: addressState.trim().toUpperCase(),
        addressZipCode:
          onlyDigits(addressZipCode).length === 8
            ? formatCEP(addressZipCode)
            : "",
        eventDates: selectedEventDates,
        eventArrivalTimes: selectedArrivalTimes,
        eventDepartureTimes: selectedDepartureTimes,
        eventLocation: selectedEventLocations.map((value) => value.trim()),
        guestCount: selectedGuestCounts.map((value) => Number(value)),
        durationHours: selectedDurationHours.map((value) => Number(value)),
        items: items.map((item) => {
          const quantity = Number(item.quantity);

          if (item.itemType === "SUPPLY") {
            const supply = supplies.find(
              (candidate) => candidate.idSupplies === item.idSupplies,
            );
            return {
              itemType: "SUPPLY" as const,
              idSupplies: item.idSupplies,
              description: (supply?.name ?? item.description).trim(),
              unit: (supply?.defaultUnit ?? item.unit).trim() || undefined,
              quantity,
              eventDateIndex: item.eventDateIndex,
            };
          }

          const serviceType = item.serviceType as BudgetServiceType;
          const gender = item.gender as ServiceGenderOption;

          return {
            itemType: "LABOR" as const,
            description: buildBudgetServiceDescription(
              serviceType,
              quantity,
              gender,
            ),
            gender,
            quantity,
            eventDateIndex: item.eventDateIndex,
          };
        }),
      });
      setStep("done");
    } catch (submitError) {
      setError(
        getHttpErrorMessage(
          submitError,
          "Não foi possível enviar suas informações. Tente novamente.",
        ),
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="flex min-h-screen justify-center px-4 py-8 sm:px-6 md:items-center lg:px-8"
      style={{ background: "#faf6f2" }}
    >
      <div
        className={`w-full ${
          step === "form"
            ? "max-w-lg md:max-w-3xl lg:max-w-5xl xl:max-w-6xl"
            : "max-w-md md:max-w-lg"
        }`}
      >
        <div className="mb-6 flex select-none flex-col items-center">
          <div
            className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl shadow-md"
            style={{ background: "linear-gradient(135deg, #C9A227, #a8811a)" }}
          >
            <CrownIcon size={32} color="white" />
          </div>
          <h1
            className="text-2xl font-bold tracking-tight"
            style={{
              color: colors.brown[800],
              fontFamily: typography.fontFamily,
            }}
          >
            Royal Copeiras
          </h1>
          <p
            className="mt-1 text-sm"
            style={{
              color: colors.brown[500],
              fontFamily: typography.fontFamily,
            }}
          >
            Solicitação de orçamento
          </p>
        </div>

        <div
          className="rounded-2xl border bg-white px-4 py-6 shadow-md sm:px-6 md:px-8 md:py-8 lg:px-10 lg:py-10"
          style={{ borderColor: colors.brown[100] }}
        >
          {step === "code" ? (
            <form
              onSubmit={(event) => void handleVerifyCode(event)}
              noValidate
              className="flex flex-col gap-5"
            >
              <p className="text-sm" style={{ color: colors.brown[500] }}>
                Digite o código de 6 dígitos que você recebeu para liberar o
                formulário.
              </p>
              <Input
                label="Código de acesso"
                inputMode="numeric"
                maxLength={6}
                placeholder="000000"
                value={code}
                onChange={(event) => setCode(onlyDigits(event.target.value, 6))}
                error={error || undefined}
                autoFocus
              />
              <Button
                type="submit"
                variant="primary"
                disabled={verifying || code.length !== 6}
              >
                {verifying ? "Verificando..." : "Continuar"}
              </Button>
            </form>
          ) : null}

          {step === "form" ? (
            <form
              onSubmit={(event) => void handleSubmit(event)}
              noValidate
              className="flex flex-col gap-4"
            >
              <p className="text-sm" style={{ color: colors.brown[500] }}>
                Conte pra gente sobre você e o seu evento.
              </p>

              <AccordionSection
                title="Seus dados"
                description="Como podemos te identificar e entrar em contato."
                stepNumber={1}
                hasError={Boolean(emailError || phoneError || documentError)}
                isOpen={openSteps.contact}
                onToggle={() => toggleStep("contact")}
              >
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <Input
                      label="Seu nome *"
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      autoFocus
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Input
                      label="E-mail *"
                      type="email"
                      value={email}
                      onChange={(event) => {
                        setEmailError("");
                        setEmail(event.target.value);
                      }}
                      error={emailError || undefined}
                    />
                  </div>
                  <Select
                    label="Tipo de telefone *"
                    value={contactType}
                    onChange={(event) =>
                      handleContactTypeChange(event.target.value as ContactType)
                    }
                  >
                    <option value="mobile">Celular</option>
                    <option value="landline">Fixo</option>
                  </Select>
                  <Input
                    label="Telefone / WhatsApp *"
                    placeholder={
                      contactType === "landline"
                        ? "(11) 2345-6789"
                        : "(11) 91234-5678"
                    }
                    inputMode="tel"
                    maxLength={
                      contactType === "landline"
                        ? PHONE_MASK_LENGTH_LANDLINE
                        : PHONE_MASK_LENGTH_MOBILE
                    }
                    value={phone}
                    onChange={(event) => {
                      setPhoneError("");
                      setPhone(
                        contactType === "landline"
                          ? formatLandline(event.target.value)
                          : formatPhone(event.target.value),
                      );
                    }}
                    error={phoneError || undefined}
                  />
                  <Select
                    label="Tipo de documento *"
                    value={documentType}
                    onChange={(event) =>
                      handleDocumentTypeChange(
                        event.target.value as DocumentType,
                      )
                    }
                  >
                    <option value="individual">Pessoa Física</option>
                    <option value="company">Empresa</option>
                  </Select>
                  {documentType === "individual" ? (
                    <Input
                      label="CPF *"
                      placeholder="123.456.789-09"
                      inputMode="numeric"
                      maxLength={CPF_MASK_LENGTH}
                      value={cpf}
                      onChange={(event) => {
                        setDocumentError("");
                        setCpf(formatCPF(event.target.value));
                      }}
                      error={documentError || undefined}
                    />
                  ) : (
                    <Input
                      label="CNPJ *"
                      placeholder="12.345.678/0001-90"
                      inputMode="numeric"
                      maxLength={CNPJ_MASK_LENGTH}
                      value={cnpj}
                      onChange={(event) => {
                        setDocumentError("");
                        setCnpj(formatCNPJ(event.target.value));
                      }}
                      error={documentError || undefined}
                    />
                  )}
                </div>
              </AccordionSection>

              <AccordionSection
                title="Endereço do responsável"
                description="Opcional. Usamos estes dados apenas para emitir o contrato caso o orçamento seja aprovado."
                stepNumber={2}
                isOpen={openSteps.address}
                onToggle={() => toggleStep("address")}
              >
                <div className="mb-3 flex items-start gap-2 rounded-lg border border-[#e8d5c9] bg-[#faf6f2] px-3 py-2">
                  <Info
                    size={16}
                    className="mt-0.5 shrink-0 text-[#7a4430]"
                    aria-hidden
                  />
                  <p
                    className="text-xs"
                    style={{ color: colors.brown[500] }}
                    title="O endereço é necessário para gerar o instrumento de contrato de prestação de serviços após a aprovação do orçamento. Nenhum campo é obrigatório."
                  >
                    Coletamos o endereço somente para elaborar o contrato de
                    prestação de serviços após a aprovação do orçamento. Todos
                    os campos são opcionais.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  <Input
                    label="CEP"
                    value={addressZipCode}
                    inputMode="numeric"
                    maxLength={9}
                    placeholder="00000-000"
                    onChange={(event) =>
                      setAddressZipCode(formatCEP(event.target.value))
                    }
                  />
                  <Input
                    label="Logradouro"
                    value={addressStreet}
                    maxLength={160}
                    placeholder="Rua 6"
                    wrapperClassName="sm:col-span-2"
                    onChange={(event) => setAddressStreet(event.target.value)}
                  />
                  <div>
                    <Input
                      label="Número"
                      value={addressNumber}
                      maxLength={20}
                      placeholder="123"
                      disabled={addressNoNumber}
                      onChange={(event) => setAddressNumber(event.target.value)}
                    />
                    <label className="mt-1 flex items-center gap-1.5 text-xs text-[#7a4430]">
                      <input
                        type="checkbox"
                        checked={addressNoNumber}
                        onChange={(event) => {
                          setAddressNoNumber(event.target.checked);
                          setAddressNumber(event.target.checked ? "S/N" : "");
                        }}
                      />
                      Sem número
                    </label>
                  </div>
                  <Input
                    label="Complemento"
                    value={addressComplement}
                    maxLength={120}
                    placeholder="Quadra 22 Lote 03"
                    onChange={(event) =>
                      setAddressComplement(event.target.value)
                    }
                  />
                  <Input
                    label="Bairro/Distrito"
                    value={addressNeighborhood}
                    maxLength={120}
                    placeholder="Polo Empresarial"
                    onChange={(event) =>
                      setAddressNeighborhood(event.target.value)
                    }
                  />
                  <Input
                    label="Município"
                    value={addressCity}
                    maxLength={80}
                    placeholder="Aparecida de Goiânia"
                    onChange={(event) => setAddressCity(event.target.value)}
                  />
                  <Select
                    label="UF"
                    value={addressState}
                    onChange={(event) => setAddressState(event.target.value)}
                  >
                    <option value="">Selecione a UF</option>
                    {BRAZILIAN_STATE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Select>
                </div>
              </AccordionSection>

              <AccordionSection
                title="Sobre o evento"
                description="Datas, local, convidados e serviços de cada dia do evento."
                stepNumber={3}
                hasError={Boolean(
                  eventScheduleError ||
                  durationError ||
                  eventLocationError ||
                  guestCountError ||
                  itemsError,
                )}
                isOpen={openSteps.event}
                onToggle={() => toggleStep("event")}
              >
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Select
                    label="Período do evento *"
                    value={eventDateMode}
                    onChange={(event) =>
                      handleEventDateModeChange(
                        event.target.value as EventDateMode,
                      )
                    }
                  >
                    <option value="single">Dia único</option>
                    <option value="multiple">Mais de um dia</option>
                  </Select>

                  {eventDateMode === "multiple" ? (
                    <Select
                      label="Quantidade de dias *"
                      value={eventDaysCount}
                      onChange={(event) =>
                        handleEventDaysCountChange(event.target.value)
                      }
                    >
                      {Array.from(
                        { length: BUDGET_EVENT_MAX_DAYS - 1 },
                        (_, index) => index + 2,
                      ).map((days) => (
                        <option key={days} value={String(days)}>
                          {days} dias
                        </option>
                      ))}
                    </Select>
                  ) : null}

                  <div className="flex flex-col gap-3 md:col-span-2">
                    {eventDateValues.map((eventDateValue, index) => (
                      <div
                        key={`event-schedule-${index}`}
                        className="rounded-2xl border p-4"
                        style={{ borderColor: colors.brown[100] }}
                      >
                        <p
                          className="mb-3 text-xs font-semibold uppercase tracking-wide"
                          style={{ color: colors.brown[500] }}
                        >
                          Dia {index + 1}
                        </p>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                          <Input
                            label={`Data ${index + 1} *`}
                            type="date"
                            value={eventDateValue}
                            onChange={(event) =>
                              updateEventDate(index, event.target.value)
                            }
                            error={
                              index === 0
                                ? eventScheduleError || undefined
                                : undefined
                            }
                          />
                          <Input
                            label={`Início do evento ${index + 1} *`}
                            type="time"
                            value={eventArrivalTimeValues[index] || ""}
                            onChange={(event) =>
                              updateEventArrivalTime(index, event.target.value)
                            }
                          />
                          <Input
                            label={`Fim do evento ${index + 1} *`}
                            type="time"
                            value={eventDepartureTimeValues[index] || ""}
                            onChange={(event) =>
                              updateEventDepartureTime(
                                index,
                                event.target.value,
                              )
                            }
                          />
                        </div>
                        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
                          <Input
                            label={`Local do evento ${index + 1} *`}
                            value={eventLocationValues[index] || ""}
                            onChange={(event) =>
                              updateEventLocation(index, event.target.value)
                            }
                            error={
                              index === 0
                                ? eventLocationError || undefined
                                : undefined
                            }
                          />
                          <Input
                            label={`Convidados ${index + 1} *`}
                            type="number"
                            min={1}
                            value={guestCountValues[index] || ""}
                            onChange={(event) =>
                              updateGuestCount(index, event.target.value)
                            }
                            error={
                              index === 0
                                ? guestCountError || undefined
                                : undefined
                            }
                          />
                          <div>
                            <Select
                              label={`Duração ${index + 1} *`}
                              value={durationHoursValues[index] || ""}
                              onChange={(event) =>
                                updateDurationHours(index, event.target.value)
                              }
                            >
                              <option value="">Selecione a duração</option>
                              {budgetDurationOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </Select>
                            {index === 0 && durationError ? (
                              <p className="mt-1 text-xs text-red-600">
                                {durationError}
                              </p>
                            ) : null}
                          </div>
                        </div>

                        <div
                          className="mt-4 border-t pt-3"
                          style={{ borderColor: colors.brown[100] }}
                        >
                          <div className="mb-3 flex items-start justify-between gap-3">
                            <div>
                              <p
                                className="text-xs font-semibold uppercase tracking-wide"
                                style={{ color: colors.brown[500] }}
                              >
                                {eventDayCount > 1
                                  ? `Serviços — Dia ${index + 1} *`
                                  : "Serviços desejados *"}
                              </p>
                              <p
                                className="text-sm"
                                style={{ color: colors.brown[500] }}
                              >
                                Selecione os tipos de serviço e a quantidade
                                necessária.
                              </p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <Button
                                type="button"
                                variant="secondary"
                                style={{
                                  background: "#f0e0bb",
                                  color: "#6b4a2b",
                                }}
                                onClick={() => addItem(index)}
                                disabled={
                                  items.filter(
                                    (dayItem) =>
                                      dayItem.eventDateIndex === index &&
                                      dayItem.itemType !== "SUPPLY",
                                  ).length >= TOTAL_SERVICE_COMBOS
                                }
                              >
                                Adicionar serviço
                              </Button>
                              <Button
                                type="button"
                                variant="secondary"
                                style={{
                                  background: "#e7dcf3",
                                  color: "#4b3a66",
                                }}
                                onClick={() => addSupplyItem(index)}
                                disabled={supplies.length === 0}
                                title={
                                  supplies.length === 0
                                    ? "Nenhum material disponível no catálogo"
                                    : undefined
                                }
                              >
                                Adicionar material
                              </Button>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                            {items
                              .map((item, globalIndex) => ({
                                item,
                                globalIndex,
                              }))
                              .filter(
                                ({ item }) => item.eventDateIndex === index,
                              )
                              .map(({ item, globalIndex }) => {
                                const dayItemCount = items.filter(
                                  (dayItem) => dayItem.eventDateIndex === index,
                                ).length;

                                if (item.itemType === "SUPPLY") {
                                  const usedSupplyIds = new Set(
                                    items
                                      .filter(
                                        (other, i) =>
                                          i !== globalIndex &&
                                          other.itemType === "SUPPLY" &&
                                          other.eventDateIndex === index,
                                      )
                                      .map((other) => other.idSupplies)
                                      .filter(Boolean),
                                  );
                                  const supplyOptions = supplies.filter(
                                    (supply) =>
                                      supply.idSupplies === item.idSupplies ||
                                      !usedSupplyIds.has(supply.idSupplies),
                                  );

                                  return (
                                    <div
                                      key={`budget-item-${globalIndex}`}
                                      className="rounded-2xl border p-4"
                                      style={{
                                        borderColor: colors.brown[100],
                                      }}
                                    >
                                      <Select
                                        label="Material *"
                                        value={item.idSupplies}
                                        onChange={(event) => {
                                          const supply = supplies.find(
                                            (candidate) =>
                                              candidate.idSupplies ===
                                              event.target.value,
                                          );
                                          updateItem(globalIndex, {
                                            idSupplies: event.target.value,
                                            description: supply?.name ?? "",
                                            unit: supply?.defaultUnit ?? "",
                                          });
                                        }}
                                      >
                                        <option value="">
                                          {supplies.length
                                            ? "Selecione um material"
                                            : "Nenhum material disponível"}
                                        </option>
                                        {supplyOptions.map((supply) => (
                                          <option
                                            key={supply.idSupplies}
                                            value={supply.idSupplies}
                                          >
                                            {supply.name}
                                          </option>
                                        ))}
                                      </Select>
                                      <div className="mt-3 grid grid-cols-2 gap-3">
                                        <Input
                                          label="Unidade"
                                          value={formatSupplyUnit(item.unit)}
                                          readOnly
                                          disabled
                                          placeholder="Definida no material"
                                        />
                                        <Input
                                          label="Quantidade *"
                                          type="number"
                                          min={1}
                                          step={1}
                                          value={item.quantity}
                                          onChange={(event) =>
                                            updateItem(globalIndex, {
                                              quantity: event.target.value,
                                            })
                                          }
                                        />
                                      </div>
                                      <div className="mt-3 flex justify-end">
                                        <Button
                                          type="button"
                                          variant="secondary"
                                          onClick={() =>
                                            removeItem(globalIndex)
                                          }
                                          disabled={dayItemCount <= 1}
                                        >
                                          Remover
                                        </Button>
                                      </div>
                                    </div>
                                  );
                                }

                                const otherCombos = new Set(
                                  items
                                    .filter(
                                      (other, i) =>
                                        i !== globalIndex &&
                                        other.eventDateIndex === index,
                                    )
                                    .map((other) =>
                                      other.serviceType && other.gender
                                        ? serviceComboKey(
                                            other.serviceType,
                                            other.gender,
                                          )
                                        : null,
                                    )
                                    .filter(Boolean) as string[],
                                );
                                const isTypeAvailable = (
                                  type: BudgetServiceType,
                                ) =>
                                  serviceGenderOptions.some(
                                    (gender) =>
                                      !otherCombos.has(
                                        serviceComboKey(type, gender),
                                      ),
                                  );

                                return (
                                  <div
                                    key={`budget-item-${globalIndex}`}
                                    className="rounded-2xl border p-4"
                                    style={{ borderColor: colors.brown[100] }}
                                  >
                                    <Select
                                      label="Tipo de serviço *"
                                      value={item.serviceType}
                                      onChange={(event) => {
                                        const nextType = event.target.value as
                                          | BudgetServiceType
                                          | "";
                                        const preferredGender: ServiceGenderOption =
                                          "Masculino";
                                        const nextGender =
                                          nextType &&
                                          !otherCombos.has(
                                            serviceComboKey(
                                              nextType,
                                              preferredGender,
                                            ),
                                          )
                                            ? preferredGender
                                            : nextType
                                              ? (serviceGenderOptions.find(
                                                  (gender) =>
                                                    !otherCombos.has(
                                                      serviceComboKey(
                                                        nextType,
                                                        gender,
                                                      ),
                                                    ),
                                                ) ?? "")
                                              : "";
                                        updateItem(globalIndex, {
                                          serviceType: nextType,
                                          gender: nextGender,
                                        });
                                      }}
                                    >
                                      <option value="">
                                        Selecione o tipo de serviço
                                      </option>
                                      {budgetServiceTypeOptions
                                        .filter(
                                          (type) =>
                                            type === item.serviceType ||
                                            isTypeAvailable(type),
                                        )
                                        .map((type) => (
                                          <option key={type} value={type}>
                                            {type}
                                          </option>
                                        ))}
                                    </Select>

                                    {item.serviceType ? (
                                      <div className="mt-2 flex gap-4">
                                        {serviceGenderOptions.map(
                                          (genderOption) => {
                                            const isTaken = otherCombos.has(
                                              serviceComboKey(
                                                item.serviceType,
                                                genderOption,
                                              ),
                                            );
                                            return (
                                              <label
                                                key={genderOption}
                                                className="flex cursor-pointer items-center gap-1.5 text-sm"
                                                style={{
                                                  color: colors.brown[800],
                                                  opacity: isTaken ? 0.4 : 1,
                                                  pointerEvents: isTaken
                                                    ? "none"
                                                    : "auto",
                                                }}
                                              >
                                                <input
                                                  type="radio"
                                                  name={`item-gender-${globalIndex}`}
                                                  value={genderOption}
                                                  checked={
                                                    item.gender === genderOption
                                                  }
                                                  onChange={() =>
                                                    updateItem(globalIndex, {
                                                      gender: genderOption,
                                                    })
                                                  }
                                                  disabled={isTaken}
                                                />
                                                {genderOption}
                                              </label>
                                            );
                                          },
                                        )}
                                      </div>
                                    ) : null}

                                    <div className="mt-3">
                                      <Input
                                        label="Quantidade *"
                                        type="number"
                                        min={1}
                                        step={1}
                                        value={item.quantity}
                                        onChange={(event) =>
                                          updateItem(globalIndex, {
                                            quantity: event.target.value,
                                          })
                                        }
                                      />
                                    </div>

                                    <div className="mt-3 flex justify-end">
                                      <Button
                                        type="button"
                                        variant="secondary"
                                        onClick={() => removeItem(globalIndex)}
                                        disabled={dayItemCount <= 1}
                                      >
                                        Remover
                                      </Button>
                                    </div>
                                  </div>
                                );
                              })}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {itemsError ? (
                  <p className="text-sm text-red-600">{itemsError}</p>
                ) : null}
              </AccordionSection>

              {items.some(
                (item) =>
                  (item.serviceType && item.gender) ||
                  (item.itemType === "SUPPLY" && item.idSupplies),
              ) ? (
                <div
                  className="rounded-2xl border p-4"
                  style={{
                    borderColor: colors.brown[100],
                    background: "#faf6f2",
                  }}
                >
                  <p
                    className="mb-2 text-xs font-semibold uppercase tracking-wide"
                    style={{ color: colors.brown[500] }}
                  >
                    Resumo do pedido
                  </p>

                  {items.some((item) => item.serviceType && item.gender) ? (
                    <>
                      <p
                        className="mb-1 text-xs font-semibold"
                        style={{ color: colors.brown[500] }}
                      >
                        Serviços
                      </p>
                      <div className="flex flex-col gap-1">
                        {items
                          .filter((item) => item.serviceType && item.gender)
                          .map((item, index) => (
                            <div
                              key={`summary-service-${index}`}
                              className="flex items-center justify-between text-sm"
                              style={{ color: colors.brown[800] }}
                            >
                              <span>
                                {eventDayCount > 1
                                  ? `Dia ${item.eventDateIndex + 1} — `
                                  : ""}
                                {item.serviceType} ({item.gender})
                              </span>
                              <span className="font-semibold">
                                {item.quantity || 0}
                              </span>
                            </div>
                          ))}
                      </div>
                      <div
                        className="mt-2 flex items-center justify-between border-t pt-2 text-sm font-semibold"
                        style={{
                          borderColor: colors.brown[100],
                          color: colors.brown[800],
                        }}
                      >
                        <span>Total de profissionais</span>
                        <span>
                          {items.reduce(
                            (sum, item) =>
                              item.serviceType && item.gender
                                ? sum + (Number(item.quantity) || 0)
                                : sum,
                            0,
                          )}
                        </span>
                      </div>
                    </>
                  ) : null}

                  {items.some(
                    (item) => item.itemType === "SUPPLY" && item.idSupplies,
                  ) ? (
                    <>
                      <p
                        className="mb-1 mt-3 text-xs font-semibold"
                        style={{ color: colors.brown[500] }}
                      >
                        Materiais
                      </p>
                      <div className="flex flex-col gap-1">
                        {items
                          .filter(
                            (item) =>
                              item.itemType === "SUPPLY" && item.idSupplies,
                          )
                          .map((item, index) => {
                            const supply = supplies.find(
                              (candidate) =>
                                candidate.idSupplies === item.idSupplies,
                            );
                            const unitLabel = formatSupplyUnit(
                              supply?.defaultUnit ?? item.unit,
                            );
                            return (
                              <div
                                key={`summary-supply-${index}`}
                                className="flex items-center justify-between text-sm"
                                style={{ color: colors.brown[800] }}
                              >
                                <span>
                                  {eventDayCount > 1
                                    ? `Dia ${item.eventDateIndex + 1} — `
                                    : ""}
                                  {supply?.name ?? item.description}
                                  {unitLabel ? ` (${unitLabel})` : ""}
                                </span>
                                <span className="font-semibold">
                                  {item.quantity || 0}
                                </span>
                              </div>
                            );
                          })}
                      </div>
                    </>
                  ) : null}
                </div>
              ) : null}

              {error ? <p className="text-sm text-red-600">{error}</p> : null}
              <Button type="submit" variant="primary" disabled={submitting}>
                {submitting ? "Enviando..." : "Enviar informações"}
              </Button>
            </form>
          ) : null}

          {step === "done" ? (
            <div className="flex flex-col items-center gap-3 text-center">
              <CheckCircle2 size={40} className="text-green-600" />
              <p
                className="text-base font-semibold"
                style={{ color: colors.brown[800] }}
              >
                Informações recebidas!
              </p>
              <p className="text-sm" style={{ color: colors.brown[500] }}>
                Obrigado! Vamos analisar os detalhes do seu evento e entrar em
                contato em breve com o orçamento.
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

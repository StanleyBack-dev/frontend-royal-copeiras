import { useEffect, useState, type ReactNode } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  MapPin,
  Timer,
  Users,
} from "lucide-react";
import ManagementPanelTemplate from "@/components/templates/management/ManagementPanelTemplate";
import SectionCard from "@/components/organisms/SectionCard";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Select from "@/components/atoms/Select";
import {
  useEventsContext,
  eventUiCopy,
  getEventStatusLabel,
} from "@/features/events";
import { getEventStatusColors } from "@/features/events/model/constants";
import { useToast } from "@/shared/toast/useToast";
import { getEmployees } from "@/api/employees/methods/get";
import type { Employee } from "@/api/employees/schema";
import { eventRoutePaths } from "@/router/navigation/paths";
import type {
  Event,
  EventAssignment,
  EventExtraExpense,
  UpdateEventAssignmentPayload,
} from "@/api/events/schema";
import {
  formatCurrencyInput,
  parseCurrencyInput,
} from "@/features/budgets/model/formatters";
import {
  eventOvertimeOptions,
  formatOvertimeMinutes,
  toCurrencyInputValue,
} from "@/features/events/model/overtime";
import {
  formatEventDayLong,
  formatEventDayShort,
} from "@/features/events/model/formatters";
import EventExtraExpensesEditor, {
  type EventExtraExpenseDraft,
  type EventExtraExpenseDraftErrors,
} from "@/features/events/components/EventExtraExpensesEditor";
import EventAssignmentCard, {
  type EventAssignmentDraft,
  type EventAssignmentDraftErrors,
} from "@/features/events/components/EventAssignmentCard";
import EventFinancialSummary from "@/features/events/components/EventFinancialSummary";
import EventServicesStatement from "@/features/events/components/EventServicesStatement";
import { resolveAssignmentSlot } from "@/features/events/model/assignments";
import { EmployeeCreateModal } from "@/features/employees";

type AssignmentUpdate = {
  idEventAssignments: string;
  payload: UpdateEventAssignmentPayload;
};

const detailCopy = eventUiCopy.detail;
const EMPTY_ASSIGNMENT_DRAFT: EventAssignmentDraft = {
  selectedEmployee: "",
  payment: "",
  overtimePayment: "",
};

function toExtraExpenseDrafts(
  expenses: EventExtraExpense[],
): EventExtraExpenseDraft[] {
  return expenses.map((expense) => ({
    category: expense.category,
    amount: toCurrencyInputValue(expense.amount),
  }));
}

function parseAmount(value: string): number {
  return parseCurrencyInput(value) ?? 0;
}

function hasAmountChanged(next: number, current: number) {
  return Math.abs(next - current) > 0.000001;
}

export default function EventDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { allItems, loading, handleUpdateAssignments, handleUpdateEvent } =
    useEventsContext();
  const { showError } = useToast();

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [saving, setSaving] = useState(false);
  const [overtimeMinutesDraft, setOvertimeMinutesDraft] = useState(0);
  const [overtimeRateDraft, setOvertimeRateDraft] = useState("");
  const [overtimeRateError, setOvertimeRateError] = useState<string>();
  const [extraExpenseDrafts, setExtraExpenseDrafts] = useState<
    EventExtraExpenseDraft[]
  >([]);
  const [extraExpenseErrors, setExtraExpenseErrors] = useState<
    EventExtraExpenseDraftErrors[]
  >([]);
  const [assignmentDrafts, setAssignmentDrafts] = useState<
    Record<string, EventAssignmentDraft>
  >({});
  const [creatingEmployeeFor, setCreatingEmployeeFor] =
    useState<EventAssignment | null>(null);
  const [assignmentErrors, setAssignmentErrors] = useState<
    Record<string, EventAssignmentDraftErrors>
  >({});

  const event: Event | undefined = allItems.find((e) => e.idEvents === id);

  useEffect(() => {
    if (!event?.assignments) {
      setAssignmentDrafts({});
      return;
    }

    const nextDrafts = event.assignments.reduce<
      Record<string, EventAssignmentDraft>
    >((acc, assignment) => {
      acc[assignment.idEventAssignments] = {
        selectedEmployee: assignment.idEmployees ?? "",
        payment: toCurrencyInputValue(assignment.employeePayment),
        overtimePayment: toCurrencyInputValue(assignment.overtimeHourlyPayment),
      };
      return acc;
    }, {});

    setAssignmentDrafts(nextDrafts);
    setAssignmentErrors({});
  }, [event?.idEvents, event?.assignments]);

  useEffect(() => {
    setOvertimeMinutesDraft(event?.overtimeMinutes ?? 0);
  }, [event?.idEvents, event?.overtimeMinutes]);

  useEffect(() => {
    setOvertimeRateDraft(toCurrencyInputValue(event?.overtimeHourlyRate));
    setOvertimeRateError(undefined);
  }, [event?.idEvents, event?.overtimeHourlyRate]);

  useEffect(() => {
    setExtraExpenseDrafts(toExtraExpenseDrafts(event?.extraExpenses ?? []));
    setExtraExpenseErrors([]);
  }, [event?.idEvents, event?.extraExpenses]);

  useEffect(() => {
    setLoadingEmployees(true);
    getEmployees({ limit: 200 })
      .then((response) => {
        setEmployees(response.items.filter((emp) => emp.isActive));
      })
      .catch(() => {
        setEmployees([]);
      })
      .finally(() => {
        setLoadingEmployees(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div
          className="h-8 w-8 animate-spin rounded-full border-2"
          style={{ borderColor: "#7a4430", borderTopColor: "transparent" }}
        />
      </div>
    );
  }

  if (!event) {
    return (
      <ManagementPanelTemplate
        title={detailCopy.title}
        description={detailCopy.description}
      >
        <div className="rounded-xl border border-[#e8d5c9] bg-[#faf6f2] p-8 text-center text-sm text-[#7a4430]">
          Evento não encontrado.
        </div>
      </ManagementPanelTemplate>
    );
  }

  const eventId = event.idEvents;
  const statusColors = getEventStatusColors(event.status);

  const draftAssignments = event.assignments ?? [];
  const detailedServices = [...(event.serviceBreakdown ?? [])].sort(
    (left, right) => left.sortOrder - right.sortOrder,
  );
  const serviceUnitPriceByItemId = new Map(
    detailedServices.map((service) => [
      service.idBudgetItems,
      service.unitPrice,
    ]),
  );

  const eventDates = event.eventDates ?? [];
  const eventDayCount = eventDates.length || 1;
  const isMultiDayEvent = eventDayCount > 1;

  function dayLabel(dayIndex: number): string {
    const date = formatEventDayShort(eventDates[dayIndex]);
    return date ? `Dia ${dayIndex + 1} · ${date}` : `Dia ${dayIndex + 1}`;
  }

  const assignmentsByDay = Array.from(
    { length: eventDayCount },
    (_, dayIndex) =>
      draftAssignments.filter(
        (assignment) => (assignment.eventDateIndex ?? 0) === dayIndex,
      ),
  );

  // ── Financials (live, from drafts) ────────────────────────────────────────
  const activeAssignments = draftAssignments.filter(
    (assignment) => assignment.isActive,
  );
  const overtimeHoursDraft = overtimeMinutesDraft / 60;

  const teamCost = draftAssignments.reduce(
    (acc, assignment) =>
      acc +
      parseAmount(
        assignmentDrafts[assignment.idEventAssignments]?.payment ?? "",
      ),
    0,
  );
  const overtimeCost = activeAssignments.reduce(
    (acc, assignment) =>
      acc +
      overtimeHoursDraft *
        parseAmount(
          assignmentDrafts[assignment.idEventAssignments]?.overtimePayment ??
            "",
        ),
    0,
  );
  const extraExpensesTotal = extraExpenseDrafts.reduce(
    (acc, expense) => acc + parseAmount(expense.amount),
    0,
  );
  const overtimeRevenue =
    activeAssignments.length *
    overtimeHoursDraft *
    parseAmount(overtimeRateDraft);
  const servicesRevenue =
    event.totalRevenue - Number(event.overtimeAmount || 0);
  const totalRevenue = servicesRevenue + overtimeRevenue;
  const totalCost = teamCost + overtimeCost + extraExpensesTotal;

  // ── Pending changes ───────────────────────────────────────────────────────
  // An employee may work several days of the same event, but only one
  // allocation per day — so the "already taken" set is scoped per event day.
  function getSameDayEmployeeIds(assignment: EventAssignment): Set<string> {
    const dayIndex = assignment.eventDateIndex ?? 0;

    return new Set(
      draftAssignments
        .filter(
          (other) =>
            other.idEventAssignments !== assignment.idEventAssignments &&
            (other.eventDateIndex ?? 0) === dayIndex,
        )
        .map(
          (other) =>
            assignmentDrafts[other.idEventAssignments]?.selectedEmployee,
        )
        .filter((employeeId): employeeId is string => Boolean(employeeId)),
    );
  }

  const pendingUpdates = draftAssignments
    .map((assignment): AssignmentUpdate | null => {
      const draft = assignmentDrafts[assignment.idEventAssignments];
      if (!draft) {
        return null;
      }

      const nextPayment = parseAmount(draft.payment);
      const nextOvertimePayment = parseAmount(draft.overtimePayment);

      const employeeChanged =
        draft.selectedEmployee !== (assignment.idEmployees ?? "");
      const paymentChanged = hasAmountChanged(
        nextPayment,
        Number(assignment.employeePayment || 0),
      );
      const overtimePaymentChanged = hasAmountChanged(
        nextOvertimePayment,
        Number(assignment.overtimeHourlyPayment || 0),
      );

      if (!employeeChanged && !paymentChanged && !overtimePaymentChanged) {
        return null;
      }

      return {
        idEventAssignments: assignment.idEventAssignments,
        payload: {
          idEmployees: draft.selectedEmployee,
          employeePayment: nextPayment,
          overtimeHourlyPayment: nextOvertimePayment,
        },
      };
    })
    .filter((update): update is AssignmentUpdate => update !== null);

  // Rows without a category are blocked by validation before saving; they are
  // skipped here and still flagged as pending through the length comparison.
  const nextExtraExpenses: EventExtraExpense[] = extraExpenseDrafts.flatMap(
    (expense) =>
      expense.category
        ? [{ category: expense.category, amount: parseAmount(expense.amount) }]
        : [],
  );

  const pendingEventChanges = {
    overtimeMinutes: overtimeMinutesDraft !== (event.overtimeMinutes ?? 0),
    overtimeHourlyRate: hasAmountChanged(
      parseAmount(overtimeRateDraft),
      Number(event.overtimeHourlyRate || 0),
    ),
    extraExpenses:
      extraExpenseDrafts.length !== (event.extraExpenses ?? []).length ||
      JSON.stringify(nextExtraExpenses) !==
        JSON.stringify(event.extraExpenses ?? []),
  };
  const hasPendingEventChanges =
    Object.values(pendingEventChanges).some(Boolean);
  const hasPendingChanges = pendingUpdates.length > 0 || hasPendingEventChanges;

  const filledSlots = activeAssignments.filter(
    (assignment) =>
      assignmentDrafts[assignment.idEventAssignments]?.selectedEmployee,
  ).length;

  // ── Validation ────────────────────────────────────────────────────────────
  function validateAssignmentDrafts() {
    const nextErrors: Record<string, EventAssignmentDraftErrors> = {};

    for (const assignment of activeAssignments) {
      const draft = assignmentDrafts[assignment.idEventAssignments];
      const rowErrors: EventAssignmentDraftErrors = {};

      if (!draft?.selectedEmployee?.trim()) {
        rowErrors.employee = "Funcionário é obrigatório.";
      }

      if (!draft?.payment?.trim()) {
        rowErrors.payment = "Pagamento é obrigatório.";
      }

      if (!draft?.overtimePayment?.trim()) {
        rowErrors.overtimePayment = "Valor da hora extra é obrigatório.";
      }

      if (Object.keys(rowErrors).length > 0) {
        nextErrors[assignment.idEventAssignments] = rowErrors;
      }
    }

    setAssignmentErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function validateFinancialDrafts() {
    const rateError = overtimeRateDraft.trim()
      ? undefined
      : eventUiCopy.errors.required;
    const expenseErrors = extraExpenseDrafts.map((expense) => ({
      category: expense.category
        ? undefined
        : detailCopy.extraExpenses.categoryRequired,
      amount:
        parseAmount(expense.amount) > 0
          ? undefined
          : detailCopy.extraExpenses.amountRequired,
    }));

    setOvertimeRateError(rateError);
    setExtraExpenseErrors(expenseErrors);

    return (
      !rateError &&
      expenseErrors.every((errors) => !errors.category && !errors.amount)
    );
  }

  // ── Draft updates ─────────────────────────────────────────────────────────
  function updateAssignmentDraft(
    idEventAssignments: string,
    patch: Partial<EventAssignmentDraft>,
    field: keyof EventAssignmentDraftErrors,
  ) {
    setAssignmentDrafts((prev) => ({
      ...prev,
      [idEventAssignments]: { ...prev[idEventAssignments], ...patch },
    }));
    setAssignmentErrors((prev) => ({
      ...prev,
      [idEventAssignments]: { ...prev[idEventAssignments], [field]: undefined },
    }));
  }

  function updateExtraExpense(
    index: number,
    patch: Partial<EventExtraExpenseDraft>,
  ) {
    setExtraExpenseDrafts((prev) =>
      prev.map((expense, i) =>
        i === index ? { ...expense, ...patch } : expense,
      ),
    );
    setExtraExpenseErrors((prev) =>
      prev.map((errors, i) =>
        i === index
          ? {
              ...errors,
              ...(patch.category !== undefined ? { category: undefined } : {}),
              ...(patch.amount !== undefined ? { amount: undefined } : {}),
            }
          : errors,
      ),
    );
  }

  function addExtraExpense() {
    setExtraExpenseDrafts((prev) => [...prev, { category: "", amount: "" }]);
    setExtraExpenseErrors((prev) => [...prev, {}]);
  }

  function removeExtraExpense(index: number) {
    setExtraExpenseDrafts((prev) => prev.filter((_, i) => i !== index));
    setExtraExpenseErrors((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSave() {
    const assignmentsValid = validateAssignmentDrafts();
    const financialValid = validateFinancialDrafts();

    if (!assignmentsValid || !financialValid) {
      showError(
        eventUiCopy.errors.updateFallback,
        !assignmentsValid
          ? eventUiCopy.errors.assignmentRequiredFields
          : eventUiCopy.errors.financialRequiredFields,
      );
      return;
    }

    if (!hasPendingChanges) {
      return;
    }

    setSaving(true);
    try {
      if (hasPendingEventChanges) {
        await handleUpdateEvent(eventId, {
          ...(pendingEventChanges.overtimeMinutes
            ? { overtimeMinutes: overtimeMinutesDraft }
            : {}),
          ...(pendingEventChanges.overtimeHourlyRate
            ? { overtimeHourlyRate: parseAmount(overtimeRateDraft) }
            : {}),
          ...(pendingEventChanges.extraExpenses
            ? { extraExpenses: nextExtraExpenses }
            : {}),
        });
      }

      if (pendingUpdates.length) {
        await handleUpdateAssignments(pendingUpdates);
      }
    } finally {
      setSaving(false);
    }
  }

  function renderAssignment(assignment: EventAssignment) {
    const { idEventAssignments } = assignment;

    return (
      <EventAssignmentCard
        key={idEventAssignments}
        assignment={assignment}
        employees={employees}
        draft={assignmentDrafts[idEventAssignments] ?? EMPTY_ASSIGNMENT_DRAFT}
        errors={assignmentErrors[idEventAssignments]}
        chargedAmount={
          serviceUnitPriceByItemId.get(assignment.idBudgetItems ?? "") ?? 0
        }
        overtimeMinutes={overtimeMinutesDraft}
        sameDayEmployeeIds={getSameDayEmployeeIds(assignment)}
        disabled={saving}
        onSelectedEmployeeChange={(value) =>
          updateAssignmentDraft(
            idEventAssignments,
            { selectedEmployee: value },
            "employee",
          )
        }
        onPaymentChange={(value) =>
          updateAssignmentDraft(
            idEventAssignments,
            { payment: formatCurrencyInput(value) },
            "payment",
          )
        }
        onOvertimePaymentChange={(value) =>
          updateAssignmentDraft(
            idEventAssignments,
            { overtimePayment: formatCurrencyInput(value) },
            "overtimePayment",
          )
        }
        onCreateEmployee={() => setCreatingEmployeeFor(assignment)}
      />
    );
  }

  function handleEmployeeCreated(employee: Employee) {
    const target = creatingEmployeeFor;
    setCreatingEmployeeFor(null);

    if (employee.isActive) {
      setEmployees((prev) =>
        [...prev, employee].sort((left, right) =>
          left.name.localeCompare(right.name, "pt-BR"),
        ),
      );
    }

    if (target) {
      updateAssignmentDraft(
        target.idEventAssignments,
        { selectedEmployee: employee.idEmployees },
        "employee",
      );
    }
  }

  return (
    <ManagementPanelTemplate
      title={
        event.eventNumber ? `Evento ${event.eventNumber}` : detailCopy.title
      }
      badge={
        <span
          className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusColors ? `${statusColors.bg} ${statusColors.text} ${statusColors.border}` : "border-[#e8d5c9] bg-[#faf6f2] text-[#7a4430]"}`}
        >
          {getEventStatusLabel(event.status)}
        </span>
      }
      description={event.customerName || event.leadName || undefined}
      actions={
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => navigate(eventRoutePaths.list)}
        >
          <ArrowLeft size={14} className="mr-1.5" />
          Voltar para eventos
        </Button>
      }
    >
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-w-0 xl:col-start-1">
          <SectionCard title={detailCopy.infoSection}>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-4 lg:grid-cols-4">
              <Fact
                label={detailCopy.fields.customer}
                value={event.customerName || event.leadName || "-"}
              />
              <Fact
                label={detailCopy.fields.contract}
                value={event.contractNumber || "-"}
              />
              <Fact
                label={detailCopy.fields.budget}
                value={event.budgetNumber || "-"}
              />
              <Fact
                label={detailCopy.fields.location}
                value={event.eventLocation || "-"}
              />
            </dl>

            <div
              className={`mt-5 grid grid-cols-1 gap-3 ${isMultiDayEvent ? "md:grid-cols-2" : ""}`}
            >
              {Array.from({ length: eventDayCount }, (_, dayIndex) => (
                <EventDayCard
                  key={dayIndex}
                  title={
                    isMultiDayEvent
                      ? dayLabel(dayIndex)
                      : formatEventDayLong(eventDates[dayIndex])
                  }
                  subtitle={
                    isMultiDayEvent
                      ? formatEventDayLong(eventDates[dayIndex])
                      : undefined
                  }
                  location={event.eventLocationPerDay?.[dayIndex]}
                  arrival={event.eventArrivalTimes?.[dayIndex]}
                  departure={event.eventDepartureTimes?.[dayIndex]}
                  guests={event.guestCountPerDay?.[dayIndex]}
                  durationHours={event.durationHoursPerDay?.[dayIndex]}
                />
              ))}
            </div>

            {event.notes ? (
              <div className="mt-4 rounded-xl bg-[#faf6f2] px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[#9a7563]">
                  {detailCopy.fields.notes}
                </p>
                <p className="mt-1 whitespace-pre-line text-sm text-[#2c1810]">
                  {event.notes}
                </p>
              </div>
            ) : null}
          </SectionCard>
        </div>

        <aside className="min-w-0 xl:sticky xl:top-4 xl:col-start-2 xl:row-span-2 xl:row-start-1 xl:self-start">
          <EventFinancialSummary
            totals={{
              servicesRevenue,
              overtimeRevenue,
              totalRevenue,
              teamCost,
              overtimeCost,
              extraExpenses: extraExpensesTotal,
              totalCost,
              companyReceivable: totalRevenue - totalCost,
            }}
            overtimeLabel={
              overtimeMinutesDraft > 0
                ? formatOvertimeMinutes(overtimeMinutesDraft)
                : undefined
            }
            footer={
              <div className="flex flex-col gap-2">
                <Button
                  type="button"
                  variant="primary"
                  className="w-full"
                  onClick={() => {
                    void handleSave();
                  }}
                  disabled={saving || !hasPendingChanges}
                >
                  {saving
                    ? detailCopy.assignment.saving
                    : detailCopy.summary.save}
                </Button>
                <p
                  className={`text-center text-xs ${hasPendingChanges ? "text-amber-700" : "text-[#9a7563]"}`}
                >
                  {hasPendingChanges
                    ? detailCopy.summary.pendingChanges
                    : detailCopy.summary.noChanges}
                </p>
              </div>
            }
          />
        </aside>

        <div className="flex min-w-0 flex-col gap-6 xl:col-start-1">
          <SectionCard title={detailCopy.sections.services}>
            <EventServicesStatement
              services={detailedServices}
              dayCount={eventDayCount}
              dayLabel={dayLabel}
              displacementFee={Number(event.displacementFee || 0)}
              discountTotal={Number(event.discountTotal || 0)}
            />
          </SectionCard>

          <SectionCard
            title={detailCopy.sections.adjustments}
            description={detailCopy.sections.adjustmentsDescription}
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Select
                label={detailCopy.fields.overtime}
                value={String(overtimeMinutesDraft)}
                onChange={(e) => {
                  const parsedMinutes = Number(e.target.value);
                  setOvertimeMinutesDraft(
                    Number.isFinite(parsedMinutes) ? parsedMinutes : 0,
                  );
                }}
                disabled={saving}
              >
                <option value="0">Sem horas extras</option>
                {eventOvertimeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>

              <Input
                label={detailCopy.fields.overtimeHourlyRate}
                value={overtimeRateDraft}
                onChange={(e) => {
                  setOvertimeRateDraft(formatCurrencyInput(e.target.value));
                  setOvertimeRateError(undefined);
                }}
                placeholder="R$ 0,00"
                inputMode="decimal"
                error={overtimeRateError}
                disabled={saving}
              />
            </div>

            <div className="my-5 h-px bg-[#f1e6de]" />

            <EventExtraExpensesEditor
              expenses={extraExpenseDrafts}
              errors={extraExpenseErrors}
              onAdd={addExtraExpense}
              onRemove={removeExtraExpense}
              onUpdate={updateExtraExpense}
              disabled={saving}
            />
          </SectionCard>

          <SectionCard
            title={detailCopy.sections.team}
            action={
              activeAssignments.length > 0 ? (
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${filledSlots === activeAssignments.length ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-800"}`}
                >
                  {detailCopy.sections.teamProgress
                    .replace("{done}", String(filledSlots))
                    .replace("{total}", String(activeAssignments.length))}
                </span>
              ) : null
            }
          >
            {loadingEmployees ? (
              <div className="flex h-16 items-center justify-center">
                <div
                  className="h-6 w-6 animate-spin rounded-full border-2"
                  style={{
                    borderColor: "#7a4430",
                    borderTopColor: "transparent",
                  }}
                />
              </div>
            ) : draftAssignments.length === 0 ? (
              <p className="text-sm text-[#7a4430]">
                {detailCopy.noAssignments}
              </p>
            ) : isMultiDayEvent ? (
              <div className="flex flex-col gap-6">
                {assignmentsByDay.map((dayAssignments, dayIndex) =>
                  dayAssignments.length > 0 ? (
                    <div key={dayIndex}>
                      <div className="mb-3 flex items-center gap-3">
                        <p className="text-xs font-semibold uppercase tracking-wider text-[#a16207]">
                          {dayLabel(dayIndex)}
                        </p>
                        <div className="h-px flex-1 bg-[#f1e6de]" />
                      </div>
                      <div className="flex flex-col gap-3">
                        {dayAssignments.map(renderAssignment)}
                      </div>
                    </div>
                  ) : null,
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {draftAssignments.map(renderAssignment)}
              </div>
            )}
          </SectionCard>
        </div>
      </div>

      {creatingEmployeeFor ? (
        <EmployeeCreateModal
          initialValues={{
            gender: resolveAssignmentSlot(creatingEmployeeFor).requiredGender,
          }}
          onClose={() => setCreatingEmployeeFor(null)}
          onCreated={handleEmployeeCreated}
        />
      ) : null}
    </ManagementPanelTemplate>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-[11px] font-semibold uppercase tracking-wider text-[#9a7563]">
        {label}
      </dt>
      <dd className="mt-1 truncate text-sm font-medium text-[#2c1810]">
        {value}
      </dd>
    </div>
  );
}

function EventDayCard({
  title,
  subtitle,
  location,
  arrival,
  departure,
  guests,
  durationHours,
}: {
  title: string;
  subtitle?: string;
  location?: string;
  arrival?: string;
  departure?: string;
  guests?: number;
  durationHours?: number;
}) {
  return (
    <div className="rounded-xl border border-[#efe2d8] bg-[#fcf9f6] p-4">
      <div className="flex items-start gap-2">
        <CalendarDays size={16} className="mt-0.5 shrink-0 text-[#a16207]" />
        <div className="min-w-0">
          <p className="text-sm font-semibold capitalize text-[#2c1810]">
            {title}
          </p>
          {subtitle ? (
            <p className="text-xs capitalize text-[#9a7563]">{subtitle}</p>
          ) : null}
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-[#5a3322]">
        <DayDetail icon={<Clock size={14} />}>
          {arrival || "-"} às {departure || "-"}
        </DayDetail>
        <DayDetail icon={<Timer size={14} />}>
          {durationHours ? `${durationHours}h` : "-"}
        </DayDetail>
        <DayDetail icon={<Users size={14} />}>
          {guests ?? "-"} convidados
        </DayDetail>
        <DayDetail icon={<MapPin size={14} />}>{location || "-"}</DayDetail>
      </div>
    </div>
  );
}

function DayDetail({
  icon,
  children,
}: {
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex min-w-0 items-center gap-1.5">
      <span className="shrink-0 text-[#b08d7a]">{icon}</span>
      <span className="truncate">{children}</span>
    </div>
  );
}

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
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
import { getEmployees } from "@/api/employees/methods/get";
import type { Employee } from "@/api/employees/schema";
import { eventRoutePaths } from "@/router/navigation/paths";
import type { Event, EventAssignment } from "@/api/events/schema";
import { inferBudgetServiceType } from "@/features/budgets/model/service-items";
import {
  formatCurrencyInput,
  parseCurrencyInput,
} from "@/features/budgets/model/formatters";

function formatCurrencyBRL(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function formatEventDates(dates?: string[] | null): string {
  if (!dates || dates.length === 0) return "-";
  return dates
    .map((d) => {
      const date = new Date(`${d}T12:00:00`);
      if (Number.isNaN(date.getTime())) return d;
      return new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        weekday: "long",
      }).format(date);
    })
    .join(", ");
}

interface AssignmentRowProps {
  assignment: EventAssignment;
  employees: Employee[];
  selectedEmployee: string;
  payment: string;
  chargedAmount: number;
  selectedEmployeeIds: Set<string>;
  onSelectedEmployeeChange: (value: string) => void;
  onPaymentChange: (value: string) => void;
}

type AssignmentUpdate = {
  idEventAssignments: string;
  payload: { idEmployees: string | undefined; employeePayment: number };
};

function AssignmentRow({
  assignment,
  employees,
  selectedEmployee,
  payment,
  chargedAmount,
  selectedEmployeeIds,
  onSelectedEmployeeChange,
  onPaymentChange,
}: AssignmentRowProps) {
  const availableEmployees = employees.filter(
    (employee) =>
      employee.idEmployees === selectedEmployee ||
      !selectedEmployeeIds.has(employee.idEmployees),
  );

  const serviceLabel = assignment.budgetItemDescription || "-";
  const inferredServiceType = assignment.budgetItemDescription
    ? inferBudgetServiceType(assignment.budgetItemDescription)
    : "";
  const assignmentLabel = inferredServiceType
    ? `${inferredServiceType} ${assignment.allocationIndex}`
    : `Serviço ${assignment.allocationIndex}`;
  const currentEmployeeLabel = assignment.employeeName
    ? `Atual: ${assignment.employeeName}`
    : null;
  const paymentValue = parseCurrencyInput(payment) ?? 0;
  const receivedAmount = chargedAmount - paymentValue;

  return (
    <div className="rounded-xl border border-[#e8d5c9] bg-[#faf6f2] p-4">
      <div className="mb-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#7a4430]">
          {assignmentLabel}
        </p>
        <p className="text-sm font-semibold text-[#2c1810]">{serviceLabel}</p>
        {currentEmployeeLabel && (
          <p className="text-xs text-[#7a4430]">{currentEmployeeLabel}</p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <Select
          label={eventUiCopy.detail.assignment.employee}
          value={selectedEmployee}
          onChange={(e) => onSelectedEmployeeChange(e.target.value)}
        >
          <option value="">— Não atribuído —</option>
          {availableEmployees.map((emp) => (
            <option key={emp.idEmployees} value={emp.idEmployees}>
              {emp.name}
              {emp.position ? ` (${emp.position})` : ""}
            </option>
          ))}
        </Select>

        <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#a16207]">
              Valor cobrado
            </p>
            <div className="mt-1 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2.5 text-sm font-semibold text-amber-800">
              {formatCurrencyBRL(chargedAmount)}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#166534]">
              Valor recebido
            </p>
            <div className="mt-1 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2.5 text-sm font-semibold text-emerald-800">
              {formatCurrencyBRL(receivedAmount)}
            </div>
          </div>

          <div>
            <div className="mb-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#7a4430]">
                {eventUiCopy.detail.assignment.payment}
              </p>
            </div>

            <Input
              value={payment}
              onChange={(e) => onPaymentChange(e.target.value)}
              placeholder="0,00"
              inputMode="decimal"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function EventDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { allItems, loading, handleUpdateAssignments } = useEventsContext();

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [savingAssignments, setSavingAssignments] = useState(false);
  const [assignmentDrafts, setAssignmentDrafts] = useState<
    Record<string, { selectedEmployee: string; payment: string }>
  >({});

  const event: Event | undefined = allItems.find((e) => e.idEvents === id);

  useEffect(() => {
    if (!event?.assignments) {
      setAssignmentDrafts({});
      return;
    }

    const nextDrafts = event.assignments.reduce<
      Record<string, { selectedEmployee: string; payment: string }>
    >((acc, assignment) => {
      acc[assignment.idEventAssignments] = {
        selectedEmployee: assignment.idEmployees ?? "",
        payment:
          assignment.employeePayment > 0
            ? formatCurrencyInput(
                String(Math.round(Number(assignment.employeePayment) * 100)),
              )
            : "",
      };
      return acc;
    }, {});

    setAssignmentDrafts(nextDrafts);
  }, [event?.idEvents, event?.assignments]);

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
        title={eventUiCopy.detail.title}
        description={eventUiCopy.detail.description}
      >
        <div className="rounded-xl border border-[#e8d5c9] bg-[#faf6f2] p-8 text-center text-sm text-[#7a4430]">
          Evento não encontrado.
        </div>
      </ManagementPanelTemplate>
    );
  }

  const statusLabel = getEventStatusLabel(event.status);

  function parsePaymentValue(value: string): number {
    return parseCurrencyInput(value) ?? 0;
  }

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

  const dynamicTotalCost = draftAssignments.reduce((acc, assignment) => {
    const draft = assignmentDrafts[assignment.idEventAssignments];
    const payment = draft ? parsePaymentValue(draft.payment) : 0;
    return acc + payment;
  }, 0);

  const dynamicCompanyReceivable = event.totalRevenue - dynamicTotalCost;

  const selectedEmployeeIds = new Set(
    Object.values(assignmentDrafts)
      .map((draft) => draft.selectedEmployee)
      .filter(Boolean),
  );

  const pendingUpdates = draftAssignments
    .map((assignment) => {
      const draft = assignmentDrafts[assignment.idEventAssignments];
      if (!draft) {
        return null;
      }

      const nextEmployeeId = draft.selectedEmployee || undefined;
      const currentEmployeeId = assignment.idEmployees || undefined;
      const nextPayment = parsePaymentValue(draft.payment);
      const currentPayment = Number(assignment.employeePayment || 0);

      const employeeChanged = nextEmployeeId !== currentEmployeeId;
      const paymentChanged = Math.abs(nextPayment - currentPayment) > 0.000001;

      if (!employeeChanged && !paymentChanged) {
        return null;
      }

      return {
        idEventAssignments: assignment.idEventAssignments,
        payload: {
          idEmployees: nextEmployeeId,
          employeePayment: nextPayment,
        },
      } satisfies AssignmentUpdate;
    })
    .filter((update): update is AssignmentUpdate => update !== null);

  async function handleSaveAllAssignments() {
    if (!pendingUpdates.length) {
      return;
    }

    setSavingAssignments(true);
    try {
      await handleUpdateAssignments(pendingUpdates);
    } finally {
      setSavingAssignments(false);
    }
  }

  return (
    <ManagementPanelTemplate
      title={eventUiCopy.detail.title}
      description={eventUiCopy.detail.description}
    >
      <div className="mb-2">
        <button
          type="button"
          onClick={() => navigate(eventRoutePaths.list)}
          className="flex items-center gap-1.5 text-sm text-[#7a4430] hover:underline"
        >
          <ArrowLeft size={14} />
          Voltar para eventos
        </button>
      </div>

      <SectionCard title={eventUiCopy.detail.infoSection}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <InfoField
            label={eventUiCopy.detail.fields.contract}
            value={event.contractNumber || "-"}
          />
          <InfoField
            label={eventUiCopy.detail.fields.budget}
            value={event.budgetNumber || "-"}
          />
          <InfoField
            label={eventUiCopy.detail.fields.status}
            value={statusLabel}
          />
          <InfoField
            label={eventUiCopy.detail.fields.location}
            value={event.eventLocation || "-"}
          />
          <InfoField
            label={eventUiCopy.detail.fields.dates}
            value={formatEventDates(event.eventDates)}
          />
          {(event.customerName || event.leadName) && (
            <InfoField
              label="Cliente"
              value={event.customerName || event.leadName || "-"}
            />
          )}
          {event.notes && (
            <div className="sm:col-span-2 lg:col-span-3">
              <InfoField
                label={eventUiCopy.detail.fields.notes}
                value={event.notes}
              />
            </div>
          )}

          <div className="sm:col-span-2 lg:col-span-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#7a4430]">
              Extrato dos serviços
            </p>
            <div className="mt-2 rounded-xl border border-[#e8d5c9] bg-white p-3">
              {detailedServices.length > 0 ? (
                <div className="space-y-2">
                  {detailedServices.map((service) => (
                    <div
                      key={service.idBudgetItems}
                      className="flex items-start justify-between gap-3 text-sm"
                    >
                      <div>
                        <p className="font-medium text-[#2c1810]">
                          {inferBudgetServiceType(
                            service.serviceDescription ?? "",
                          ) || "Serviço"}
                        </p>
                        <p className="text-xs text-[#7a4430]">
                          {service.quantity} x{" "}
                          {formatCurrencyBRL(service.unitPrice)}
                        </p>
                      </div>
                      <p className="font-semibold text-[#2c1810]">
                        {formatCurrencyBRL(service.totalPrice)}
                      </p>
                    </div>
                  ))}

                  <div className="my-2 h-px w-full bg-[#e8d5c9]" />

                  <div className="flex items-center justify-between text-sm">
                    <p className="font-medium text-[#7a4430]">Deslocamento</p>
                    <p className="font-semibold text-[#2c1810]">
                      {formatCurrencyBRL(event.displacementFee || 0)}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-[#7a4430]">
                  Nenhum item detalhado disponível para este evento.
                </p>
              )}
            </div>
          </div>
        </div>
      </SectionCard>

      <SectionCard title={eventUiCopy.detail.financialSection}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <FinancialCard
            label={eventUiCopy.detail.fields.totalRevenue}
            value={formatCurrencyBRL(event.totalRevenue)}
            colorClass="text-[#2c1810]"
          />
          <FinancialCard
            label={eventUiCopy.detail.fields.totalCost}
            value={formatCurrencyBRL(dynamicTotalCost)}
            colorClass="text-red-700"
          />
          <FinancialCard
            label={eventUiCopy.detail.fields.companyReceivable}
            value={formatCurrencyBRL(dynamicCompanyReceivable)}
            colorClass={
              dynamicCompanyReceivable >= 0 ? "text-green-700" : "text-red-700"
            }
            highlight
          />
        </div>
      </SectionCard>

      <SectionCard title={eventUiCopy.detail.assignmentsSection}>
        {loadingEmployees ? (
          <div className="flex h-16 items-center justify-center">
            <div
              className="h-6 w-6 animate-spin rounded-full border-2"
              style={{ borderColor: "#7a4430", borderTopColor: "transparent" }}
            />
          </div>
        ) : event.assignments && event.assignments.length > 0 ? (
          <div className="flex flex-col gap-3">
            {event.assignments.map((assignment) => (
              <AssignmentRow
                key={assignment.idEventAssignments}
                assignment={assignment}
                employees={employees}
                selectedEmployee={
                  assignmentDrafts[assignment.idEventAssignments]
                    ?.selectedEmployee ?? ""
                }
                payment={
                  assignmentDrafts[assignment.idEventAssignments]?.payment ?? ""
                }
                chargedAmount={
                  serviceUnitPriceByItemId.get(
                    assignment.idBudgetItems ?? "",
                  ) ?? 0
                }
                selectedEmployeeIds={selectedEmployeeIds}
                onSelectedEmployeeChange={(value) => {
                  setAssignmentDrafts((prev) => ({
                    ...prev,
                    [assignment.idEventAssignments]: {
                      ...prev[assignment.idEventAssignments],
                      selectedEmployee: value,
                    },
                  }));
                }}
                onPaymentChange={(value) => {
                  setAssignmentDrafts((prev) => ({
                    ...prev,
                    [assignment.idEventAssignments]: {
                      ...prev[assignment.idEventAssignments],
                      payment: formatCurrencyInput(value),
                    },
                  }));
                }}
              />
            ))}

            <div className="flex justify-end">
              <Button
                type="button"
                variant="primary"
                onClick={() => {
                  void handleSaveAllAssignments();
                }}
                disabled={savingAssignments || pendingUpdates.length === 0}
              >
                {savingAssignments
                  ? eventUiCopy.detail.assignment.saving
                  : "Salvar alterações da equipe"}
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-[#7a4430]">
            {eventUiCopy.detail.noAssignments}
          </p>
        )}
      </SectionCard>
    </ManagementPanelTemplate>
  );
}

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-[#7a4430]">
        {label}
      </p>
      <p className="mt-1 text-sm text-[#2c1810]">{value}</p>
    </div>
  );
}

function FinancialCard({
  label,
  value,
  colorClass,
  highlight = false,
}: {
  label: string;
  value: string;
  colorClass: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-4 ${highlight ? "border-[#7a4430] bg-[#faf6f2]" : "border-[#e8d5c9] bg-white"}`}
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-[#7a4430]">
        {label}
      </p>
      <p className={`mt-1 text-xl font-bold ${colorClass}`}>{value}</p>
    </div>
  );
}

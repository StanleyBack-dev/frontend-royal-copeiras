import { UserPlus } from "lucide-react";
import Input from "@/components/atoms/Input";
import Select from "@/components/atoms/Select";
import type { Employee } from "@/api/employees/schema";
import type { EventAssignment } from "@/api/events/schema";
import { parseCurrencyInput } from "@/features/budgets/model/formatters";
import { eventUiCopy } from "../model/messages";
import { formatCurrencyBRL } from "../model/formatters";
import { resolveAssignmentSlot } from "../model/assignments";

export type EventAssignmentDraft = {
  selectedEmployee: string;
  payment: string;
  overtimePayment: string;
};

export type EventAssignmentDraftErrors = {
  employee?: string;
  payment?: string;
  overtimePayment?: string;
};

interface EventAssignmentCardProps {
  assignment: EventAssignment;
  employees: Employee[];
  draft: EventAssignmentDraft;
  errors?: EventAssignmentDraftErrors;
  chargedAmount: number;
  overtimeMinutes: number;
  /** Employees already picked for another allocation on the same event day. */
  sameDayEmployeeIds: Set<string>;
  disabled?: boolean;
  onSelectedEmployeeChange: (value: string) => void;
  onPaymentChange: (value: string) => void;
  onOvertimePaymentChange: (value: string) => void;
  /** Opens the inline "new employee" form for this slot. */
  onCreateEmployee?: () => void;
}

const copy = eventUiCopy.detail.assignment;

export default function EventAssignmentCard({
  assignment,
  employees,
  draft,
  errors,
  chargedAmount,
  overtimeMinutes,
  sameDayEmployeeIds,
  disabled = false,
  onSelectedEmployeeChange,
  onPaymentChange,
  onOvertimePaymentChange,
  onCreateEmployee,
}: EventAssignmentCardProps) {
  const { selectedEmployee, payment, overtimePayment } = draft;
  const { label, requiredGender } = resolveAssignmentSlot(assignment);

  const margin = chargedAmount - (parseCurrencyInput(payment) ?? 0);
  const overtimePaymentTotal =
    (overtimeMinutes / 60) * (parseCurrencyInput(overtimePayment) ?? 0);

  const availableEmployees = employees.filter((employee) => {
    if (employee.idEmployees === selectedEmployee) return true;
    if (sameDayEmployeeIds.has(employee.idEmployees)) return false;
    return !requiredGender || employee.gender === requiredGender;
  });

  return (
    <div className="rounded-xl border border-[#efe2d8] bg-white p-3 transition-colors hover:border-[#dcc3b2] sm:p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5">
        <div className="flex min-w-0 items-center gap-2">
          <span
            className={`h-2 w-2 shrink-0 rounded-full ${selectedEmployee ? "bg-emerald-500" : "bg-amber-400"}`}
            aria-hidden
          />
          <p className="truncate text-sm font-semibold text-[#2c1810]">
            {label}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
          <span className="whitespace-nowrap text-[#9a7563]">
            {copy.charged}{" "}
            <span className="font-semibold text-[#2c1810]">
              {formatCurrencyBRL(chargedAmount)}
            </span>
          </span>
          <span
            className={`whitespace-nowrap rounded-full px-2 py-0.5 font-semibold ${margin >= 0 ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}
          >
            {copy.margin} {formatCurrencyBRL(margin)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <div className="mb-1 flex items-center justify-between gap-2">
            <label
              htmlFor={`employee-${assignment.idEventAssignments}`}
              className="text-xs font-semibold uppercase tracking-wide text-[#7a4430]"
            >
              {copy.employee}
            </label>
            {onCreateEmployee ? (
              <button
                type="button"
                onClick={onCreateEmployee}
                disabled={disabled}
                className="flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-semibold text-[#a16207] transition-colors hover:bg-amber-50 disabled:opacity-50"
              >
                <UserPlus size={13} />
                {copy.createEmployee}
              </button>
            ) : null}
          </div>
          <Select
            id={`employee-${assignment.idEventAssignments}`}
            value={selectedEmployee}
            onChange={(e) => onSelectedEmployeeChange(e.target.value)}
            error={errors?.employee}
            disabled={disabled}
          >
            <option value="">{copy.selectEmployee}</option>
            {availableEmployees.map((employee) => (
              <option key={employee.idEmployees} value={employee.idEmployees}>
                {employee.name}
              </option>
            ))}
          </Select>
        </div>

        <Input
          label={copy.payment}
          value={payment}
          onChange={(e) => onPaymentChange(e.target.value)}
          placeholder="R$ 0,00"
          inputMode="decimal"
          error={errors?.payment}
          disabled={disabled}
        />

        <div>
          <Input
            label={copy.overtimePayment}
            value={overtimePayment}
            onChange={(e) => onOvertimePaymentChange(e.target.value)}
            placeholder="R$ 0,00"
            inputMode="decimal"
            error={errors?.overtimePayment}
            disabled={disabled}
          />
          {overtimeMinutes > 0 && !errors?.overtimePayment ? (
            <p className="mt-1 text-xs text-[#9a7563]">
              {copy.overtimeTotal} {formatCurrencyBRL(overtimePaymentTotal)}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

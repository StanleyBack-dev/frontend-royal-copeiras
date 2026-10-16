import type { Event } from "@/api/events/schema";
import {
  getBudgetServiceDisplayLabel,
  inferBudgetServiceType,
  inferServiceGenderFromDescription,
  type BudgetServiceType,
} from "@/features/budgets/model/service-items";
import { eventUiCopy } from "../model/messages";
import { formatCurrencyBRL } from "../model/formatters";

type ServiceLine = Event["serviceBreakdown"][number];

interface EventServicesStatementProps {
  services: ServiceLine[];
  dayCount: number;
  dayLabel: (dayIndex: number) => string;
  displacementFee: number;
  discountTotal: number;
}

const copy = eventUiCopy.detail.statement;

function getServiceLabel(description: string, quantity: number): string {
  const serviceType = inferBudgetServiceType(description);
  if (!serviceType) return description || eventUiCopy.detail.assignment.service;

  const gender = inferServiceGenderFromDescription(
    description,
    serviceType as BudgetServiceType,
  );
  return getBudgetServiceDisplayLabel(serviceType, quantity, gender);
}

function ServiceRow({ service }: { service: ServiceLine }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2 text-sm">
      <div className="min-w-0">
        <p className="truncate font-medium text-[#2c1810]">
          {getServiceLabel(service.serviceDescription ?? "", service.quantity)}
        </p>
        <p className="text-xs text-[#9a7563]">
          {service.quantity} × {formatCurrencyBRL(service.unitPrice)}
        </p>
      </div>
      <p className="shrink-0 font-semibold tabular-nums text-[#2c1810]">
        {formatCurrencyBRL(service.totalPrice)}
      </p>
    </div>
  );
}

export default function EventServicesStatement({
  services,
  dayCount,
  dayLabel,
  displacementFee,
  discountTotal,
}: EventServicesStatementProps) {
  if (services.length === 0) {
    return <p className="text-sm text-[#7a4430]">{copy.empty}</p>;
  }

  const groups =
    dayCount > 1
      ? Array.from({ length: dayCount }, (_, dayIndex) => ({
          title: dayLabel(dayIndex),
          items: services.filter(
            (service) => (service.eventDateIndex ?? 0) === dayIndex,
          ),
        })).filter((group) => group.items.length > 0)
      : [{ title: "", items: services }];

  return (
    <div>
      <div className="divide-y divide-[#f1e6de]">
        {groups.map((group, index) => (
          <div key={group.title || index} className="py-1">
            {group.title ? (
              <p className="pt-2 text-[11px] font-semibold uppercase tracking-wider text-[#a16207]">
                {group.title}
              </p>
            ) : null}
            <div className="divide-y divide-dashed divide-[#f1e6de]">
              {group.items.map((service) => (
                <ServiceRow key={service.idBudgetItems} service={service} />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-2 space-y-1.5 rounded-xl bg-[#faf6f2] px-4 py-3 text-sm">
        <div className="flex items-center justify-between text-[#7a4430]">
          <span>{copy.displacement}</span>
          <span className="tabular-nums">
            {formatCurrencyBRL(displacementFee)}
          </span>
        </div>
        {discountTotal > 0 ? (
          <div className="flex items-center justify-between text-red-700">
            <span>{copy.discount}</span>
            <span className="tabular-nums">
              - {formatCurrencyBRL(discountTotal)}
            </span>
          </div>
        ) : null}
      </div>
    </div>
  );
}

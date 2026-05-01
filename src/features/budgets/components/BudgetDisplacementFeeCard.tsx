import Input from "@/components/atoms/Input";
import { budgetUiCopy } from "../model/messages";

interface BudgetDisplacementFeeCardProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
}

export default function BudgetDisplacementFeeCard({
  value,
  onChange,
  error,
  disabled = false,
}: BudgetDisplacementFeeCardProps) {
  return (
    <div className="mb-6 rounded-2xl border border-[#e8d5c9] bg-[#faf6f2] p-4">
      <div className="mb-4">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-[#7a4430]">
          {budgetUiCopy.form.labels.displacementFee}
        </h3>
        <p className="mt-1 text-sm text-[#7a4430]">
          Informe o valor da taxa de deslocamento da equipe ao local do evento.
          Insira 0,00 caso não haja cobrança de deslocamento.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Input
          label={`${budgetUiCopy.form.labels.displacementFee} *`}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="R$ 0,00"
          inputMode="decimal"
          required
          disabled={disabled}
          error={error}
          wrapperClassName="md:col-span-1"
        />
      </div>
    </div>
  );
}

import { RotateCcw, Save } from "lucide-react";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Select from "@/components/atoms/Select";
import SectionCard from "@/components/organisms/SectionCard";
import { useAuthSession } from "@/features/auth";
import {
  COMPANY_PROFILE_FIELD_GROUPS,
  PIX_KEY_TYPE_LABELS,
  useCompanyProfile,
} from "@/features/company-profile";
import { PIX_KEY_TYPE_OPTIONS } from "@/api/company-profile/schema";

export default function Profile() {
  const { session } = useAuthSession();
  const { form, loading, saving, error, setField, reset, save } =
    useCompanyProfile();

  const canManage =
    session?.user.group === "ADMIN" || session?.user.group === "ADMIN_MASTER";

  return (
    <div className="space-y-6">
      <SectionCard
        title="Dados da empresa"
        description="Usados como padrão em contratos e propostas. A identificação deve refletir exatamente o cadastro do CNPJ na Receita Federal."
        action={
          canManage ? (
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                leftIcon={<RotateCcw size={14} />}
                onClick={reset}
                disabled={loading || saving}
              >
                Desfazer
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                leftIcon={<Save size={14} />}
                onClick={() => {
                  void save();
                }}
                disabled={loading || saving}
              >
                {saving ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          ) : null
        }
      >
        {error ? (
          <div className="mb-4 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        {!canManage ? (
          <div className="mb-4 rounded-xl border border-[#e8d5c9] bg-[#faf6f2] px-4 py-3 text-sm text-[#7a4430]">
            Somente administradores podem editar os dados da empresa.
          </div>
        ) : null}

        {loading ? (
          <p className="text-sm text-[#7a4430]">Carregando...</p>
        ) : (
          <div className="space-y-8">
            {COMPANY_PROFILE_FIELD_GROUPS.map((group) => (
              <fieldset
                key={group.id}
                disabled={!canManage || saving}
                className="border-0 p-0 m-0"
              >
                <legend className="text-sm font-semibold text-[#2C1810]">
                  {group.title}
                </legend>
                {group.description ? (
                  <p className="mt-1 text-xs text-[#7a4430]">
                    {group.description}
                  </p>
                ) : null}
                <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {group.fields.map((field) => {
                    const value = form[field.key];

                    if (field.type === "pixKeyType") {
                      return (
                        <Select
                          key={field.key}
                          label={field.label}
                          value={value}
                          onChange={(event) =>
                            setField(field.key, event.target.value)
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
                          setField(field.key, event.target.value)
                        }
                      />
                    );
                  })}
                </div>
              </fieldset>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}

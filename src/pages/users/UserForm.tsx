import { useParams, useNavigate } from "react-router-dom";
import UserFormTemplate from "@/components/templates/users/UserFormTemplate";
import {
  getUserFormFields,
  userUiCopy,
  type UserFormValues,
  useUserForm,
} from "@/features/users";
import { useUsersContext } from "@/features/users/context/useUsersContext";
import { useToast } from "@/shared/toast/useToast";
import { userRoutePaths } from "@/router";

export default function UserForm({ mode }: { mode: "create" | "edit" }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { users, save, saving, unlock } = useUsersContext();
  const { showError } = useToast();
  const { form, editing, errors, setForm, submit } = useUserForm({
    mode,
    id,
    users,
  });

  async function handleSave(values: UserFormValues) {
    const result = submit(values);

    if (!result.success || !result.payload) {
      showError(
        userUiCopy.errors.invalidFormData,
        (result.errors || [userUiCopy.errors.invalidFormData]).join("\n"),
      );
      return;
    }

    await save(result.payload, editing);
    navigate(userRoutePaths.list);
  }

  async function handleUnlock() {
    if (!editing?.idUsers) return;
    await unlock(editing.idUsers);
  }

  const isLocked =
    editing?.lockedUntil != null && new Date(editing.lockedUntil) > new Date();

  return (
    <div className="space-y-4">
      <UserFormTemplate<UserFormValues>
        title={
          mode === "edit"
            ? userUiCopy.form.editTitle
            : userUiCopy.form.createTitle
        }
        values={form}
        setValues={setForm}
        fields={getUserFormFields(form, { isEditing: mode === "edit" })}
        onSubmit={handleSave}
        errors={errors}
        saving={saving}
        onCancel={() => navigate(userRoutePaths.list)}
      />
      {mode === "edit" && (
        <div className="rounded-xl border border-[#e8d5c9] bg-white px-4 py-3 text-sm text-[#7a4430] shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-0.5">
              <span>{userUiCopy.form.labels.unlockUser}</span>
              {editing?.lockedUntil && (
                <span className="text-xs text-[#9a7060]">
                  {isLocked
                    ? `Bloqueado até ${new Date(editing.lockedUntil).toLocaleString("pt-BR")}`
                    : "Não está bloqueado"}
                </span>
              )}
            </div>
            <button
              type="button"
              disabled={saving || !isLocked}
              onClick={handleUnlock}
              className="rounded border border-[#d7b9a8] px-3 py-1.5 font-medium text-[#9a7060] transition-opacity hover:opacity-80 disabled:opacity-40"
            >
              {saving ? "Aguarde..." : "Desbloquear"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

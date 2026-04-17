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
  const { users, save, saving } = useUsersContext();
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
            <span>{userUiCopy.form.labels.resetPassword}</span>
            <button
              type="button"
              disabled
              className="rounded border border-[#d7b9a8] px-3 py-1.5 font-medium text-[#9a7060] opacity-60"
            >
              Em breve
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
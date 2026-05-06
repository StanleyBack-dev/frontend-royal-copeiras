import { useEffect, useMemo, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import UserFormTemplate from "@/components/templates/users/UserFormTemplate";
import {
  fetchUserPagePermissions,
  getDefaultPagePermissionsByGroup,
  getUserFormFields,
  pagePermissionOptions,
  userUiCopy,
  type UserFormValues,
  useUserForm,
} from "@/features/users";
import type { PageAccessKey } from "@/api/users/schema";
import { useAuthSession } from "@/features/auth";
import { useUsersContext } from "@/features/users/context/useUsersContext";
import { useToast } from "@/shared/toast/useToast";
import { userRoutePaths } from "@/router";
import { getHttpErrorMessage } from "@/api/shared/http-error";
import { formatDateTimeDisplay } from "@/utils/format";

export default function UserForm({ mode }: { mode: "create" | "edit" }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { users, save, saving, unlock } = useUsersContext();
  const { showError } = useToast();
  const { session, setSession } = useAuthSession();
  const { form, editing, errors, setForm, submit } = useUserForm({
    mode,
    id,
    users,
  });

  const isAdminMaster = session?.user.group === "ADMIN_MASTER";

  const currentUserId = session?.user.idUsers;
  const loadedPermissionsForUserRef = useRef<string | null>(null);

  const effectivePermissions = useMemo(
    () => new Set(form.pagePermissions),
    [form.pagePermissions],
  );

  useEffect(() => {
    if (!isAdminMaster || mode !== "create") {
      return;
    }

    if (!form.useGroupDefaults || form.pagePermissions.length > 0) {
      return;
    }

    setForm({
      ...form,
      pagePermissions: getDefaultPagePermissionsByGroup(form.group),
      useGroupDefaults: true,
    });
  }, [form, isAdminMaster, mode, setForm]);

  useEffect(() => {
    if (!isAdminMaster || mode !== "edit") {
      return;
    }

    if (!editing?.idUsers || !currentUserId) {
      return;
    }

    if (loadedPermissionsForUserRef.current === editing.idUsers) {
      return;
    }

    loadedPermissionsForUserRef.current = editing.idUsers;

    void fetchUserPagePermissions(currentUserId)
      .then((permissions) => {
        setForm({
          ...form,
          pagePermissions: permissions.effectivePermissions,
          useGroupDefaults: !!permissions.useGroupDefaults,
        });
      })
      .catch((error) => {
        loadedPermissionsForUserRef.current = null;
        const message = getHttpErrorMessage(
          error,
          userUiCopy.errors.loadPermissionsFallback,
        );
        showError(userUiCopy.errors.loadPermissionsFallback, message);
      });
  }, [
    currentUserId,
    editing?.idUsers,
    form,
    isAdminMaster,
    mode,
    setForm,
    showError,
  ]);

  function handleGroupDefaultsToggle(enabled: boolean) {
    setForm({
      ...form,
      useGroupDefaults: enabled,
      pagePermissions: enabled
        ? getDefaultPagePermissionsByGroup(form.group)
        : form.pagePermissions,
    });
  }

  function handlePermissionToggle(permission: PageAccessKey) {
    const hasPermission = effectivePermissions.has(permission);

    if (hasPermission) {
      setForm({
        ...form,
        pagePermissions: form.pagePermissions.filter(
          (item) => item !== permission,
        ),
        useGroupDefaults: false,
      });
      return;
    }

    setForm({
      ...form,
      pagePermissions: [...form.pagePermissions, permission],
      useGroupDefaults: false,
    });
  }

  function handleGroupChange(nextGroup: UserFormValues["group"]) {
    setForm({
      ...form,
      group: nextGroup,
      pagePermissions: form.useGroupDefaults
        ? getDefaultPagePermissionsByGroup(nextGroup)
        : form.pagePermissions,
    });
  }

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

    if (editing?.idUsers && session?.user.idUsers === editing.idUsers) {
      try {
        setSession(session);
      } catch {
        // best-effort: ignore errors refreshing session
      }
    }

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
        setValues={(next) => {
          const nextValues = next as UserFormValues;

          if (nextValues.group !== form.group) {
            handleGroupChange(nextValues.group);
            return;
          }

          setForm(nextValues);
        }}
        fields={getUserFormFields(form, { isEditing: mode === "edit" })}
        onSubmit={handleSave}
        errors={errors}
        saving={saving}
        onCancel={() => navigate(userRoutePaths.list)}
      />
      {isAdminMaster && (
        <div className="rounded-xl border border-[#e8d5c9] bg-white px-4 py-4 text-sm text-[#7a4430] shadow-sm">
          <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <span className="font-medium">
              {userUiCopy.form.labels.pagePermissions}
            </span>
            <label className="flex items-center gap-2 text-xs sm:text-sm">
              <input
                type="checkbox"
                checked={!!form.useGroupDefaults}
                onChange={(event) =>
                  handleGroupDefaultsToggle(event.currentTarget.checked)
                }
                disabled={saving}
              />
              {userUiCopy.form.labels.useGroupDefaults}
            </label>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
            {pagePermissionOptions.map((option) => (
              <label
                key={option.key}
                className="flex items-center gap-2 rounded border border-[#eadfd8] px-3 py-2"
              >
                <input
                  type="checkbox"
                  checked={effectivePermissions.has(option.key)}
                  onChange={() => handlePermissionToggle(option.key)}
                  disabled={saving || !!form.useGroupDefaults}
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
        </div>
      )}
      {mode === "edit" && (
        <div className="rounded-xl border border-[#e8d5c9] bg-white px-4 py-3 text-sm text-[#7a4430] shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-0.5">
              <span>{userUiCopy.form.labels.unlockUser}</span>
              {editing?.lockedUntil && (
                <span className="text-xs text-[#9a7060]">
                  {isLocked
                    ? `Bloqueado até ${formatDateTimeDisplay(editing.lockedUntil)}`
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

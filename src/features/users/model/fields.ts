import type { FormField } from "../../../components/organisms/GenericForm";
import {
  USER_EMAIL_MAX_LENGTH,
  USER_NAME_MAX_LENGTH,
  USER_URL_AVATAR_MAX_LENGTH,
  USER_USERNAME_MAX_LENGTH,
} from "./constants";
import type { UserFormValues } from "./form";
import { userUiCopy } from "./messages";

export function getUserFormFields(
  _values: UserFormValues,
  options?: { isEditing?: boolean },
): FormField[] {
  const isEditing = options?.isEditing === true;

  return [
    ...(isEditing
      ? [
          {
            name: "createdAt",
            label: userUiCopy.form.labels.createdAt,
            readOnly: true,
            disabled: true,
            colSpan: 2 as const,
          },
        ]
      : []),
    {
      name: "name",
      label: userUiCopy.form.labels.name,
      required: !isEditing,
      readOnly: isEditing,
      disabled: isEditing,
      placeholder: userUiCopy.form.placeholders.name,
      maxLength: USER_NAME_MAX_LENGTH,
      colSpan: 2,
    },
    {
      name: "email",
      label: userUiCopy.form.labels.email,
      type: "email",
      required: !isEditing,
      readOnly: isEditing,
      disabled: isEditing,
      placeholder: userUiCopy.form.placeholders.email,
      maxLength: USER_EMAIL_MAX_LENGTH,
      inputMode: "email",
    },
    ...(isEditing
      ? [
          {
            name: "username",
            label: userUiCopy.form.labels.username,
            readOnly: true,
            disabled: true,
          },
          {
            name: "group",
            label: userUiCopy.form.labels.group,
            as: "select" as const,
            options: [
              {
                value: "USER",
                label: userUiCopy.form.options.groupUser,
              },
              {
                value: "ADMIN",
                label: userUiCopy.form.options.groupAdmin,
              },
              {
                value: "ADMIN_MASTER",
                label: userUiCopy.form.options.groupAdminMaster,
              },
            ],
          },
        ]
      : [
          {
            name: "username",
            label: userUiCopy.form.labels.username,
            required: true,
            placeholder: userUiCopy.form.placeholders.username,
            maxLength: USER_USERNAME_MAX_LENGTH,
          },
          {
            name: "group",
            label: userUiCopy.form.labels.group,
            as: "select" as const,
            options: [
              {
                value: "USER",
                label: userUiCopy.form.options.groupUser,
              },
              {
                value: "ADMIN",
                label: userUiCopy.form.options.groupAdmin,
              },
              {
                value: "ADMIN_MASTER",
                label: userUiCopy.form.options.groupAdminMaster,
              },
            ],
          },
        ]),
    ...(isEditing
      ? []
      : [
          {
            name: "urlAvatar",
            label: userUiCopy.form.labels.urlAvatar,
            type: "url",
            placeholder: userUiCopy.form.placeholders.urlAvatar,
            maxLength: USER_URL_AVATAR_MAX_LENGTH,
            inputMode: "url" as const,
            colSpan: 2 as const,
          },
        ]),
    ...(isEditing
      ? [
          {
            name: "status",
            label: userUiCopy.form.labels.status,
            type: "checkbox",
          },
        ]
      : []),
  ];
}

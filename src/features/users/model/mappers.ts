import type {
  CreateUserPayload,
  UpdateUserPayload,
  User,
} from "../../../api/users/schema";
import { formatDateTimeDisplay } from "../../../utils/format";
import type { UserFormValues } from "./form";

export function mapUserToFormValues(user: User): UserFormValues {
  return {
    name: user.name,
    email: user.email,
    username: user.username,
    group: user.group,
    urlAvatar: user.urlAvatar || "",
    status: user.status,
    createdAt: formatDateTimeDisplay(user.createdAt),
  };
}

export function mapUserFormToCreateValidationInput(values: UserFormValues) {
  return {
    name: values.name,
    email: values.email,
    username: values.username,
    group: values.group,
    urlAvatar: values.urlAvatar,
    status: values.status,
  };
}

export function mapUserFormToUpdateValidationInput(values: UserFormValues) {
  return {
    group: values.group,
    status: values.status,
  };
}

export function mapUserFormToCreatePayload(
  values: UserFormValues,
): CreateUserPayload {
  return {
    name: values.name,
    email: values.email,
    username: values.username,
    group: values.group,
    urlAvatar: values.urlAvatar || undefined,
  };
}

export function mapUserFormToUpdatePayload(
  values: UserFormValues,
  idUsers?: string,
): UpdateUserPayload {
  return {
    idUsers: idUsers || "",
    group: values.group,
    status: values.status,
  };
}
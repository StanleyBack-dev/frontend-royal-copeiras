import { createUser } from "../../../api/users/methods/create";
import { getUsers } from "../../../api/users/methods/get";
import { getUserPagePermissions } from "../../../api/users/methods/get-page-permissions";
import { updateUser } from "../../../api/users/methods/update";
import { unlockUser } from "../../../api/users/methods/unlock";
import type {
  ListQueryParams,
  PaginationMeta,
} from "../../../api/shared/contracts";
import {
  CreateUserPayloadSchema,
  CreateUserResponseSchema,
  UnlockUserResponseSchema,
  UpdateUserPayloadSchema,
  UpdateUserResponseSchema,
  UserPagePermissionsResponseSchema,
  UserSchema,
  type CreateUserPayload,
  type UserPagePermissionsResponse,
  type UpdateUserPayload,
  type User,
} from "../../../api/users/schema";
import { userUiCopy } from "../model/messages";

interface SaveUserParams {
  formData: CreateUserPayload | UpdateUserPayload;
  editing?: User | null;
}

export interface UsersCollectionResult {
  items: User[];
  pagination: PaginationMeta;
}

export async function fetchUsers(
  params: ListQueryParams = {},
): Promise<UsersCollectionResult> {
  const response = await getUsers(params);
  const parsed = UserSchema.array().safeParse(response.items);

  if (!parsed.success) {
    throw new Error(userUiCopy.errors.invalidCollectionData);
  }

  return {
    items: parsed.data,
    pagination: {
      total: response.total,
      currentPage: response.currentPage,
      limit: response.limit,
      totalPages: response.totalPages,
      hasNextPage: response.hasNextPage,
    },
  };
}

export async function saveUser({ formData, editing }: SaveUserParams) {
  if (editing) {
    const parsedPayload = UpdateUserPayloadSchema.safeParse(formData);

    if (!parsedPayload.success) {
      throw new Error(userUiCopy.errors.invalidUserData);
    }

    const response = await updateUser(editing.idUsers, {
      group: parsedPayload.data.group,
      status: parsedPayload.data.status,
      pagePermissions: parsedPayload.data.pagePermissions,
      useGroupDefaults: parsedPayload.data.useGroupDefaults,
    });

    const parsedResponse = UpdateUserResponseSchema.safeParse(response);

    if (!parsedResponse.success) {
      throw new Error(userUiCopy.errors.invalidUpdateUserResponse);
    }

    return parsedResponse.data;
  }

  const parsedPayload = CreateUserPayloadSchema.safeParse(formData);

  if (!parsedPayload.success) {
    throw new Error(userUiCopy.errors.invalidUserData);
  }

  const response = await createUser(parsedPayload.data);
  const parsedResponse = CreateUserResponseSchema.safeParse(response);

  if (!parsedResponse.success) {
    throw new Error(userUiCopy.errors.invalidCreateUserResponse);
  }

  return parsedResponse.data;
}

export async function fetchUserPagePermissions(
  idUsers: string,
): Promise<UserPagePermissionsResponse> {
  const response = await getUserPagePermissions(idUsers);
  const parsed = UserPagePermissionsResponseSchema.safeParse(response);

  if (!parsed.success) {
    throw new Error(userUiCopy.errors.invalidPermissionsData);
  }

  return {
    ...parsed.data,
    useGroupDefaults: !!parsed.data.useGroupDefaults,
  };
}

export async function unlockUserCredential(idUsers: string): Promise<void> {
  const response = await unlockUser(idUsers);
  const parsed = UnlockUserResponseSchema.safeParse(response);

  if (!parsed.success) {
    throw new Error(userUiCopy.errors.invalidUpdateUserResponse);
  }
}

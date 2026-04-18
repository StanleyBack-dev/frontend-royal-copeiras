import { z } from "zod";
import {
  USER_EMAIL_MAX_LENGTH,
  USER_EMAIL_MIN_LENGTH,
  USER_NAME_MAX_LENGTH,
  USER_NAME_MIN_LENGTH,
  USER_URL_AVATAR_MAX_LENGTH,
  USER_USERNAME_MAX_LENGTH,
  USER_USERNAME_MIN_LENGTH,
} from "../../features/users/model/constants";
import { userValidationMessages } from "../../features/users/model/messages";

export const UserGroupSchema = z.enum(["USER", "ADMIN", "ADMIN_MASTER"]);
export const PageAccessKeySchema = z.enum([
  "DASHBOARD",
  "CLIENTS",
  "EMPLOYEES",
  "USERS",
  "EVENTS",
  "FINANCES",
  "DEBTS",
  "INVESTMENTS",
]);

export const UserSchema = z.object({
  idUsers: z.string(),
  name: z.string().trim().min(USER_NAME_MIN_LENGTH).max(USER_NAME_MAX_LENGTH),
  email: z
    .string()
    .trim()
    .min(USER_EMAIL_MIN_LENGTH)
    .max(USER_EMAIL_MAX_LENGTH)
    .email(),
  username: z
    .string()
    .trim()
    .min(USER_USERNAME_MIN_LENGTH)
    .max(USER_USERNAME_MAX_LENGTH),
  urlAvatar: z.string().trim().optional().nullable().or(z.literal("")),
  status: z.boolean(),
  group: UserGroupSchema,
  inactivatedAt: z.string().nullable().optional(),
  mustChangePassword: z.boolean().optional(),
  lastLoginAt: z.string().nullable().optional(),
  failedLoginAttempts: z.number().int().optional(),
  lockedUntil: z.string().nullable().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const CreateUserPayloadSchema = z.object({
  name: z
    .string()
    .trim()
    .min(USER_NAME_MIN_LENGTH, userValidationMessages.nameRequired)
    .max(USER_NAME_MAX_LENGTH, userValidationMessages.nameMax),
  email: z
    .string()
    .trim()
    .min(USER_EMAIL_MIN_LENGTH, userValidationMessages.emailMin)
    .max(USER_EMAIL_MAX_LENGTH, userValidationMessages.emailMax)
    .email(userValidationMessages.emailInvalid),
  username: z
    .string()
    .trim()
    .min(USER_USERNAME_MIN_LENGTH, userValidationMessages.usernameMin)
    .max(USER_USERNAME_MAX_LENGTH, userValidationMessages.usernameMax)
    .regex(/^[a-zA-Z0-9._-]+$/, userValidationMessages.usernamePattern),
  group: UserGroupSchema,
  urlAvatar: z
    .string()
    .trim()
    .max(USER_URL_AVATAR_MAX_LENGTH, userValidationMessages.urlAvatarMax)
    .url(userValidationMessages.urlAvatarInvalid)
    .optional()
    .or(z.literal("")),
  pagePermissions: z.array(PageAccessKeySchema).optional(),
});

export const UpdateUserPayloadSchema = z.object({
  idUsers: z.string(),
  group: UserGroupSchema.optional(),
  status: z.boolean().optional(),
  pagePermissions: z.array(PageAccessKeySchema).optional(),
  useGroupDefaults: z.boolean().optional(),
});

export const CreateUserResponseSchema = z.object({
  idUsers: z.string(),
  name: z.string(),
  email: z.string(),
  username: z.string(),
  group: UserGroupSchema,
  mustChangePassword: z.boolean(),
  urlAvatar: z.string().trim().optional().nullable().or(z.literal("")),
  status: z.boolean(),
  createdAt: z.string(),
});

export const UpdateUserResponseSchema = z.object({
  idUsers: z.string(),
  group: UserGroupSchema,
  status: z.boolean(),
  inactivatedAt: z.string().nullable().optional(),
  updatedAt: z.string(),
});

export const UnlockUserResponseSchema = z.object({
  idUsers: z.string(),
  updatedAt: z.string(),
});

export const UserPagePermissionsResponseSchema = z.object({
  idUsers: z.string(),
  group: UserGroupSchema,
  effectivePermissions: z.array(PageAccessKeySchema),
  defaultPermissions: z.array(PageAccessKeySchema),
  useGroupDefaults: z.boolean(),
  updatedAt: z.string().nullable().optional(),
});

export type UserGroup = z.infer<typeof UserGroupSchema>;
export type PageAccessKey = z.infer<typeof PageAccessKeySchema>;
export type User = z.infer<typeof UserSchema>;
export type CreateUserPayload = z.infer<typeof CreateUserPayloadSchema>;
export type UpdateUserPayload = z.infer<typeof UpdateUserPayloadSchema>;
export type CreateUserResponse = z.infer<typeof CreateUserResponseSchema>;
export type UpdateUserResponse = z.infer<typeof UpdateUserResponseSchema>;
export type UnlockUserResponse = z.infer<typeof UnlockUserResponseSchema>;
export type UserPagePermissionsResponse = z.infer<
  typeof UserPagePermissionsResponseSchema
>;

import { z } from "zod";
import {
  LOGIN_IDENTIFIER_MAX_LENGTH,
  LOGIN_IDENTIFIER_MIN_LENGTH,
  LOGIN_PASSWORD_MIN_LENGTH,
  LOGIN_PASSWORD_MAX_LENGTH,
  PASSWORD_RECOVERY_CODE_LENGTH,
} from "../../features/auth/model/constants";

export const LoginPayloadSchema = z.object({
  username: z
    .string()
    .trim()
    .min(LOGIN_IDENTIFIER_MIN_LENGTH)
    .max(LOGIN_IDENTIFIER_MAX_LENGTH),
  password: z
    .string()
    .min(LOGIN_PASSWORD_MIN_LENGTH)
    .max(LOGIN_PASSWORD_MAX_LENGTH),
});

export const ChangePasswordPayloadSchema = z.object({
  currentPassword: z
    .string()
    .min(LOGIN_PASSWORD_MIN_LENGTH)
    .max(LOGIN_PASSWORD_MAX_LENGTH),
  newPassword: z
    .string()
    .min(LOGIN_PASSWORD_MIN_LENGTH)
    .max(LOGIN_PASSWORD_MAX_LENGTH),
});

export const RequestPasswordRecoveryPayloadSchema = z.object({
  email: z.string().trim().email(),
});

export const VerifyPasswordRecoveryCodePayloadSchema = z.object({
  email: z.string().trim().email(),
  code: z
    .string()
    .trim()
    .length(PASSWORD_RECOVERY_CODE_LENGTH)
    .regex(/^\d{5}$/),
});

export const ResetPasswordWithRecoveryPayloadSchema = z.object({
  recoveryToken: z.string().trim().min(1),
  newPassword: z
    .string()
    .min(LOGIN_PASSWORD_MIN_LENGTH)
    .max(LOGIN_PASSWORD_MAX_LENGTH),
});

export const AuthUserSchema = z.object({
  idUsers: z.string(),
  name: z.string(),
  email: z.string(),
  username: z.string(),
  group: z.enum(["USER", "ADMIN", "ADMIN_MASTER"]),
  status: z.boolean(),
  urlAvatar: z.string().nullable().optional(),
});

export const AuthSessionResponseSchema = z.object({
  authenticated: z.boolean(),
  mustChangePassword: z.boolean(),
  user: AuthUserSchema,
});

export const MutationBaseResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional().nullable(),
  code: z.string().optional().nullable(),
});

export const VerifyPasswordRecoveryCodeResponseSchema =
  MutationBaseResponseSchema.extend({
    data: z.object({
      recoveryToken: z.string(),
      expiresAt: z.string(),
    }),
  });

export type LoginPayload = z.infer<typeof LoginPayloadSchema>;
export type AuthSessionResponse = z.infer<typeof AuthSessionResponseSchema>;
export type ChangePasswordPayload = z.infer<typeof ChangePasswordPayloadSchema>;
export type RequestPasswordRecoveryPayload = z.infer<
  typeof RequestPasswordRecoveryPayloadSchema
>;
export type VerifyPasswordRecoveryCodePayload = z.infer<
  typeof VerifyPasswordRecoveryCodePayloadSchema
>;
export type ResetPasswordWithRecoveryPayload = z.infer<
  typeof ResetPasswordWithRecoveryPayloadSchema
>;
export type VerifyPasswordRecoveryCodeResponse = z.infer<
  typeof VerifyPasswordRecoveryCodeResponseSchema
>;

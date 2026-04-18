import axios from "axios";
import { config } from "../../../config/env.js";
import { HttpError } from "../../../shared/http/http-error.js";

const authGraphqlHttp = axios.create({
  baseURL: config.backendGraphqlUrl,
  timeout: config.graphqlRequestTimeoutMs,
  headers: {
    "Content-Type": "application/json",
  },
});

function extractGraphqlErrorMessage(payload, fallbackMessage) {
  const firstGraphqlError = Array.isArray(payload?.errors)
    ? payload.errors[0]
    : undefined;

  return firstGraphqlError?.message || payload?.message || fallbackMessage;
}

function extractGraphqlErrorMetadata(payload) {
  const firstGraphqlError = Array.isArray(payload?.errors)
    ? payload.errors[0]
    : undefined;
  const extensions = firstGraphqlError?.extensions;

  return {
    code: typeof extensions?.code === "string" ? extensions.code : undefined,
    details: extensions?.details ?? null,
    statusCode:
      typeof extensions?.statusCode === "number"
        ? extensions.statusCode
        : undefined,
  };
}

export class AuthService {
  async login(input, context = {}) {
    const mutation = `
      mutation Login($input: LoginInputDto!) {
        login(input: $input) {
          authenticated
          mustChangePassword
          user {
            idUsers
            name
            email
            username
            group
            status
            urlAvatar
          }
        }
      }
    `;

    return this.executeMutation({
      query: mutation,
      variables: { input },
      dataPath: "login",
      invalidResponseMessage: "Resposta de autenticacao invalida.",
      cookieHeader: context.cookieHeader,
    });
  }

  async refreshSession(context = {}) {
    const mutation = `
      mutation RefreshAuthSession {
        refreshAuthSession {
          authenticated
          mustChangePassword
          user {
            idUsers
            name
            email
            username
            group
            status
            urlAvatar
          }
        }
      }
    `;

    return this.executeMutation({
      query: mutation,
      variables: {},
      dataPath: "refreshAuthSession",
      invalidResponseMessage: "Resposta de refresh de sessao invalida.",
      cookieHeader: context.cookieHeader,
    });
  }

  async logout(context = {}) {
    const mutation = `
      mutation Logout {
        logout {
          success
          message
          code
        }
      }
    `;

    return this.executeMutation({
      query: mutation,
      variables: {},
      dataPath: "logout",
      invalidResponseMessage: "Resposta de logout invalida.",
      cookieHeader: context.cookieHeader,
    });
  }

  async changeMyPassword(input, context = {}) {
    const mutation = `
      mutation ChangeMyPassword($input: ChangePasswordInputDto!) {
        changeMyPassword(input: $input) {
          success
          message
          code
        }
      }
    `;

    return this.executeMutation({
      query: mutation,
      variables: { input },
      dataPath: "changeMyPassword",
      invalidResponseMessage: "Resposta de alteracao de senha invalida.",
      cookieHeader: context.cookieHeader,
    });
  }

  async requestPasswordRecovery(input) {
    const mutation = `
      mutation RequestPasswordRecovery($input: RequestPasswordRecoveryInputDto!) {
        requestPasswordRecovery(input: $input) {
          success
          message
          code
        }
      }
    `;

    return this.executeMutation({
      query: mutation,
      variables: { input },
      dataPath: "requestPasswordRecovery",
      invalidResponseMessage:
        "Resposta de solicitacao de recuperacao invalida.",
    });
  }

  async verifyPasswordRecoveryCode(input) {
    const mutation = `
      mutation VerifyPasswordRecoveryCode($input: VerifyPasswordRecoveryCodeInputDto!) {
        verifyPasswordRecoveryCode(input: $input) {
          success
          message
          code
          data {
            recoveryToken
            expiresAt
          }
        }
      }
    `;

    return this.executeMutation({
      query: mutation,
      variables: { input },
      dataPath: "verifyPasswordRecoveryCode",
      invalidResponseMessage: "Resposta de validacao do codigo invalida.",
    });
  }

  async resetPasswordWithRecovery(input) {
    const mutation = `
      mutation ResetPasswordWithRecovery($input: ResetPasswordWithRecoveryInputDto!) {
        resetPasswordWithRecovery(input: $input) {
          success
          message
          code
        }
      }
    `;

    return this.executeMutation({
      query: mutation,
      variables: { input },
      dataPath: "resetPasswordWithRecovery",
      invalidResponseMessage: "Resposta de redefinicao de senha invalida.",
    });
  }

  async executeMutation({
    query,
    variables,
    dataPath,
    invalidResponseMessage,
    cookieHeader,
  }) {
    try {
      const response = await authGraphqlHttp.post(
        "",
        { query, variables },
        {
          headers: cookieHeader
            ? {
                Cookie: cookieHeader,
              }
            : undefined,
        },
      );

      const payload = response.data;
      if (payload?.errors?.length) {
        const metadata = extractGraphqlErrorMetadata(payload);
        throw new HttpError(
          metadata.statusCode ?? 401,
          extractGraphqlErrorMessage(payload, "Falha na autenticacao."),
          {
            code: metadata.code,
            details: metadata.details,
          },
        );
      }

      const data = payload?.data?.[dataPath];
      if (!data) {
        throw new HttpError(502, invalidResponseMessage);
      }

      return {
        data,
        setCookieHeaders: Array.isArray(response.headers?.["set-cookie"])
          ? response.headers["set-cookie"]
          : [],
      };
    } catch (error) {
      if (error instanceof HttpError) {
        throw error;
      }

      if (axios.isAxiosError(error)) {
        const statusCode = error.response?.status ?? 502;
        const message = extractGraphqlErrorMessage(
          error.response?.data,
          error.message || "Falha na comunicacao com auth.",
        );
        const metadata = extractGraphqlErrorMetadata(error.response?.data);

        throw new HttpError(metadata.statusCode ?? statusCode, message, {
          code: metadata.code,
          details: metadata.details,
        });
      }

      throw new HttpError(500, "Unexpected server error.");
    }
  }
}

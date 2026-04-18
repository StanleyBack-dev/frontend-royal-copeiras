import { ShieldAlert } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { routePaths, utilityRoutePaths } from "../router/navigation";
import {
  getDeniedReasonMessage,
  getDeniedViewLabel,
  type AccessDeniedRouteState,
} from "../features/auth/model/access-denied";

export default function AccessDenied() {
  const location = useLocation();
  const state = (location.state ?? {}) as AccessDeniedRouteState;
  const deniedViewLabel = getDeniedViewLabel(state.deniedView);
  const deniedReasonMessage = getDeniedReasonMessage(state.reasonCode);

  return (
    <div className="mx-auto w-full max-w-3xl py-10">
      <section className="rounded-2xl border border-[#e8d5c9] bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-4 inline-flex rounded-xl bg-[#fef3f2] p-3 text-[#b42318]">
          <ShieldAlert size={24} />
        </div>

        <h1 className="text-2xl font-semibold text-[#2C1810]">Acesso negado</h1>
        <p className="mt-3 text-sm leading-relaxed text-[#7a4430]">
          {state.reasonCode === "PAGE_PERMISSION"
            ? `Você não possui permissão para acessar ${deniedViewLabel}.`
            : "Seu acesso a esta área foi bloqueado."}
        </p>

        <p className="mt-2 text-sm leading-relaxed text-[#7a4430]">
          {deniedReasonMessage}
        </p>

        {state.deniedPathname ? (
          <p className="mt-3 rounded-lg bg-[#faf6f2] px-3 py-2 text-xs text-[#7a4430]">
            Caminho solicitado: {state.deniedPathname}
          </p>
        ) : null}

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            to={routePaths.dashboard}
            className="inline-flex items-center rounded-xl bg-[#C9A227] px-4 py-2 text-sm font-semibold text-[#2C1810] transition hover:brightness-95"
          >
            Ir para o painel
          </Link>

          <Link
            to={utilityRoutePaths.accessDenied}
            className="inline-flex items-center rounded-xl border border-[#d7c3b6] px-4 py-2 text-sm font-semibold text-[#7a4430] transition hover:bg-[#faf6f2]"
            replace
          >
            Atualizar
          </Link>
        </div>
      </section>
    </div>
  );
}

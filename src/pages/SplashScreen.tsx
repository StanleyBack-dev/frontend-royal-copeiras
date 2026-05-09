import Loading from "../components/atoms/Loading";
import CrownIcon from "../components/atoms/icons/CrownIcon";

export default function SplashScreen() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-[#2C1810]">
      <div className="flex flex-col items-center gap-10">
        <div className="flex flex-col items-center gap-6">
          <div className="flex h-32 w-32 items-center justify-center rounded-full bg-white">
            <CrownIcon size={64} className="text-[#C9A227]" />
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-wide text-white">
              Royal Copeiras
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Loading size={32} />
          <span className="text-base font-semibold text-white">
            Carregando informações...
          </span>
        </div>
      </div>
    </div>
  );
}

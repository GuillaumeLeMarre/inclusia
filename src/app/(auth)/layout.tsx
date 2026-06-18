import { Logo } from "@/components/brand/logo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-primary p-12 text-white">
        <Logo className="[&_span]:text-white [&_p]:text-indigo-200" />
        <div>
          <h2 className="text-3xl font-bold leading-tight">
            Adaptez vos cours à chaque élève en moins d&apos;une minute
          </h2>
          <p className="mt-4 text-indigo-200 text-lg">
            Inclusia transforme vos supports pédagogiques en contenus inclusifs
            personnalisés grâce à l&apos;intelligence artificielle.
          </p>
        </div>
        <p className="text-sm text-indigo-300">
          Dyslexie · TDAH · TSA · Allophones · et plus encore
        </p>
      </div>
      <div className="flex flex-1 flex-col items-center justify-center p-8 bg-background">
        <div className="mb-8 lg:hidden">
          <Logo showSlogan />
        </div>
        {children}
      </div>
    </div>
  );
}

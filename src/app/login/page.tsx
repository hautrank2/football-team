import { Suspense } from "react";
import { LoginForm } from "./_components/LoginForm";
import { LoginHero } from "./_components/LoginHero";
import { StarfieldBackground } from "@/components/ui/starfield";

// Stars behind, club pitch on the left, form on the right. The two halves are
// client components (they animate); this shell stays a server component.
const LoginPage = () => (
  <StarfieldBackground>
    {/* The starfield is `fixed inset-0 overflow-hidden`, so this layer has to be
        the scroll container (h-full + overflow-y-auto) — otherwise tall content
        on a phone simply gets clipped with no way to reach it. */}
    <div className="relative flex h-full flex-col items-center justify-center gap-12 overflow-y-auto p-4 lg:flex-row lg:justify-between lg:gap-8 lg:p-16">
      <LoginHero />

      <div className="flex w-full max-w-sm shrink-0 flex-col gap-4">
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  </StarfieldBackground>
);

export default LoginPage;

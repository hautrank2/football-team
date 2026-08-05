import { Suspense } from "react";
import { LoginForm } from "./_components/LoginForm";

const LoginPage = () => (
  <div className="relative flex min-h-screen items-center justify-center p-4 lg:justify-end lg:p-16">
    {/* Background image + legibility overlay (gradient favours the right on desktop) */}
    <div className="absolute inset-0 -z-10">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/login_background.png"
        alt=""
        className="size-full object-cover object-center"
      />
      <div className="absolute inset-0 bg-background/20 lg:bg-gradient-to-l lg:from-background lg:via-background/20 lg:to-transparent" />
    </div>

    <div className="flex w-full max-w-sm flex-col gap-4">
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </div>
  </div>
);

export default LoginPage;

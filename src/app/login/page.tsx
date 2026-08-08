import Image from "next/image";
import { Suspense } from "react";
import { LoginForm } from "./_components/LoginForm";
import { StarfieldBackground } from "@/components/ui/starfield";

const LoginPage = () => (
  <StarfieldBackground>
    <div className="relative flex min-h-screen flex-col items-center justify-center gap-10 p-4 lg:flex-row lg:justify-between lg:p-16">
      {/* Background image + legibility overlay (gradient favours the right on desktop) */}

      {/* Left: branding — who we are + a love of football. */}
      <div className="w-full max-w-lg text-center text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.75)] lg:max-w-none lg:flex-1 lg:pr-8 lg:text-left">
        <div className="mb-4 flex items-center justify-center gap-3 lg:justify-start">
          <Image
            src="/images/logo.png"
            alt="Logo"
            width={80}
            height={80}
            className="size-12 rounded lg:size-20"
          />
          <span className="text-xl text-primary font-bold uppercase tracking-[0.3em] sm:text-2xl lg:text-7xl">
            Footboys
          </span>
        </div>
        <h1 className="text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
          Anh em một đội,
          <br />
          bóng đá một tình yêu
        </h1>
        <p className="mt-4 text-lg text-white/90 sm:text-xl lg:text-2xl">
          Chúng tôi là Footboys — nhóm anh em mê trái bóng tròn, hễ có kèo là
          hẹn nhau ra sân. Đăng nhập để chốt lịch, vote trận và cùng nhau chiến.
        </p>
      </div>

      {/* Right: login form. */}
      <div className="flex w-full max-w-sm flex-col gap-4">
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  </StarfieldBackground>
);

export default LoginPage;

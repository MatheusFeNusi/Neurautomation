"use client";

import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "secondary" | "ghost" | "gradient";
  size?: "default" | "sm" | "lg";
  children: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "default", size = "default", className = "", children, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";

    const variants = {
      default: "bg-white text-black hover:bg-gray-100",
      secondary: "bg-gray-800 text-white hover:bg-gray-700",
      ghost: "hover:bg-gray-800/50 text-white",
      gradient:
        "bg-gradient-to-b from-white via-white/95 to-white/60 text-black hover:scale-105 active:scale-95",
    };

    const sizes = {
      default: "h-10 px-4 py-2 text-sm",
      sm: "h-10 px-5 text-sm",
      lg: "h-12 px-8 text-base",
    };

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

const ArrowRight = ({ className = "", size = 16 }: { className?: string; size?: number }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </svg>
);

// Hero institucional — SEM Navigation própria (o header já existe no site)
export const Hero = React.memo(() => {
  return (
    <section
      id="hero"
      className="relative flex flex-col items-center justify-start px-6 pt-14 pb-4 md:pt-20 md:pb-6 text-center"
      style={{ animation: "fadeIn 0.6s ease-out" }}
    >
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <aside className="mb-6 inline-flex flex-wrap items-center justify-center gap-2 px-4 py-2 rounded-full border border-gray-700 bg-gray-800/50 backdrop-blur-sm max-w-full">
        <span className="text-xs text-center whitespace-nowrap" style={{ color: "#9ca3af" }}>
          Tecnologia, performance e crescimento digital
        </span>
      </aside>

      <h1
        className="text-4xl md:text-5xl lg:text-6xl font-medium text-center max-w-3xl px-6 leading-tight mb-5"
        style={{
          background: "linear-gradient(to bottom, #ffffff, #ffffff, rgba(255, 255, 255, 0.6))",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          letterSpacing: "-0.05em",
        }}
      >
        Automação, tráfego e produtos digitais
        <br />
        sob uma única operação.
      </h1>

      <p
        className="text-sm md:text-base text-center max-w-2xl px-6 mb-8"
        style={{ color: "#9ca3af" }}
      >
        A Neurautomation reúne automação com IA, performance em Google Ads, produção de
        infoprodutos
        <br />
        e marketing digital em quatro frentes que operam de forma integrada.
      </p>

      <div className="flex items-center gap-4 relative z-10 mb-2">
        <Button
          type="button"
          variant="gradient"
          size="lg"
          className="rounded-lg flex items-center justify-center"
          aria-label="Conheça as frentes da Neurautomation"
          onClick={() => document.getElementById("frentes")?.scrollIntoView({ behavior: "smooth" })}
        >
          Conheça nossas frentes
          <ArrowRight size={16} />
        </Button>
      </div>
    </section>
  );
});

Hero.displayName = "Hero";

export default Hero;

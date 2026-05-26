import type { ButtonHTMLAttributes, ReactNode } from "react";

export function Card({
  children,
  className = "",
  pad = true,
}: {
  children: ReactNode;
  className?: string;
  pad?: boolean;
}) {
  return (
    <div
      className={`bg-white border border-line rounded-xl ${pad ? "pad-card" : ""} ${className}`}
    >
      {children}
    </div>
  );
}

type BtnVariant = "primary" | "dark" | "outline" | "ghost" | "danger";
type BtnSize = "sm" | "md" | "lg";

export function Btn({
  variant = "ghost",
  size = "md",
  children,
  className = "",
  ...rest
}: {
  variant?: BtnVariant;
  size?: BtnSize;
  children: ReactNode;
  className?: string;
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  const base =
    "inline-flex items-center gap-2 font-medium rounded-lg transition active:scale-[.98] disabled:opacity-50 disabled:pointer-events-none";
  const sizes: Record<BtnSize, string> = {
    sm: "text-xs px-2.5 py-1.5",
    md: "text-sm px-3 py-2",
    lg: "text-sm px-4 py-2.5",
  };
  const variants: Record<BtnVariant, string> = {
    primary: "bg-momento text-white hover:bg-[color:var(--momento-600)]",
    dark: "bg-ink text-white hover:opacity-90",
    outline: "border border-line text-ink hover:bg-[color:var(--bg)]",
    ghost: "text-ink hover:bg-[color:var(--bg)]",
    danger: "border border-red-200 text-red-600 hover:bg-red-50",
  };
  return (
    <button className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} {...rest}>
      {children}
    </button>
  );
}

type PillTone = "neutral" | "green" | "purple" | "red" | "amber" | "outline";

export function Pill({
  children,
  tone = "neutral",
  className = "",
}: {
  children: ReactNode;
  tone?: PillTone;
  className?: string;
}) {
  const tones: Record<PillTone, string> = {
    neutral: "bg-[color:var(--bg)] border-line text-ink",
    green: "bg-[color:var(--momento-50)] border-transparent text-[color:var(--momento-600)]",
    purple: "bg-purple-50 border-transparent text-purple-700",
    red: "bg-red-50 border-transparent text-red-700",
    amber: "bg-amber-50 border-transparent text-amber-700",
    outline: "bg-transparent border-line text-muted",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-medium border rounded-full ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

export function Topbar({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: ReactNode;
}) {
  return (
    <header className="sticky top-0 z-10 bg-[color:var(--bg)]/80 backdrop-blur border-b border-line">
      <div className="px-10 py-5 flex items-end justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold text-ink tracking-tight">{title}</h1>
          {subtitle && <p className="text-sm text-muted mt-0.5">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-2">{right}</div>
      </div>
    </header>
  );
}

export function TableDot({ name, color }: { name: string; color: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-ink">
      <span className="w-2 h-2 rounded-full" style={{ background: color }} /> {name}
    </span>
  );
}

export function formatTime(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, "0")}h${String(d.getMinutes()).padStart(2, "0")}`;
}

export function Placeholder({
  title,
  phase,
  icon,
}: {
  title: string;
  phase: string;
  icon: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-32 px-10">
      <div className="w-16 h-16 rounded-2xl bg-white border border-line flex items-center justify-center text-muted mb-5">
        {icon}
      </div>
      <h2 className="text-xl font-bold text-ink">{title}</h2>
      <p className="text-sm text-muted mt-2 max-w-md">
        Cette section fait partie du design et sera branchée au backend en {phase}.
      </p>
      <Pill tone="outline" className="mt-4">
        Bientôt
      </Pill>
    </div>
  );
}

import logo from "@/assets/logo.png";

export function Logo({ size = 36 }: { size?: number }) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative" style={{ width: size, height: size }}>
        <div
          className="absolute inset-0 rounded-xl blur-md opacity-60"
          style={{ background: "var(--gradient-cyber)" }}
        />
        <img
          src={logo}
          alt="VirusSKWITCH logo"
          width={size}
          height={size}
          className="relative rounded-xl object-contain"
        />
      </div>
      <div className="flex flex-col leading-none">
        <span className="font-display font-extrabold tracking-tight text-base">
          Virus<span className="text-gradient">SKWITCH</span>
        </span>
        <span className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground mt-1">
          URL Threat Scanner
        </span>
      </div>
    </div>
  );
}

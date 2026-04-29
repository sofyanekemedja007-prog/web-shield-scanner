import { useI18n } from "@/lib/i18n";
import { useTheme } from "@/lib/theme";
import { Logo } from "./Logo";
import { Moon, Sun, Globe } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const langs: { code: "en" | "ar" | "fr"; label: string; flag: string }[] = [
  { code: "en", label: "English", flag: "EN" },
  { code: "ar", label: "العربية", flag: "AR" },
  { code: "fr", label: "Français", flag: "FR" },
];

export function Header() {
  const { lang, setLang } = useI18n();
  const { theme, toggle } = useTheme();

  return (
    <header className="sticky top-0 z-40 w-full">
      <div className="glass border-b border-border/50">
        <div className="container mx-auto flex items-center justify-between px-4 py-3">
          <Logo />
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="glass flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-mono font-medium hover:border-primary/40 transition"
                  aria-label="Select language"
                >
                  <Globe className="h-3.5 w-3.5 text-primary" />
                  <span>{langs.find((l) => l.code === lang)?.flag}</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="glass-strong">
                {langs.map((l) => (
                  <DropdownMenuItem
                    key={l.code}
                    onClick={() => setLang(l.code)}
                    className={lang === l.code ? "text-primary" : ""}
                  >
                    <span className="font-mono text-xs me-2">{l.flag}</span>
                    {l.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <button
              onClick={toggle}
              aria-label="Toggle theme"
              className="glass flex h-9 w-9 items-center justify-center rounded-lg hover:border-primary/40 transition"
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4 text-primary" />
              ) : (
                <Moon className="h-4 w-4 text-primary" />
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

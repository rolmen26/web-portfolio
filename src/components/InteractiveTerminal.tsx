import * as React from "react";
import { X, TerminalSquare } from "lucide-react";
import { projects as defaultProjects } from "@/components/portfolio/data";
import type { ProjectItem } from "@/components/portfolio/types";
import { cn } from "@/lib/utils";

interface InteractiveTerminalProps {
  onClose?: () => void;
  className?: string;
  outputClassName?: string;
  inputClassName?: string;
  promptClassName?: string;
  shellLabel?: string;
  projects?: ProjectItem[];
  initialLines?: string[];
  hideHeader?: boolean;
}

const helpOutput = [
  "╔══════════════════════════════════════════════════════════════╗",
  "║                     AVAILABLE COMMANDS                       ║",
  "╚══════════════════════════════════════════════════════════════╝",
  "",
  "  > help       :: muestra los comandos disponibles",
  "  > about      :: resumen profesional",
  "  > skills     :: stack, herramientas y fortalezas",
  "  > projects   :: proyectos destacados",
  "  > contact    :: enlaces de contacto",
  "  > whoami     :: identidad actual",
  "  > date       :: fecha del sistema",
  "  > clear      :: limpiar consola",
];

const aboutOutput = [
  "╔══════════════════════════════════════════════════════════════╗",
  "║                         ABOUT ME                             ║",
  "╚══════════════════════════════════════════════════════════════╝",
  "",
  "Rommel Sebastian Soriano García",
  "Software Developer · Full-Stack Engineer · AI Builder",
  "",
  "Nacido en Guayaquil, Guayas - Ecuador.",
  "Graduado de la Universidad Politécnica Salesiana.",
  "",
  "Diseño y construyo productos digitales con enfoque en escalabilidad,",
  "arquitectura clara y resultados medibles. Tengo experiencia liderando",
  "soluciones modernas basadas en microservicios, desarrollo Full-Stack,",
  "arquitecturas orientadas a eventos e integración de IA para producción.",
  "",
  "Mi stack principal gira alrededor de Laravel, NestJS, y ecosistemas web",
  "modernos, combinando ingeniería de software, infraestructura y visión",
  "de producto para resolver problemas complejos de negocio.",
];

const skillsOutput = [
  "┌─ skills ─────────────────────────────────────────────────────┐",
  "│ Backend        ██████████  Laravel · NestJS · Express        │",
  "│ Frontend       █████████░  React · Next.js · Vue ·           │",
  "│ Architecture   █████████░  DDD · Microservices · EDA         │",
  "│ AI / Agents    ████████░░  Codex · Claude · Copilot          │",
  "│ Infra          ████████░░  Docker · Kubernetes · Dokploy     │",
  "│ Cloud          ███████░░░  Google · AWS · Azure              │",
  "└──────────────────────────────────────────────────────────────┘",
];

const contactOutput = [
  "┌─ contact ────────────────────────────────────────────────────┐",
  "│ mail     → rommelsoriano454@gmail.com                        │",
  "│ github   → https://github.com/rolmen26                       │",
  "│ linkedin → https://www.linkedin.com/in/rommel-sorianog       │",
  "└──────────────────────────────────────────────────────────────┘",
];

function getProjectsOutput(projects: ProjectItem[]) {
  const hasEasterEgg = projects.some((project) => project.isEasterEgg);

  return [
    "╔══════════════════════════════════════════════════════════════╗",
    "║                      FEATURED PROJECTS                       ║",
    "╚══════════════════════════════════════════════════════════════╝",
    "",
    "  [01] Fruit-Ripeness",
    "       Computer vision aplicado al análisis de madurez.",
    "",
    "  [02] StereoThermal",
    "       Procesamiento visual y análisis térmico/estéreo.",
    "",
    "  [03] VoiceChat-AzureOllamaAgent",
    "       Agentes conversacionales e integración de IA en producción.",
    ...(hasEasterEgg
      ? [
          "",
          "  [??] Escape from the Dark (Universitario)",
          "       Videojuego plataformer en Godot :D",
        ]
      : []),
  ];
}

function isFrameLine(line: string) {
  return /^[╔╗╚╝╠╣═║┌┐└┘├┤┬┴─│\s]+$/.test(line) && line.trim().length > 0;
}

function getLineClassName(line: string) {
  if (!line.trim()) {
    return "h-3";
  }

  if (line.startsWith("$ ")) {
    return "text-primary";
  }

  if (isFrameLine(line)) {
    return "text-foreground/90";
  }

  if (line.trimStart().startsWith("> ")) {
    return "text-foreground";
  }

  return "text-foreground/90";
}

const inlineHighlightPattern =
  /(https?:\/\/[^\s]+|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|\b(?:npm|pnpm|yarn|vite|node)\b|--[\w-]+|\b\d+(?:\.\d+){1,}\b)/g;

function renderInlineHighlight(text: string, keyPrefix: string, defaultClassName: string) {
  const segments: React.ReactNode[] = [];
  let lastIndex = 0;
  let matchIndex = 0;

  text.replace(inlineHighlightPattern, (match, _group, offset) => {
    if (lastIndex < offset) {
      segments.push(
        <span key={`${keyPrefix}-text-${matchIndex}`} className={defaultClassName}>
          {text.slice(lastIndex, offset)}
        </span>
      );
    }

    let className = defaultClassName;

    if (match.startsWith("http")) {
      className = "text-[var(--terminal-url-color)] underline decoration-current underline-offset-4";
    } else if (match.startsWith("'") || match.startsWith('"')) {
      className = "text-[var(--terminal-success-color)]";
    } else if (match.startsWith("--")) {
      className = "text-[var(--terminal-process-color)]";
    } else if (/^\d/.test(match)) {
      className = "text-[var(--terminal-url-color)]";
    } else {
      className = "text-[var(--terminal-process-color)]";
    }

    segments.push(
      <span key={`${keyPrefix}-token-${matchIndex}`} className={className}>
        {match}
      </span>
    );

    lastIndex = offset + match.length;
    matchIndex += 1;
    return match;
  });

  if (lastIndex < text.length) {
    segments.push(
      <span key={`${keyPrefix}-tail`} className={defaultClassName}>
        {text.slice(lastIndex)}
      </span>
    );
  }

  if (segments.length === 0) {
    return <span className={defaultClassName}>{text}</span>;
  }

  return segments;
}

function renderTerminalLine(line: string, index: number) {
  if (!line.trim()) {
    return " ";
  }

  if (isFrameLine(line)) {
    return line;
  }

  const shellPromptMatch = line.match(/^([^$]*@[^$]+)\$\s*(.*)$/);
  if (shellPromptMatch) {
    const [, prompt, command] = shellPromptMatch;

    return (
      <>
        <span className="text-[var(--terminal-prompt-color)]">{prompt}</span>
        <span className="text-[var(--terminal-prompt-color)]">$</span>
        {command ? (
          <>
            <span className="text-[var(--terminal-muted-color)]"> </span>
            {renderInlineHighlight(command, `shell-${index}`, "text-[var(--terminal-command-color)]")}
          </>
        ) : null}
      </>
    );
  }

  if (line.startsWith("$ ")) {
    return (
      <>
        <span className="text-[var(--terminal-prompt-color)]">$</span>
        <span className="text-[var(--terminal-muted-color)]"> </span>
        {renderInlineHighlight(line.slice(2), `command-${index}`, "text-[var(--terminal-command-color)]")}
      </>
    );
  }

  if (line.trimStart().startsWith("> ")) {
    const indentation = line.match(/^\s*/)?.[0] ?? "";
    const content = line.trimStart().slice(2);
    const helpLineMatch = content.match(/^([a-z0-9-]+)(\s+::\s+.*)$/i);

    return (
      <>
        {indentation ? <span className="text-[var(--terminal-muted-color)]">{indentation}</span> : null}
        <span className="text-[var(--terminal-process-color)]">&gt;</span>
        <span className="text-[var(--terminal-muted-color)]"> </span>
        {helpLineMatch ? (
          <>
            <span className="text-[var(--terminal-process-color)]">{helpLineMatch[1]}</span>
            {renderInlineHighlight(
              helpLineMatch[2],
              `help-${index}`,
              "text-[var(--terminal-muted-color)]"
            )}
          </>
        ) : (
          renderInlineHighlight(content, `process-${index}`, "text-[var(--terminal-command-color)]")
        )}
      </>
    );
  }

  const localLineMatch = line.match(/^(Local:)\s*(.+)$/);
  if (localLineMatch) {
    return (
      <>
        <span className="text-[var(--terminal-process-color)]">{localLineMatch[1]}</span>
        <span className="text-[var(--terminal-muted-color)]"> </span>
        {renderInlineHighlight(localLineMatch[2], `local-${index}`, "text-[var(--terminal-url-color)]")}
      </>
    );
  }

  if (/^Comando no reconocido:/i.test(line)) {
    return <span className="text-[var(--terminal-error-color)]">{line}</span>;
  }

  if (/^(Workspace ready\.|Terminal iniciada\.|Bonus project unlocked)/i.test(line)) {
    return renderInlineHighlight(line, `status-${index}`, "text-[var(--terminal-success-color)]");
  }

  if (/^Escribe /i.test(line)) {
    return renderInlineHighlight(line, `hint-${index}`, "text-[var(--terminal-muted-color)]");
  }

  return renderInlineHighlight(line, `default-${index}`, "text-foreground/90");
}

function resolveCommand(command: string, projects: ProjectItem[]): string[] {
  const normalized = command.trim().toLowerCase();

  if (!normalized) {
    return [];
  }

  if (normalized === "help") {
    return helpOutput;
  }

  if (normalized === "about") {
    return aboutOutput;
  }

  if (normalized === "skills") {
    return skillsOutput;
  }

  if (normalized === "contact") {
    return contactOutput;
  }

  if (normalized === "projects") {
    return getProjectsOutput(projects);
  }

  if (normalized === "whoami") {
    return ["rommelsoriano"];
  }

  if (normalized === "date") {
    return [
      new Date().toLocaleString("es-EC", {
        dateStyle: "full",
        timeStyle: "medium",
      }),
    ];
  }

  return [`Comando no reconocido: ${command}`, "Escribe 'help' para ver la lista."];
}

export function InteractiveTerminal({
  onClose,
  className,
  outputClassName,
  inputClassName,
  promptClassName,
  shellLabel = "rommelsoriano@portfolio:~",
  projects = defaultProjects,
  initialLines = [
    "Terminal iniciada.",
    "Escribe 'help' para comenzar.",
  ],
  hideHeader = false,
}: InteractiveTerminalProps) {
  const [command, setCommand] = React.useState("");
  const [lines, setLines] = React.useState<string[]>(initialLines);
  const outputRef = React.useRef<HTMLDivElement | null>(null);
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  React.useEffect(() => {
    inputRef.current?.focus();
  }, []);

  React.useEffect(() => {
    if (!outputRef.current) {
      return;
    }
    outputRef.current.scrollTop = outputRef.current.scrollHeight;
  }, [lines]);

  const executeCommand = React.useCallback(() => {
    const trimmed = command.trim();
    if (!trimmed) {
      return;
    }

    if (trimmed.toLowerCase() === "clear") {
      setLines([]);
      setCommand("");
      return;
    }

    const response = resolveCommand(trimmed, projects);
    setLines((current) => [...current, `$ ${trimmed}`, ...response]);
    setCommand("");
  }, [command, projects]);

  return (
    <div
      className={cn(
        "w-[min(96vw,560px)] rounded-2xl border border-primary/30 bg-card/95 shadow-[0_20px_70px_rgba(136,57,239,0.22)] backdrop-blur-xl dark:shadow-[0_20px_70px_rgba(203,166,247,0.32)] sm:w-[min(92vw,560px)] [--terminal-command-color:var(--foreground)] [--terminal-error-color:var(--destructive)] [--terminal-muted-color:var(--muted-foreground)] [--terminal-process-color:var(--accent)] [--terminal-prompt-color:var(--chart-3)] [--terminal-success-color:var(--chart-3)] [--terminal-url-color:var(--chart-2)]",
        className
      )}
    >
      {hideHeader ? null : (
        <div className="flex items-center justify-between border-b border-primary/20 px-3 py-3 sm:px-4">
          <div className="flex min-w-0 items-center gap-2 text-foreground">
            <TerminalSquare className="h-4 w-4" />
            <p className="truncate font-mono text-[13px] sm:text-sm">{shellLabel}</p>
          </div>
          {onClose ? (
            <button
              type="button"
              onClick={onClose}
              className="rounded-md p-1.5 text-foreground transition-colors duration-200 hover:bg-primary/20 hover:text-foreground cursor-pointer"
              aria-label="Cerrar terminal"
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </div>
      )}

      <div
        ref={outputRef}
        className={cn(
          "h-60 overflow-auto border-b border-primary/20 bg-background/65 px-3 py-3 font-mono text-[12px] leading-5 sm:h-64 sm:px-4 sm:text-[13px] sm:leading-6",
          outputClassName
        )}
      >
        <div className="min-w-max">
          {lines.map((line, index) => (
            <div
              key={`${line}-${index}`}
              className={cn("whitespace-pre pr-3 sm:pr-4", getLineClassName(line))}
            >
              {renderTerminalLine(line, index)}
            </div>
          ))}
        </div>
      </div>

      <div className={cn("flex items-center gap-2 px-3 py-3 font-mono text-[13px] sm:px-4 sm:text-sm", inputClassName)}>
        <span className={cn("text-primary", promptClassName)}>$</span>
        <input
          ref={inputRef}
          value={command}
          onChange={(event) => setCommand(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              executeCommand();
            }
          }}
          className="w-full bg-transparent text-foreground outline-none placeholder:text-muted-foreground"
          placeholder="Escribe un comando..."
          aria-label="Comando de terminal"
        />
      </div>
    </div>
  );
}

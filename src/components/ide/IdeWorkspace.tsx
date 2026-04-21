import * as React from "react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  type DragEndEvent,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  horizontalListSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  Bug,
  CheckCheck,
  ChevronDown,
  ChevronRight,
  CircleDot,
  ExternalLink,
  Files,
  GitBranch,
  Moon,
  Play,
  Search,
  Server,
  Settings,
  Sun,
  TerminalSquare,
  User,
  X,
} from "lucide-react";
import { InteractiveTerminal } from "@/components/InteractiveTerminal";
import {
  contactChannels,
  experiences,
  focusAreas,
  heroTags,
  profile,
  serviceItems,
  skillCategories,
} from "@/components/portfolio/data";
import type { ProjectItem } from "@/components/portfolio/types";
import { cn } from "@/lib/utils";

type MobileOverlay = "explorer" | "terminal" | null;
type DocumentGroup = "root" | "workspace";
type DocumentLanguage = "js" | "py" | "go" | "ts" | "json" | "sh" | "md";
type TerminalTab = (typeof terminalTabs)[number];
type PanelTone = "warning" | "info" | "success";
type PortStatus = "live" | "internal" | "standby" | "reserved";

interface WorkspaceDocument {
  id: string;
  filename: string;
  language: DocumentLanguage;
  group: DocumentGroup;
  path: string[];
  lines: string[];
}

interface IdeWorkspaceProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
  visibleProjects: ProjectItem[];
  konamiActivated: boolean;
  onReturnToMain: () => void;
}

interface WorkspaceProblem {
  id: string;
  severity: PanelTone;
  title: string;
  detail: string;
  file: string;
  location: string;
  source: string;
}

interface WorkspaceOutputEntry {
  id: string;
  tone: PanelTone;
  channel: string;
  title: string;
  detail: string;
}

interface WorkspaceDebugEvent {
  id: string;
  level: PanelTone;
  scope: string;
  message: string;
  detail: string;
  timestamp: string;
}

interface WorkspacePortEntry {
  port: number;
  status: PortStatus;
  label: string;
  host: string;
  target: string;
  note: string;
}

interface WatchEntry {
  label: string;
  value: string;
}

interface PanelMetricCardProps {
  label: string;
  value: string;
  hint: string;
  tone: PanelTone;
}

interface TerminalTabButtonProps {
  tab: TerminalTab;
  active: boolean;
  badge?: string;
  compact?: boolean;
  onSelect: (tab: TerminalTab) => void;
}

const menuItems = ["File", "Edit", "Selection", "View", "Go", "Run", "Terminal"] as const;
const terminalTabs = ["PROBLEMS", "OUTPUT", "DEBUG CONSOLE", "TERMINAL", "PORTS"] as const;
const tabsDropzoneId = "tabs-dropzone";

function getExplorerDragId(documentId: string) {
  return `explorer:${documentId}`;
}

function getTabDragId(documentId: string) {
  return `tab:${documentId}`;
}

const activityButtons: Array<{
  id: "files" | "search" | "git" | "run";
  label: string;
  icon: LucideIcon;
}> = [
  { id: "files", label: "Explorer", icon: Files },
  { id: "search", label: "Search", icon: Search },
  { id: "git", label: "Source Control", icon: GitBranch },
  { id: "run", label: "Run", icon: Play },
];

function getPanelToneColor(tone: PanelTone) {
  switch (tone) {
    case "warning":
      return "var(--ide-token-number)";
    case "success":
      return "var(--ide-token-string)";
    default:
      return "var(--ide-active)";
  }
}

function getPanelToneIcon(tone: PanelTone) {
  switch (tone) {
    case "warning":
      return AlertTriangle;
    case "success":
      return CheckCheck;
    default:
      return CircleDot;
  }
}

function getPortStatusColor(status: PortStatus) {
  switch (status) {
    case "live":
      return "var(--ide-token-string)";
    case "internal":
      return "var(--ide-active)";
    case "standby":
      return "var(--ide-token-number)";
    default:
      return "var(--ide-muted)";
  }
}

function getTerminalTabIcon(tab: TerminalTab) {
  switch (tab) {
    case "PROBLEMS":
      return AlertTriangle;
    case "OUTPUT":
      return Activity;
    case "DEBUG CONSOLE":
      return Bug;
    case "PORTS":
      return Server;
    default:
      return TerminalSquare;
  }
}

function PanelMetricCard({ label, value, hint, tone }: PanelMetricCardProps) {
  const toneColor = getPanelToneColor(tone);

  return (
    <article className="relative overflow-hidden rounded-2xl border border-[var(--ide-border)] bg-[var(--ide-tab-active)] px-4 py-4">
      <span className="absolute inset-x-0 top-0 h-1" style={{ backgroundColor: toneColor }} />
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--ide-muted)]">
        {label}
      </p>
      <p className="mt-3 text-2xl font-semibold text-[var(--ide-text)]">{value}</p>
      <p className="mt-2 text-sm leading-6 text-[var(--ide-muted)]">{hint}</p>
    </article>
  );
}

function TerminalTabButton({
  tab,
  active,
  badge,
  compact = false,
  onSelect,
}: TerminalTabButtonProps) {
  const Icon = getTerminalTabIcon(tab);

  return (
    <button
      type="button"
      onClick={() => onSelect(tab)}
      className={cn(
        "group inline-flex cursor-pointer items-center gap-2 whitespace-nowrap border-b-2 py-1 transition-colors duration-150",
        compact ? "px-0 text-[11px]" : "px-0 text-[12px]",
        active
          ? "border-[var(--ide-active)] text-[var(--ide-text)]"
          : "border-transparent text-[var(--ide-muted)] hover:text-[var(--ide-text)]"
      )}
      aria-pressed={active}
    >
      <Icon
        className={cn(
          compact ? "h-3.5 w-3.5" : "h-4 w-4",
          active ? "text-[var(--ide-active)]" : "text-current"
        )}
      />
      <span>{tab}</span>
      {badge ? (
        <span
          className={cn(
            "rounded-full border border-[var(--ide-border)] bg-[var(--ide-hover)] px-2 py-0.5 text-[10px] font-semibold tracking-[0.08em]",
            active ? "text-[var(--ide-text)]" : "text-[var(--ide-muted)]"
          )}
        >
          {badge}
        </span>
      ) : null}
    </button>
  );
}

function ProblemsPanel({ items }: { items: WorkspaceProblem[] }) {
  const warningCount = items.filter((item) => item.severity === "warning").length;
  const infoCount = items.filter((item) => item.severity === "info").length;
  const successCount = items.filter((item) => item.severity === "success").length;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="grid gap-3 lg:grid-cols-3">
        <PanelMetricCard
          label="Build blockers"
          value="0"
          hint="No hay errores críticos rompiendo la experiencia del workspace."
          tone="success"
        />
        <PanelMetricCard
          label="Warnings"
          value={String(warningCount)}
          hint="Señales de mejora para mantener la interfaz clara mientras crece."
          tone="warning"
        />
        <PanelMetricCard
          label="Notes"
          value={String(infoCount + successCount)}
          hint="Contexto útil sobre estado actual, foco del editor y contenido desbloqueado."
          tone="info"
        />
      </div>

      <div className="mt-4 space-y-3">
        {items.map((item) => {
          const toneColor = getPanelToneColor(item.severity);
          const Icon = getPanelToneIcon(item.severity);

          return (
            <article
              key={item.id}
              className="rounded-2xl border border-[var(--ide-border)] bg-[var(--ide-tab-active)] p-4"
              style={{ boxShadow: `inset 3px 0 0 ${toneColor}` }}
            >
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                  <div className="flex items-center gap-3">
                    <span
                      className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--ide-hover)]"
                      style={{ color: toneColor }}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-[var(--ide-text)]">{item.title}</p>
                      <p className="truncate text-[11px] uppercase tracking-[0.12em] text-[var(--ide-muted)]">
                        {item.file} · {item.location}
                      </p>
                    </div>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-[var(--ide-muted)]">{item.detail}</p>
                </div>

                <span className="inline-flex rounded-full border border-[var(--ide-border)] bg-[var(--ide-hover)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--ide-text)]">
                  {item.source}
                </span>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

function OutputPanel({
  entries,
  activeDocument,
  openTabsCount,
  documentCount,
  projectCount,
  konamiActivated,
}: {
  entries: WorkspaceOutputEntry[];
  activeDocument: WorkspaceDocument;
  openTabsCount: number;
  documentCount: number;
  projectCount: number;
  konamiActivated: boolean;
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="grid gap-3 lg:grid-cols-3">
        <PanelMetricCard
          label="Focused file"
          value={activeDocument.filename}
          hint={`${activeDocument.lines.length} lineas renderizadas en el editor actual.`}
          tone="info"
        />
        <PanelMetricCard
          label="Indexed docs"
          value={String(documentCount)}
          hint={`${openTabsCount} tabs abiertas dentro de la sesion del workspace.`}
          tone="success"
        />
        <PanelMetricCard
          label="Project graph"
          value={String(projectCount)}
          hint={konamiActivated ? "Incluye el proyecto bonus desbloqueado." : "Muestra el set base del portfolio."}
          tone={konamiActivated ? "success" : "warning"}
        />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {["npm run dev", "npm run build", "npm run preview"].map((command) => (
          <span
            key={command}
            className="rounded-full border border-[var(--ide-border)] bg-[var(--ide-tab-active)] px-3 py-1 font-mono text-[11px] text-[var(--ide-text)]"
          >
            {command}
          </span>
        ))}
      </div>

      <div className="mt-4 space-y-3">
        {entries.map((entry, index) => {
          const toneColor = getPanelToneColor(entry.tone);

          return (
            <article
              key={entry.id}
              className="rounded-2xl border border-[var(--ide-border)] bg-[var(--ide-tab-active)] p-4"
              style={{ boxShadow: `inset 3px 0 0 ${toneColor}` }}
            >
              <div className="flex items-start gap-3">
                <span
                  className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--ide-hover)] text-sm font-semibold"
                  style={{ color: toneColor }}
                >
                  {index + 1}
                </span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-[var(--ide-text)]">{entry.channel}</p>
                    <span className="rounded-full border border-[var(--ide-border)] bg-[var(--ide-hover)] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--ide-muted)]">
                      {entry.title}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-[var(--ide-text)]">{entry.detail}</p>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

function DebugConsolePanel({
  watchEntries,
  events,
}: {
  watchEntries: WatchEntry[];
  events: WorkspaceDebugEvent[];
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {watchEntries.map((entry) => (
          <article
            key={entry.label}
            className="rounded-2xl border border-[var(--ide-border)] bg-[var(--ide-tab-active)] px-4 py-3"
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--ide-muted)]">
              {entry.label}
            </p>
            <p className="mt-2 break-all font-mono text-[13px] text-[var(--ide-text)]">{entry.value}</p>
          </article>
        ))}
      </div>

      <div className="mt-4 space-y-3">
        {events.length > 0 ? (
          events.map((event) => {
            const toneColor = getPanelToneColor(event.level);
            const Icon = getPanelToneIcon(event.level);

            return (
              <article
                key={event.id}
                className="rounded-2xl border border-[var(--ide-border)] bg-[var(--ide-tab-active)] p-4"
                style={{ boxShadow: `inset 3px 0 0 ${toneColor}` }}
              >
                <div className="flex items-start gap-3">
                  <span
                    className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--ide-hover)]"
                    style={{ color: toneColor }}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--ide-muted)]">
                        {event.timestamp}
                      </p>
                      <span className="rounded-full border border-[var(--ide-border)] bg-[var(--ide-hover)] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--ide-text)]">
                        {event.scope}
                      </span>
                    </div>
                    <p className="mt-2 text-sm font-semibold text-[var(--ide-text)]">{event.message}</p>
                    <p className="mt-1 text-sm leading-6 text-[var(--ide-muted)]">{event.detail}</p>
                  </div>
                </div>
              </article>
            );
          })
        ) : (
          <article className="rounded-2xl border border-dashed border-[var(--ide-border)] bg-[var(--ide-tab-active)] p-5 text-sm text-[var(--ide-muted)]">
            Aun no hay eventos registrados en la consola de debug.
          </article>
        )}
      </div>
    </div>
  );
}

function PortsPanel({ entries }: { entries: WorkspacePortEntry[] }) {
  const liveCount = entries.filter((entry) => entry.status === "live").length;
  const internalCount = entries.filter((entry) => entry.status === "internal").length;
  const standbyCount = entries.filter((entry) => entry.status === "standby" || entry.status === "reserved").length;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="grid gap-3 lg:grid-cols-3">
        <PanelMetricCard
          label="Exposed"
          value={String(liveCount)}
          hint="Servicio principal disponible para abrir el portfolio en desarrollo."
          tone="success"
        />
        <PanelMetricCard
          label="Internal"
          value={String(internalCount)}
          hint="Canales auxiliares de hot reload y sincronizacion del editor."
          tone="info"
        />
        <PanelMetricCard
          label="Standby"
          value={String(standbyCount)}
          hint="Rutas reservadas para preview y debugging avanzado."
          tone="warning"
        />
      </div>

      <div className="mt-4 space-y-3">
        {entries.map((entry) => {
          const toneColor = getPortStatusColor(entry.status);

          return (
            <article
              key={`${entry.port}-${entry.label}`}
              className="rounded-2xl border border-[var(--ide-border)] bg-[var(--ide-tab-active)] p-4"
              style={{ boxShadow: `inset 3px 0 0 ${toneColor}` }}
            >
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <span
                      className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--ide-hover)]"
                      style={{ color: toneColor }}
                    >
                      <Server className="h-4 w-4" />
                    </span>
                    <code className="rounded-lg bg-[var(--ide-hover)] px-3 py-2 font-mono text-[13px] text-[var(--ide-text)]">
                      {entry.port}
                    </code>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-[var(--ide-text)]">{entry.label}</p>
                      <p className="truncate text-[11px] uppercase tracking-[0.12em] text-[var(--ide-muted)]">
                        {entry.host}
                        {" -> "}
                        {entry.target}
                      </p>
                    </div>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-[var(--ide-muted)]">{entry.note}</p>
                </div>

                <span
                  className="inline-flex items-center gap-2 rounded-full border border-[var(--ide-border)] bg-[var(--ide-hover)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]"
                  style={{ color: toneColor }}
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  {entry.status}
                </span>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

function escapeValue(value: string) {
  return JSON.stringify(value);
}

function formatList(values: string[]) {
  return `[${values.map((value) => escapeValue(value)).join(", ")}]`;
}

function createWorkspaceDocuments(visibleProjects: ProjectItem[]): WorkspaceDocument[] {
  return [
    {
      id: "about",
      filename: "AboutMe.js",
      language: "js",
      group: "root",
      path: ["PORTFOLIO", "AboutMe.js"],
      lines: [
        "/**",
        ` * ${profile.headline}`,
        ` * ${profile.intro}`,
        " */",
        "",
        "const developer = {",
        `  name: ${escapeValue(profile.name)},`,
        `  role: ${escapeValue(profile.headline)},`,
        `  location: ${escapeValue(profile.location)},`,
        `  availability: ${escapeValue(profile.availability)},`,
        `  focus: ${formatList(heroTags)},`,
        "};",
        "",
        "export default function getBio() {",
        `  return ${escapeValue(profile.intro)};`,
        "}",
      ],
    },
    {
      id: "projects",
      filename: "Projects.py",
      language: "py",
      group: "root",
      path: ["PORTFOLIO", "Projects.py"],
      lines: [
        "projects = [",
        ...visibleProjects.flatMap((project, index) => [
          "    {",
          `        "title": ${escapeValue(project.title)},`,
          `        "stack": ${formatList(project.tags)},`,
          `        "impact": ${escapeValue(project.impact)},`,
          `        "url": ${escapeValue(project.codeUrl)},`,
          `        "bonus": ${project.isEasterEgg ? "True" : "False"},`,
          "    }" + (index < visibleProjects.length - 1 ? "," : ""),
        ]),
        "]",
        "",
        "def list_titles():",
        '    return [project["title"] for project in projects]',
      ],
    },
    {
      id: "experience",
      filename: "Experience.go",
      language: "go",
      group: "root",
      path: ["PORTFOLIO", "Experience.go"],
      lines: [
        "package portfolio",
        "",
        "type Experience struct {",
        "    Role    string",
        "    Company string",
        "    Period  string",
        "    Bullets []string",
        "}",
        "",
        "var Timeline = []Experience{",
        ...experiences.flatMap((experience, index) => [
          "    {",
          `        Role: ${escapeValue(experience.role)},`,
          `        Company: ${escapeValue(experience.company)},`,
          `        Period: ${escapeValue(experience.period)},`,
          `        Bullets: ${formatList(experience.bullets)},`,
          "    }" + (index < experiences.length - 1 ? "," : ""),
        ]),
        "}",
      ],
    },
    {
      id: "skills",
      filename: "Skills.ts",
      language: "ts",
      group: "workspace",
      path: ["PORTFOLIO", "workspace", "Skills.ts"],
      lines: [
        "export const skills = {",
        ...skillCategories.flatMap((category, index) => [
          `  ${category.id}: {`,
          `    title: ${escapeValue(category.title)},`,
          `    summary: ${escapeValue(category.summary)},`,
          `    items: ${formatList(category.items)},`,
          "  }" + (index < skillCategories.length - 1 ? "," : ""),
        ]),
        "};",
      ],
    },
    {
      id: "services",
      filename: "Services.json",
      language: "json",
      group: "workspace",
      path: ["PORTFOLIO", "workspace", "Services.json"],
      lines: [
        "{",
        '  "services": [',
        ...serviceItems.flatMap((service, index) => [
          "    {",
          `      "title": ${escapeValue(service.title)},`,
          `      "description": ${escapeValue(service.description)},`,
          `      "deliverables": ${formatList(service.deliverables)}`,
          "    }" + (index < serviceItems.length - 1 ? "," : ""),
        ]),
        "  ]",
        "}",
      ],
    },
    {
      id: "contact",
      filename: "Contact.sh",
      language: "sh",
      group: "workspace",
      path: ["PORTFOLIO", "workspace", "Contact.sh"],
      lines: [
        "#!/usr/bin/env bash",
        "",
        `export EMAIL=${escapeValue(profile.social.email.replace("mailto:", ""))}`,
        `export GITHUB=${escapeValue(profile.social.github)}`,
        `export LINKEDIN=${escapeValue(profile.social.linkedin)}`,
        `export CV_URL=${escapeValue(profile.cvUrl)}`,
        "",
        ...contactChannels.map(
          (channel) => `${channel.label.toUpperCase()}=${escapeValue(channel.href)}`
        ),
      ],
    },
    {
      id: "resume",
      filename: "Resume.md",
      language: "md",
      group: "workspace",
      path: ["PORTFOLIO", "workspace", "Resume.md"],
      lines: [
        "# Resume Snapshot",
        "",
        `- Name: ${profile.name}`,
        `- Location: ${profile.location}`,
        `- Availability: ${profile.availability}`,
        "",
        "## Focus Areas",
        ...focusAreas.map((area) => `- ${area.title}: ${area.description}`),
      ],
    },
  ];
}

function getLanguageBadge(language: DocumentLanguage) {
  switch (language) {
    case "js":
      return { label: "JS", className: "bg-[var(--ide-badge-js-bg)] text-[var(--ide-badge-js-text)]" };
    case "py":
      return { label: "PY", className: "bg-[var(--ide-badge-py-bg)] text-[var(--ide-badge-py-text)]" };
    case "go":
      return { label: "GO", className: "bg-[var(--ide-badge-go-bg)] text-[var(--ide-badge-go-text)]" };
    case "ts":
      return { label: "TS", className: "bg-[var(--ide-badge-ts-bg)] text-[var(--ide-badge-ts-text)]" };
    case "json":
      return { label: "{}", className: "bg-[var(--ide-badge-json-bg)] text-[var(--ide-badge-json-text)]" };
    case "sh":
      return { label: "SH", className: "bg-[var(--ide-badge-sh-bg)] text-[var(--ide-badge-sh-text)]" };
    case "md":
      return { label: "MD", className: "bg-[var(--ide-badge-md-bg)] text-[var(--ide-badge-md-text)]" };
    default:
      return { label: "FILE", className: "bg-[var(--ide-badge-js-bg)] text-[var(--ide-badge-js-text)]" };
  }
}

function highlightPlainSegment(segment: string, key: string) {
  const propertyPattern = /([A-Za-z_][\w-]*)(?=\s*:)/g;
  const fragments: React.ReactNode[] = [];
  let lastIndex = 0;

  segment.replace(propertyPattern, (match, _group, offset) => {
    if (offset > lastIndex) {
      fragments.push(segment.slice(lastIndex, offset));
    }

    fragments.push(
      <span key={`${key}-property-${offset}`} className="text-[var(--ide-token-property)]">
        {match}
      </span>
    );

    lastIndex = offset + match.length;
    return match;
  });

  if (lastIndex < segment.length) {
    fragments.push(segment.slice(lastIndex));
  }

  return fragments.length > 0 ? fragments : [segment];
}

function renderHighlightedLine(line: string, lineNumber: number) {
  const trimmed = line.trim();

  if (
    trimmed.startsWith("/**") ||
    trimmed.startsWith("*/") ||
    trimmed.startsWith("*") ||
    trimmed.startsWith("#")
  ) {
    return (
      <div className="ide-code-line grid grid-cols-[34px_minmax(0,1fr)] gap-3 px-3 py-1.5 sm:grid-cols-[46px_minmax(0,1fr)] sm:gap-4 sm:px-5">
        <span className="select-none text-right font-mono text-xs text-[var(--ide-line-number)]">
          {lineNumber}
        </span>
        <code className="block whitespace-pre-wrap break-words font-mono text-[13px] italic text-[var(--ide-token-comment)] sm:text-[14px]">
          {line || " "}
        </code>
      </div>
    );
  }

  const tokenPattern =
    /(".*?"|'.*?'|`.*?`|\b(?:export|default|function|const|return|package|type|var|def|True|False)\b|\b\d+\b)/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let matchIndex = 0;

  line.replace(tokenPattern, (match, _group, offset) => {
    const segment = line.slice(lastIndex, offset);
    if (segment) {
      parts.push(...highlightPlainSegment(segment, `${lineNumber}-${matchIndex}`));
    }

    let className = "text-[var(--ide-text)]";

    if (/^["'`]/.test(match)) {
      className = "text-[var(--ide-token-string)]";
    } else if (/^\d+$/.test(match)) {
      className = "text-[var(--ide-token-number)]";
    } else {
      className = "text-[var(--ide-token-keyword)]";
    }

    parts.push(
      <span key={`${lineNumber}-token-${matchIndex}`} className={className}>
        {match}
      </span>
    );

    lastIndex = offset + match.length;
    matchIndex += 1;
    return match;
  });

  if (lastIndex < line.length) {
    parts.push(...highlightPlainSegment(line.slice(lastIndex), `${lineNumber}-tail`));
  }

  return (
    <div className="ide-code-line grid grid-cols-[34px_minmax(0,1fr)] gap-3 px-3 py-1.5 sm:grid-cols-[46px_minmax(0,1fr)] sm:gap-4 sm:px-5">
      <span className="select-none text-right font-mono text-xs text-[var(--ide-line-number)]">
        {lineNumber}
      </span>
      <code className="block whitespace-pre-wrap break-words font-mono text-[13px] text-[var(--ide-text)] sm:text-[14px]">
        {parts.length > 0 ? parts : " "}
      </code>
    </div>
  );
}

function ExplorerItem({
  document,
  active,
  onOpen,
}: {
  document: WorkspaceDocument;
  active: boolean;
  onOpen: (id: string) => void;
}) {
  const badge = getLanguageBadge(document.language);
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: getExplorerDragId(document.id),
    data: {
      source: "explorer",
      documentId: document.id,
    },
  });

  return (
    <button
      ref={setNodeRef}
      type="button"
      onClick={() => onOpen(document.id)}
      style={{
        transform: CSS.Translate.toString(transform),
      }}
      className={cn(
        "ide-explorer-item flex w-full cursor-pointer items-center gap-3 border-l-2 px-3 py-2 text-left transition-colors duration-150 touch-none",
        active
          ? "border-[var(--ide-active)] bg-[var(--ide-explorer-active)] text-[var(--ide-text)]"
          : "border-transparent text-[var(--ide-muted)] hover:bg-[var(--ide-hover)] hover:text-[var(--ide-text)]",
        isDragging && "z-[3] opacity-70 shadow-[0_18px_30px_rgba(15,23,42,0.18)]"
      )}
      {...attributes}
      {...listeners}
    >
      <span
        className={cn(
          "inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-sm text-[8px] font-bold uppercase tracking-[0.08em] sm:h-[18px] sm:w-[18px] sm:text-[9px]",
          badge.className
        )}
      >
        {badge.label}
      </span>
      <span className="truncate text-[14px] sm:text-[15px]">{document.filename}</span>
    </button>
  );
}

function SortableTab({
  document,
  active,
  canClose,
  onSelect,
  onClose,
}: {
  document: WorkspaceDocument;
  active: boolean;
  canClose: boolean;
  onSelect: (id: string) => void;
  onClose: (id: string) => void;
}) {
  const badge = getLanguageBadge(document.language);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: getTabDragId(document.id),
    data: {
      source: "tabs",
      documentId: document.id,
    },
  });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 2 : undefined,
      }}
      className={cn("shrink-0", isDragging && "opacity-80")}
    >
      <button
        type="button"
        onClick={() => onSelect(document.id)}
        className={cn(
          "ide-tab relative inline-flex cursor-pointer items-center gap-2 border-r border-[var(--ide-border)] px-3 py-3 text-left text-[13px] transition-colors duration-150 touch-none sm:gap-3 sm:px-4 sm:py-3.5 sm:text-[14px] lg:px-5 lg:py-4 lg:text-[15px]",
          active
            ? "bg-[var(--ide-tab-active)] text-[var(--ide-text)]"
            : "bg-[var(--ide-tab)] text-[var(--ide-muted)] hover:bg-[var(--ide-hover)] hover:text-[var(--ide-text)]",
          isDragging && "shadow-[0_16px_30px_rgba(15,23,42,0.18)]"
        )}
        {...attributes}
        {...listeners}
      >
        {active ? <span className="absolute left-0 top-0 h-[2px] w-full bg-[var(--ide-active)]" /> : null}
        <span
          className={cn(
            "inline-flex h-4 w-4 items-center justify-center rounded-sm text-[8px] font-bold uppercase tracking-[0.08em] sm:h-[18px] sm:w-[18px] sm:text-[9px]",
            badge.className
          )}
        >
          {badge.label}
        </span>
        <span className="max-w-[110px] truncate sm:max-w-none">{document.filename}</span>
        {canClose ? (
          <span
            role="button"
            tabIndex={0}
            onClick={(event) => {
              event.stopPropagation();
              onClose(document.id);
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                event.stopPropagation();
                onClose(document.id);
              }
            }}
            className="inline-flex h-4 w-4 items-center justify-center rounded-sm text-[var(--ide-muted)] transition-colors duration-150 hover:bg-[var(--ide-hover)] hover:text-[var(--ide-text)] sm:h-5 sm:w-5"
            aria-label={`Cerrar ${document.filename}`}
          >
            <X className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
          </span>
        ) : null}
      </button>
    </div>
  );
}

export function IdeWorkspace({
  darkMode,
  toggleDarkMode,
  visibleProjects,
  konamiActivated,
  onReturnToMain,
}: IdeWorkspaceProps) {
  const prefersReducedMotion = useReducedMotion() ?? false;
  const documents = React.useMemo(() => createWorkspaceDocuments(visibleProjects), [visibleProjects]);
  const documentsById = React.useMemo(
    () => new Map(documents.map((document) => [document.id, document])),
    [documents]
  );

  const [isCompactViewport, setIsCompactViewport] = React.useState(false);
  const [mobileOverlay, setMobileOverlay] = React.useState<MobileOverlay>(null);
  const [workspaceOpen, setWorkspaceOpen] = React.useState(true);
  const [openDocumentIds, setOpenDocumentIds] = React.useState<string[]>(["about", "projects", "experience"]);
  const [activeDocumentId, setActiveDocumentId] = React.useState("about");
  const [terminalVisible, setTerminalVisible] = React.useState(true);
  const [activeTerminalTab, setActiveTerminalTab] = React.useState<TerminalTab>("TERMINAL");
  const [debugEvents, setDebugEvents] = React.useState<WorkspaceDebugEvent[]>([]);
  const { isOver: isTabsDropzoneOver, setNodeRef: setTabsDropzoneRef } = useDroppable({
    id: tabsDropzoneId,
  });
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  React.useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 1023px)");

    const syncViewport = () => {
      const compact = mediaQuery.matches;
      setIsCompactViewport(compact);

      if (!compact) {
        setMobileOverlay(null);
      }
    };

    syncViewport();
    mediaQuery.addEventListener("change", syncViewport);
    return () => mediaQuery.removeEventListener("change", syncViewport);
  }, []);

  React.useEffect(() => {
    if (isCompactViewport) {
      setTerminalVisible(false);
    }
  }, [isCompactViewport]);

  React.useEffect(() => {
    setOpenDocumentIds((current) => current.filter((docId) => documentsById.has(docId)));

    if (!documentsById.has(activeDocumentId) && documents[0]) {
      setActiveDocumentId(documents[0].id);
    }
  }, [activeDocumentId, documents, documentsById]);

  const activeDocument = documentsById.get(activeDocumentId) ?? documents[0];
  const openDocuments = openDocumentIds
    .map((documentId) => documentsById.get(documentId))
    .filter((document): document is WorkspaceDocument => Boolean(document));
  const openDocumentDragIds = React.useMemo(
    () => openDocumentIds.map((documentId) => getTabDragId(documentId)),
    [openDocumentIds]
  );
  const terminalInitialLines = React.useMemo(
    () => [
      "rommelsoriano@portfolio:~$ npm run dev",
      "> portfolio-react@0.0.0 dev",
      "> vite --host 0.0.0.0",
      "Local: http://localhost:5173/",
      konamiActivated
        ? "Bonus project unlocked and mounted in Projects.py"
        : "Workspace ready. Usa 'projects' o 'contact'.",
    ],
    [konamiActivated]
  );
  const rootDocuments = documents.filter((document) => document.group === "root");
  const workspaceDocuments = documents.filter((document) => document.group === "workspace");
  const pushDebugEvent = React.useCallback(
    (level: PanelTone, scope: string, message: string, detail: string) => {
      const timestamp = new Date().toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      });

      setDebugEvents((current) =>
        [
          {
            id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
            level,
            scope,
            message,
            detail,
            timestamp,
          },
          ...current,
        ].slice(0, 12)
      );
    },
    []
  );

  React.useEffect(() => {
    pushDebugEvent(
      "success",
      "workspace.boot",
      "IDE workspace mounted",
      `${documents.length} documentos indexados y ${visibleProjects.length} proyectos enlazados.`
    );
  }, [documents.length, pushDebugEvent, visibleProjects.length]);

  React.useEffect(() => {
    pushDebugEvent(
      "info",
      "editor.focus",
      `Focused ${activeDocument.filename}`,
      activeDocument.path.join(" > ")
    );
  }, [activeDocument.filename, activeDocument.path, pushDebugEvent]);

  React.useEffect(() => {
    pushDebugEvent(
      "info",
      "panel.switch",
      `Bottom panel -> ${activeTerminalTab}`,
      activeTerminalTab === "TERMINAL"
        ? "Shell interactiva lista para recibir comandos."
        : "Panel contextual del workspace renderizado correctamente."
    );
  }, [activeTerminalTab, pushDebugEvent]);

  React.useEffect(() => {
    if (!konamiActivated) {
      return;
    }

    pushDebugEvent(
      "success",
      "workspace.unlock",
      "Bonus project unlocked",
      "Projects.py monta el proyecto universitario adicional dentro del explorer."
    );
  }, [konamiActivated, pushDebugEvent]);

  const workspaceProblems = React.useMemo<WorkspaceProblem[]>(
    () => [
      {
        id: "active-file-density",
        severity: activeDocument.lines.length > 18 ? "warning" : "info",
        title:
          activeDocument.lines.length > 18
            ? "Preview con bastante contexto visible"
            : "Preview enfocado y facil de escanear",
        detail:
          activeDocument.lines.length > 18
            ? `${activeDocument.filename} ya expone ${activeDocument.lines.length} lineas en el editor. Si el archivo sigue creciendo, conviene plegado o dividir bloques narrativos.`
            : `${activeDocument.filename} mantiene una cantidad de lineas comoda para lectura rapida dentro del workspace.`,
        file: activeDocument.filename,
        location: `1:${activeDocument.lines.length}`,
        source: "editor.preview",
      },
      {
        id: "open-tabs-load",
        severity: openDocuments.length >= 5 ? "warning" : "success",
        title: openDocuments.length >= 5 ? "Muchas tabs abiertas al mismo tiempo" : "Carga de tabs bajo control",
        detail:
          openDocuments.length >= 5
            ? `Hay ${openDocuments.length} tabs abiertas en paralelo. Sigue usable, pero cerrar algunas mantendria mejor foco visual.`
            : `${openDocuments.length} tabs abiertas y ordenables por drag and drop. La sesion sigue limpia y facil de navegar.`,
        file: "workspace",
        location: `tabs:${openDocuments.length}`,
        source: "editor.session",
      },
      {
        id: "project-catalog",
        severity: konamiActivated ? "success" : "info",
        title: konamiActivated ? "Proyecto bonus montado correctamente" : "Catalogo principal listo",
        detail: konamiActivated
          ? `El panel de proyectos ya muestra ${visibleProjects.length} entradas, incluyendo el easter egg desbloqueado.`
          : `Projects.py expone ${visibleProjects.length} proyectos visibles. El bonus permanece bloqueado hasta activar el Konami Code.`,
        file: "Projects.py",
        location: `projects:${visibleProjects.length}`,
        source: "portfolio.graph",
      },
    ],
    [activeDocument.filename, activeDocument.lines.length, konamiActivated, openDocuments.length, visibleProjects.length]
  );

  const workspaceOutputEntries = React.useMemo<WorkspaceOutputEntry[]>(
    () => [
      {
        id: "boot-sequence",
        tone: "success",
        channel: "workspace.boot",
        title: "ready",
        detail: "La interfaz IDE se inicializo con explorer lateral, tabs arrastrables y estado de panel inferior sincronizado.",
      },
      {
        id: "editor-index",
        tone: "info",
        channel: "editor.index",
        title: "indexed",
        detail: `${documents.length} documentos fueron convertidos en previews tipadas dentro del workspace.`,
      },
      {
        id: "editor-focus",
        tone: "info",
        channel: "editor.focus",
        title: "active",
        detail: `La sesion actual esta enfocada en ${activeDocument.filename} con ${openDocuments.length} tabs abiertas.`,
      },
      {
        id: "project-pipeline",
        tone: konamiActivated ? "success" : "warning",
        channel: "portfolio.projects",
        title: konamiActivated ? "expanded" : "stable",
        detail: konamiActivated
          ? "El grafo de proyectos ya incorporo la entrada oculta del modo developer."
          : "El grafo de proyectos mantiene el set base del portfolio hasta desbloquear el easter egg.",
      },
      {
        id: "runtime-shell",
        tone: "success",
        channel: "runtime.shell",
        title: "listening",
        detail: "Vite sirve la app en http://localhost:5173 mientras el terminal permanece disponible para comandos interactivos.",
      },
    ],
    [activeDocument.filename, documents.length, konamiActivated, openDocuments.length]
  );

  const portEntries = React.useMemo<WorkspacePortEntry[]>(
    () => [
      {
        port: 5173,
        status: "live",
        label: "Portfolio dev server",
        host: "0.0.0.0",
        target: "http://localhost:5173",
        note: "Puerto principal para visualizar la aplicacion React con Vite dentro del contenedor.",
      },
      {
        port: 24678,
        status: "internal",
        label: "Vite HMR channel",
        host: "127.0.0.1",
        target: "ws://localhost:24678",
        note: "Canal de hot reload que refresca la UI cuando cambian componentes o estilos.",
      },
      {
        port: 4173,
        status: "standby",
        label: "Preview build",
        host: "0.0.0.0",
        target: "vite preview",
        note: "Se habilita al ejecutar npm run preview para validar el bundle de produccion localmente.",
      },
      {
        port: 9229,
        status: "reserved",
        label: "Node inspector",
        host: "127.0.0.1",
        target: "node --inspect",
        note: "Reservado para debugging profundo cuando haga falta inspeccionar procesos del runtime.",
      },
    ],
    []
  );

  const watchEntries = React.useMemo<WatchEntry[]>(
    () => [
      { label: "activeDocument", value: activeDocument.filename },
      { label: "language", value: activeDocument.language.toUpperCase() },
      { label: "openTabs", value: String(openDocuments.length) },
      { label: "visibleProjects", value: String(visibleProjects.length) },
      { label: "theme", value: darkMode ? "dark" : "light" },
      { label: "bottomPanel", value: activeTerminalTab },
    ],
    [activeDocument.filename, activeDocument.language, activeTerminalTab, darkMode, openDocuments.length, visibleProjects.length]
  );

  const terminalTabBadges = React.useMemo<Record<TerminalTab, string>>(
    () => ({
      PROBLEMS:
        workspaceProblems.filter((problem) => problem.severity === "warning").length > 0
          ? String(workspaceProblems.filter((problem) => problem.severity === "warning").length)
          : "OK",
      OUTPUT: "LIVE",
      "DEBUG CONSOLE": String(debugEvents.length),
      TERMINAL: "SHELL",
      PORTS: String(portEntries.length),
    }),
    [debugEvents.length, portEntries.length, workspaceProblems]
  );

  const auxiliaryPanelContent =
    activeTerminalTab === "PROBLEMS" ? (
      <ProblemsPanel items={workspaceProblems} />
    ) : activeTerminalTab === "OUTPUT" ? (
      <OutputPanel
        entries={workspaceOutputEntries}
        activeDocument={activeDocument}
        openTabsCount={openDocuments.length}
        documentCount={documents.length}
        projectCount={visibleProjects.length}
        konamiActivated={konamiActivated}
      />
    ) : activeTerminalTab === "DEBUG CONSOLE" ? (
      <DebugConsolePanel watchEntries={watchEntries} events={debugEvents} />
    ) : activeTerminalTab === "PORTS" ? (
      <PortsPanel entries={portEntries} />
    ) : null;

  const selectTerminalTab = React.useCallback((tab: TerminalTab) => {
    setActiveTerminalTab(tab);
  }, []);

  const openDocument = React.useCallback(
    (documentId: string) => {
      const selectedDocument = documentsById.get(documentId);
      const alreadyOpen = openDocumentIds.includes(documentId);

      setOpenDocumentIds((current) => (current.includes(documentId) ? current : [...current, documentId]));
      setActiveDocumentId(documentId);
      setMobileOverlay(null);

      if (selectedDocument) {
        pushDebugEvent(
          alreadyOpen ? "info" : "success",
          "editor.open",
          alreadyOpen ? `Focused ${selectedDocument.filename}` : `Opened ${selectedDocument.filename}`,
          selectedDocument.path.join(" > ")
        );
      }
    },
    [documentsById, openDocumentIds, pushDebugEvent]
  );

  const closeDocument = React.useCallback(
    (documentId: string) => {
      const selectedDocument = documentsById.get(documentId);

      setOpenDocumentIds((current) => {
        const next = current.filter((id) => id !== documentId);
        if (next.length === 0 && documents[0]) {
          setActiveDocumentId(documents[0].id);
          return [documents[0].id];
        }

        if (activeDocumentId === documentId) {
          setActiveDocumentId(next[next.length - 1]);
        }

        return next;
      });

      if (selectedDocument) {
        pushDebugEvent(
          "warning",
          "editor.close",
          `Closed ${selectedDocument.filename}`,
          selectedDocument.path.join(" > ")
        );
      }
    },
    [activeDocumentId, documents, documentsById, pushDebugEvent]
  );

  const handleTabDragEnd = React.useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      return;
    }

    const activeDocumentId = String(active.data.current?.documentId ?? active.id);
    const overDocumentId = over.id === tabsDropzoneId ? null : String(over.data.current?.documentId ?? over.id);
    const source = active.data.current?.source;

    if (source === "explorer") {
      setOpenDocumentIds((current) => {
        const withoutDraggedDocument = current.filter((id) => id !== activeDocumentId);

        if (over.id === tabsDropzoneId) {
          return [...withoutDraggedDocument, activeDocumentId];
        }

        const overIndex = overDocumentId ? withoutDraggedDocument.indexOf(overDocumentId) : -1;
        if (overIndex < 0) {
          return [...withoutDraggedDocument, activeDocumentId];
        }

        const next = [...withoutDraggedDocument];
        next.splice(overIndex + 1, 0, activeDocumentId);
        return next;
      });

      setActiveDocumentId(activeDocumentId);
      setMobileOverlay(null);
      const movedDocument = documentsById.get(activeDocumentId);
      if (movedDocument) {
        pushDebugEvent(
          "success",
          "editor.pin",
          `Pinned ${movedDocument.filename} into tabs`,
          "Documento arrastrado desde el explorer hacia la barra superior."
        );
      }
      return;
    }

    if (activeDocumentId === overDocumentId) {
      return;
    }

    setOpenDocumentIds((current) => {
      const oldIndex = current.indexOf(activeDocumentId);

      if (oldIndex < 0) {
        return current;
      }

      if (over.id === tabsDropzoneId) {
        return arrayMove(current, oldIndex, current.length - 1);
      }

      const newIndex = overDocumentId ? current.indexOf(overDocumentId) : -1;
      if (newIndex < 0) {
        return current;
      }

      return arrayMove(current, oldIndex, newIndex);
    });
    const movedDocument = documentsById.get(activeDocumentId);
    if (movedDocument) {
      pushDebugEvent(
        "info",
        "editor.reorder",
        `Reordered ${movedDocument.filename}`,
        "La barra de tabs se actualizo con el nuevo orden del documento."
      );
    }
  }, [documentsById, pushDebugEvent]);

  const hideTerminal = React.useCallback(() => {
    setTerminalVisible(false);
    pushDebugEvent("warning", "panel.visibility", "Bottom panel collapsed", "La zona inferior quedo oculta hasta volver a expandirla.");
  }, [pushDebugEvent]);

  const showTerminal = React.useCallback(() => {
    setTerminalVisible(true);
    pushDebugEvent("success", "panel.visibility", "Bottom panel expanded", `Vista activa restaurada: ${activeTerminalTab}.`);
  }, [activeTerminalTab, pushDebugEvent]);

  if (!activeDocument) {
    return null;
  }

  const activeDocumentBadge = getLanguageBadge(activeDocument.language);

  return (
    <div className="ide-workspace overflow-hidden">
      <motion.div
        initial={prefersReducedMotion ? undefined : { opacity: 0 }}
        animate={prefersReducedMotion ? undefined : { opacity: 1 }}
        transition={prefersReducedMotion ? undefined : { duration: 0.24 }}
        className="flex h-full flex-col overflow-hidden"
      >
        <header className="ide-menubar">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={onReturnToMain}
              className="inline-flex cursor-pointer items-center gap-1.5 text-sm text-[var(--ide-muted)] transition-colors duration-150 hover:text-[var(--ide-text)]"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back</span>
            </button>

            <div className="hidden items-center gap-5 md:flex">
              {menuItems.map((item) => (
                <button
                  key={item}
                  type="button"
                  className="cursor-pointer text-sm text-[var(--ide-muted)] transition-colors duration-150 hover:text-[var(--ide-text)]"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="hidden truncate px-4 text-sm text-[var(--ide-muted)] md:block">
            IDE Workspace Portfolio Concept
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => setMobileOverlay("explorer")}
              className={cn(
                "inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded border border-transparent text-[var(--ide-muted)] transition-colors duration-150 hover:border-[var(--ide-border)] hover:text-[var(--ide-text)] lg:hidden",
                mobileOverlay === "explorer" && "border-[var(--ide-border)] bg-[var(--ide-hover)] text-[var(--ide-text)]"
              )}
              aria-label="Abrir explorer"
            >
              <Files className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setMobileOverlay("terminal")}
              className={cn(
                "inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded border border-transparent text-[var(--ide-muted)] transition-colors duration-150 hover:border-[var(--ide-border)] hover:text-[var(--ide-text)] lg:hidden",
                mobileOverlay === "terminal" && "border-[var(--ide-border)] bg-[var(--ide-hover)] text-[var(--ide-text)]"
              )}
              aria-label="Abrir terminal"
            >
              <TerminalSquare className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={toggleDarkMode}
              className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded border border-transparent text-[var(--ide-muted)] transition-colors duration-150 hover:border-[var(--ide-border)] hover:text-[var(--ide-text)]"
              aria-label="Cambiar tema"
            >
              {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <div className="hidden items-center gap-2 sm:flex">
              <span className="ide-window-dot" />
              <span className="ide-window-dot" />
              <span className="ide-window-dot" />
            </div>
          </div>
        </header>

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleTabDragEnd}>
          <div className="flex min-h-0 flex-1 overflow-hidden">
          <aside className="hidden w-14 shrink-0 border-r border-[var(--ide-border)] bg-[var(--ide-activity-bar)] lg:flex lg:flex-col lg:items-center lg:justify-between lg:py-3">
            <div className="flex flex-col gap-1.5">
              {activityButtons.map((button, index) => {
                const Icon = button.icon;
                const active = index === 0;

                return (
                  <button
                    key={button.id}
                    type="button"
                    className={cn(
                      "ide-activity-button relative inline-flex h-12 w-12 cursor-pointer items-center justify-center text-[var(--ide-muted)] transition-colors duration-150 hover:text-[var(--ide-text)]",
                      active && "text-[var(--ide-active)]"
                    )}
                    aria-label={button.label}
                    title={button.label}
                  >
                    {active ? <span className="absolute left-0 top-2 bottom-2 w-[2px] bg-[var(--ide-active)]" /> : null}
                    <Icon className="h-5 w-5" />
                    {button.id === "git" ? (
                      <span className="absolute right-2 top-2 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--ide-accent-soft)] px-1 text-[10px] font-bold text-[var(--ide-active)]">
                        3
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>

            <div className="flex flex-col gap-1.5">
              <button
                type="button"
                className="inline-flex h-12 w-12 cursor-pointer items-center justify-center text-[var(--ide-muted)] transition-colors duration-150 hover:text-[var(--ide-text)]"
                aria-label="Cuenta"
              >
                <User className="h-5 w-5" />
              </button>
              <button
                type="button"
                className="inline-flex h-12 w-12 cursor-pointer items-center justify-center text-[var(--ide-muted)] transition-colors duration-150 hover:text-[var(--ide-text)]"
                aria-label="Ajustes"
              >
                <Settings className="h-5 w-5" />
              </button>
            </div>
          </aside>

          <aside className="hidden w-[310px] shrink-0 border-r border-[var(--ide-border)] bg-[var(--ide-sidebar)] lg:flex lg:min-h-0 lg:flex-col">
            <div className="flex items-center justify-between px-6 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--ide-muted)]">
                Explorer
              </p>
              <button
                type="button"
                className="cursor-pointer text-[var(--ide-muted)] transition-colors duration-150 hover:text-[var(--ide-text)]"
                aria-label="Opciones del explorer"
              >
                ...
              </button>
            </div>

            <div className="ide-scrollbar min-h-0 flex-1 overflow-y-auto pb-4">
              <div className="px-4">
                <div className="mb-2 flex items-center gap-2 px-3 text-[12px] font-semibold text-[var(--ide-text)]">
                  <ChevronDown className="h-4 w-4 text-[var(--ide-muted)]" />
                  PORTFOLIO
                </div>
                {rootDocuments.map((document) => (
                  <ExplorerItem
                    key={document.id}
                    document={document}
                    active={activeDocument.id === document.id}
                    onOpen={openDocument}
                  />
                ))}

                <button
                  type="button"
                  onClick={() => setWorkspaceOpen((current) => !current)}
                  className="mt-3 flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left text-[12px] font-semibold text-[var(--ide-muted)] transition-colors duration-150 hover:text-[var(--ide-text)]"
                >
                  {workspaceOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  workspace
                </button>
                {workspaceOpen ? (
                  <div className="pl-4">
                    {workspaceDocuments.map((document) => (
                      <ExplorerItem
                        key={document.id}
                        document={document}
                        active={activeDocument.id === document.id}
                        onOpen={openDocument}
                      />
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          </aside>

          <main className="flex min-w-0 min-h-0 flex-1 flex-col overflow-hidden bg-[var(--ide-editor-bg)]">
              <SortableContext items={openDocumentDragIds} strategy={horizontalListSortingStrategy}>
                <div
                  ref={setTabsDropzoneRef}
                  className={cn(
                    "ide-scrollbar flex items-end overflow-x-auto border-b border-[var(--ide-border)] bg-[var(--ide-tabs-bg)] transition-colors duration-150",
                    isTabsDropzoneOver && "bg-[var(--ide-hover)]"
                  )}
                >
                  {openDocuments.map((document) => (
                    <SortableTab
                      key={document.id}
                      document={document}
                      active={activeDocument.id === document.id}
                      canClose={openDocuments.length > 1}
                      onSelect={setActiveDocumentId}
                      onClose={closeDocument}
                    />
                  ))}
                </div>
              </SortableContext>

            <div className="ide-scrollbar overflow-x-auto border-b border-[var(--ide-border)] bg-[var(--ide-breadcrumb-bg)] px-3 py-2 text-[12px] text-[var(--ide-muted)] sm:px-6 sm:py-3 sm:text-[13px]">
              {activeDocument.path.map((part, index) => (
                <React.Fragment key={`${part}-${index}`}>
                  <span className={index === activeDocument.path.length - 1 ? "text-[var(--ide-text)]" : undefined}>
                    {part}
                  </span>
                  {index < activeDocument.path.length - 1 ? " > " : null}
                </React.Fragment>
              ))}
            </div>

            {isCompactViewport ? (
              <div className="flex items-center justify-between gap-3 border-b border-[var(--ide-border)] bg-[var(--ide-tabs-bg)] px-3 py-2 lg:hidden">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-sm text-[8px] font-bold uppercase tracking-[0.08em]",
                        activeDocumentBadge.className
                      )}
                    >
                      {activeDocumentBadge.label}
                    </span>
                    <p className="truncate text-[13px] font-medium text-[var(--ide-text)]">
                      {activeDocument.filename}
                    </p>
                  </div>
                  <p className="truncate text-[11px] text-[var(--ide-muted)]">
                    {openDocuments.length} tabs abiertas
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setMobileOverlay("explorer")}
                    className={cn(
                      "inline-flex h-9 cursor-pointer items-center gap-2 rounded-md border border-[var(--ide-border)] px-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--ide-muted)] transition-colors duration-150 hover:bg-[var(--ide-hover)] hover:text-[var(--ide-text)]",
                      mobileOverlay === "explorer" && "bg-[var(--ide-hover)] text-[var(--ide-text)]"
                    )}
                  >
                    <Files className="h-3.5 w-3.5" />
                    Explorer
                  </button>
                  <button
                    type="button"
                    onClick={() => setMobileOverlay("terminal")}
                    className={cn(
                      "inline-flex h-9 cursor-pointer items-center gap-2 rounded-md border border-[var(--ide-border)] px-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--ide-muted)] transition-colors duration-150 hover:bg-[var(--ide-hover)] hover:text-[var(--ide-text)]",
                      mobileOverlay === "terminal" && "bg-[var(--ide-hover)] text-[var(--ide-text)]"
                    )}
                  >
                    <TerminalSquare className="h-3.5 w-3.5" />
                    Terminal
                  </button>
                </div>
              </div>
            ) : null}

            <div className="ide-scrollbar flex-1 overflow-auto bg-[var(--ide-editor)]">
              <div className="min-w-[32rem] py-4 sm:min-w-[38rem] sm:py-5 lg:min-w-[45rem] lg:py-6">
                {activeDocument.lines.map((line, index) => (
                  <React.Fragment key={`${activeDocument.id}-${index}`}>
                    {renderHighlightedLine(line, index + 1)}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {isCompactViewport ? (
              <button
                type="button"
                onClick={() => setMobileOverlay("terminal")}
                className="flex h-11 cursor-pointer items-center gap-2 border-t border-[var(--ide-border)] px-3 text-[12px] uppercase tracking-[0.08em] text-[var(--ide-muted)] transition-colors duration-150 hover:bg-[var(--ide-hover)] hover:text-[var(--ide-text)] sm:px-6 sm:text-[13px] lg:hidden"
              >
                <TerminalSquare className="h-4 w-4" />
                Open terminal
              </button>
            ) : (
              <AnimatePresence initial={false}>
                {terminalVisible ? (
                  <motion.div
                    initial={prefersReducedMotion ? undefined : { height: 0, opacity: 0 }}
                    animate={prefersReducedMotion ? undefined : { height: "auto", opacity: 1 }}
                    exit={prefersReducedMotion ? undefined : { height: 0, opacity: 0 }}
                    className="border-t border-[var(--ide-border)] bg-[var(--ide-terminal-shell)]"
                  >
                    <div className="ide-scrollbar flex items-center gap-6 overflow-x-auto border-b border-[var(--ide-border)] px-6 py-2">
                      {terminalTabs.map((tab) => (
                        <TerminalTabButton
                          key={tab}
                          tab={tab}
                          active={tab === activeTerminalTab}
                          badge={terminalTabBadges[tab]}
                          onSelect={selectTerminalTab}
                        />
                      ))}
                      <button
                        type="button"
                        onClick={hideTerminal}
                        className="ml-auto inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-sm text-[var(--ide-muted)] transition-colors duration-150 hover:bg-[var(--ide-hover)] hover:text-[var(--ide-text)]"
                        aria-label="Ocultar terminal"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    {activeTerminalTab === "TERMINAL" ? (
                      <InteractiveTerminal
                        className="!w-full !rounded-none !border-0 !bg-transparent !shadow-none"
                        outputClassName="h-44 border-b border-[var(--ide-border)] bg-transparent px-6 py-4 text-[13px]"
                        inputClassName="px-6 py-3"
                        promptClassName="text-[var(--ide-terminal-prompt)]"
                        shellLabel="rommelsoriano@portfolio:~"
                        initialLines={terminalInitialLines}
                        projects={visibleProjects}
                        hideHeader
                      />
                    ) : (
                      <div className="ide-scrollbar h-[18rem] overflow-auto px-6 py-4">
                        {auxiliaryPanelContent}
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <button
                    type="button"
                    onClick={showTerminal}
                    className="flex h-11 cursor-pointer items-center gap-2 border-t border-[var(--ide-border)] px-6 text-[13px] text-[var(--ide-muted)] transition-colors duration-150 hover:bg-[var(--ide-hover)] hover:text-[var(--ide-text)]"
                  >
                    <TerminalSquare className="h-4 w-4" />
                    Show terminal
                  </button>
                )}
              </AnimatePresence>
            )}
          </main>
          </div>
        </DndContext>

        <footer className="ide-statusbar ide-scrollbar overflow-x-auto">
          <div className="flex flex-nowrap items-center gap-3 whitespace-nowrap sm:gap-6">
            <span>main*</span>
            <span className="max-w-[130px] truncate sm:max-w-none">{activeDocument.filename}</span>
            <span className="hidden sm:inline">{darkMode ? "Dark" : "Light"} Theme</span>
          </div>
          <div className="flex flex-nowrap items-center gap-3 whitespace-nowrap sm:gap-6">
            <span className="hidden sm:inline">UTF-8</span>
            <span className="hidden sm:inline">LF</span>
            <span>{activeDocument.language.toUpperCase()}</span>
          </div>
        </footer>
      </motion.div>

      <AnimatePresence>
        {mobileOverlay === "explorer" ? (
          <motion.div
            initial={prefersReducedMotion ? undefined : { opacity: 0 }}
            animate={prefersReducedMotion ? undefined : { opacity: 1 }}
            exit={prefersReducedMotion ? undefined : { opacity: 0 }}
            className="fixed inset-0 z-[110] bg-[rgba(15,23,42,0.56)] lg:hidden"
          >
            <button
              type="button"
              onClick={() => setMobileOverlay(null)}
              className="absolute inset-0 cursor-pointer"
              aria-label="Cerrar explorer"
            />
            <motion.div
              initial={prefersReducedMotion ? undefined : { x: -20, opacity: 0 }}
              animate={prefersReducedMotion ? undefined : { x: 0, opacity: 1 }}
              exit={prefersReducedMotion ? undefined : { x: -20, opacity: 0 }}
              className="relative h-full w-[320px] max-w-[86vw] border-r border-[var(--ide-border)] bg-[var(--ide-sidebar)]"
            >
              <div className="flex items-center justify-between px-5 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--ide-muted)]">
                  Explorer
                </p>
                <button
                  type="button"
                  onClick={() => setMobileOverlay(null)}
                  className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded border border-transparent text-[var(--ide-muted)] transition-colors duration-150 hover:border-[var(--ide-border)] hover:text-[var(--ide-text)]"
                  aria-label="Cerrar explorer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="ide-scrollbar overflow-y-auto pb-4">
                <div className="px-4">
                  <div className="mb-2 flex items-center gap-2 px-3 text-[12px] font-semibold text-[var(--ide-text)]">
                    <ChevronDown className="h-4 w-4 text-[var(--ide-muted)]" />
                    PORTFOLIO
                  </div>
                  {rootDocuments.map((document) => (
                    <ExplorerItem
                      key={document.id}
                      document={document}
                      active={activeDocument.id === document.id}
                      onOpen={openDocument}
                    />
                  ))}
                  <button
                    type="button"
                    onClick={() => setWorkspaceOpen((current) => !current)}
                    className="mt-3 flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left text-[12px] font-semibold text-[var(--ide-muted)] transition-colors duration-150 hover:text-[var(--ide-text)]"
                  >
                    {workspaceOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    workspace
                  </button>
                  {workspaceOpen ? (
                    <div className="pl-4">
                      {workspaceDocuments.map((document) => (
                        <ExplorerItem
                          key={document.id}
                          document={document}
                          active={activeDocument.id === document.id}
                          onOpen={openDocument}
                        />
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
        {mobileOverlay === "terminal" && isCompactViewport ? (
          <motion.div
            initial={prefersReducedMotion ? undefined : { opacity: 0 }}
            animate={prefersReducedMotion ? undefined : { opacity: 1 }}
            exit={prefersReducedMotion ? undefined : { opacity: 0 }}
            className="fixed inset-0 z-[110] bg-[rgba(15,23,42,0.64)] lg:hidden"
          >
            <button
              type="button"
              onClick={() => setMobileOverlay(null)}
              className="absolute inset-0 cursor-pointer"
              aria-label="Cerrar terminal"
            />
            <motion.div
              initial={prefersReducedMotion ? undefined : { y: 24, opacity: 0 }}
              animate={prefersReducedMotion ? undefined : { y: 0, opacity: 1 }}
              exit={prefersReducedMotion ? undefined : { y: 24, opacity: 0 }}
              className="absolute inset-x-0 bottom-0 flex h-[min(76vh,42rem)] flex-col overflow-hidden rounded-t-[28px] border-t border-[var(--ide-border)] bg-[var(--ide-terminal-shell)] shadow-[0_-24px_80px_rgba(15,23,42,0.36)]"
            >
              <div className="flex items-center justify-between border-b border-[var(--ide-border)] px-4 py-4">
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--ide-muted)]">
                    {activeTerminalTab}
                  </p>
                  <p className="truncate text-[13px] text-[var(--ide-text)]">
                    {activeTerminalTab === "TERMINAL"
                      ? `Shell activa para ${activeDocument.filename}`
                      : `Vista ${activeTerminalTab.toLowerCase()} para ${activeDocument.filename}`}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileOverlay(null)}
                  className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded border border-transparent text-[var(--ide-muted)] transition-colors duration-150 hover:border-[var(--ide-border)] hover:text-[var(--ide-text)]"
                  aria-label="Cerrar terminal"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="ide-scrollbar flex items-center gap-4 overflow-x-auto border-b border-[var(--ide-border)] px-4 py-2">
                {terminalTabs.map((tab) => (
                  <TerminalTabButton
                    key={tab}
                    tab={tab}
                    active={tab === activeTerminalTab}
                    badge={terminalTabBadges[tab]}
                    compact
                    onSelect={selectTerminalTab}
                  />
                ))}
              </div>

              {activeTerminalTab === "TERMINAL" ? (
                <InteractiveTerminal
                  className="!h-full !w-full !rounded-none !border-0 !bg-transparent !shadow-none flex min-h-0 flex-1 flex-col"
                  outputClassName="!h-auto min-h-0 flex-1 border-b border-[var(--ide-border)] bg-transparent px-4 py-4 text-[12px]"
                  inputClassName="px-4 py-3 text-[13px]"
                  promptClassName="text-[var(--ide-terminal-prompt)]"
                  shellLabel="rommelsoriano@portfolio:~"
                  initialLines={terminalInitialLines}
                  projects={visibleProjects}
                  hideHeader
                />
              ) : (
                <div className="ide-scrollbar min-h-0 flex-1 overflow-auto px-4 py-4">
                  {auxiliaryPanelContent}
                </div>
              )}
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

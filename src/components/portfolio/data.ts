import {
  Code2,
  Cpu,
  Database,
  Github,
  Globe,
  Linkedin,
  Mail,
  Rocket,
  Server,
} from "lucide-react";
import type {
  ContactChannel,
  ExperienceItem,
  FocusArea,
  MetricItem,
  NavItem,
  ProjectItem,
  ServiceItem,
  SkillCategory,
} from "@/components/portfolio/types";

export const navItems: NavItem[] = [
  { label: "Sobre mí", href: "#sobre-mi" },
  { label: "Proyectos", href: "#proyectos" },
  { label: "Experiencia", href: "#experiencia" },
  { label: "Habilidades", href: "#habilidades" },
  { label: "Contacto", href: "#contacto" },
];

export const heroTags = [
  "Full-Stack Engineering",
  "Datos & IA aplicada",
  "Arquitecturas de microservicios",
];

export const impactMetrics: MetricItem[] = [
  { label: "Años construyendo software", value: "4+" },
  { label: "Stacks de producción", value: "12+" },
  { label: "Países objetivo de clientes", value: "LatAm + US" },
  { label: "Interés principal", value: "Sistemas escalables" },
];

export const focusAreas: FocusArea[] = [
  {
    title: "Backend Moderno",
    description:
      "Desarrollo de APIs robustas y sistemas backend escalables usando Laravel y NestJS, con arquitecturas limpias y principios SOLID.",
    capabilities: ["Laravel", "NestJS", "Microservicios", "APIs REST"],
  },
  {
    title: "Frontend Avanzado",
    description:
      "Creación de interfaces de usuario modernas y performantes con React.js, Next.js, Vue.js y frameworks CSS como Tailwind y Vuetify.",
    capabilities: ["React.js", "Next.js", "Vue.js", "Tailwind CSS", "Vuetify"],
  },
  {
    title: "Infraestructura Cloud",
    description:
      "Despliegue y gestión de aplicaciones en la nube con Docker, Kubernetes y proveedores como AWS, Google Cloud y Azure.",
    capabilities: ["Docker", "Kubernetes", "AWS", "Google Cloud", "Azure"],
  },
];

export const serviceItems: ServiceItem[] = [
  {
    title: "Desarrollo Full-Stack",
    description:
      "Aplicaciones web completas desde backend con Laravel/NestJS hasta frontend con React.js/Next.js/Vue.js, siguiendo mejores prácticas y arquitecturas escalables.",
    deliverables: [
      "Backend con Laravel/NestJS",
      "Frontend con React/Next.js/Vue",
      "APIs REST",
    ],
  },
  {
    title: "Arquitectura Cloud",
    description:
      "Diseño e implementación de infraestructura en la nube con Docker, Kubernetes y proveedores como AWS, Google Cloud y Azure.",
    deliverables: [
      "Contenedores Docker",
      "Orquestación Kubernetes",
      "CI/CD pipelines",
    ],
  },
  {
    title: "Migración y Modernización",
    description:
      "Actualización de sistemas legacy a arquitecturas modernas, microservicios y mejores prácticas de desarrollo.",
    deliverables: ["Refactorización de código", "Migración a microservicios", "Optimización de performance"],
  },
  {
    title: "Consultoría Técnica",
    description:
      "Asesoramiento en arquitectura de software, selección de tecnologías y estrategias de desarrollo para equipos y proyectos.",
    deliverables: ["Code Reviews", "Arquitectura de sistemas", "Planificación técnica"],
  },
];

export const projects: ProjectItem[] = [
  {
    title: "Event Resilience System",
    description:
      "Sistema de procesamiento de eventos resiliente construido con TypeScript, RabbitMQ y PostgreSQL. Implementa principios SOLID, arquitectura limpia y manejo robusto de errores.",
    tags: ["TypeScript", "RabbitMQ", "PostgreSQL", "SOLID", "Clean Architecture"],
    codeUrl: "https://github.com/rolmen26/event-resilience",
    impact: "Sistema escalable para procesamiento asíncrono de eventos con alta disponibilidad y tolerancia a fallos.",
    icon: Server,
  },
  {
    title: "Discord Bot",
    description:
      "Bot de Discord multifuncional desarrollado en Python con integración de APIs externas, comandos personalizados y sistema de moderación.",
    tags: ["Python", "Discord API", "Docker", "Automation", "Bot Development"],
    codeUrl: "https://github.com/rolmen26/discord-bot",
    impact: "Automatización de tareas en comunidades Discord y mejora en la interacción con usuarios.",
    icon: Code2,
  },
];

export const universityEasterProject: ProjectItem = {
  title: "Dados Python App",
  description:
    "Aplicación de análisis de datos desarrollada en Python durante mis estudios universitarios. Incluye procesamiento de datasets, visualizaciones y análisis estadístico.",
  tags: ["Python", "Data Analysis", "Pandas", "Visualization", "Academic Project"],
  codeUrl: "https://github.com/rolmen26/dados-python-app",
  impact:
    "Proyecto académico que demuestra habilidades en análisis de datos, programación científica y visualización de información.",
  icon: Database,
  isEasterEgg: true,
  actionLabel: "Ver en GitHub",
};

export const experiences: ExperienceItem[] = [
  {
    role: "Desarrollador de Software Full-Stack",
    company: "FUNIBER · Guayaquil, Ecuador",
    period: "Octubre 2022 - Presente",
    bullets: [
      "Colaboré estrechamente con las partes interesadas a lo largo de todo el ciclo de vida del desarrollo para validar propuestas creativas, aplicar las mejores prácticas de UX/UI y garantizar que las soluciones se ajustaran a las necesidades de los usuarios, lo que se tradujo en una mejora significativa de los resultados del proyecto y de la satisfacción de los usuarios.",
      "Diseñé y desarrollé microservicios escalables utilizando Laravel y Node.js, junto con tecnologías front-end modernas como React y Vue.js, siguiendo los principios del Diseño Orientado al Dominio (DDD) para garantizar arquitecturas mantenibles y alineadas con el negocio.",
      "Contribuí a la migración y modernización de aplicaciones heredadas de PHP 5.6 mediante la refactorización del código, la descomposición modular y la adopción de arquitecturas modernas y escalables.",
      "Planifiqué y ejecuté arquitecturas orientadas a microservicios con comunicación entre sistemas, incluyendo la integración y orquestación de RabbitMQ para la mensajería asincrónica entre servicios."
    ],
  },
  {
    role: "Pasante desarrollador",
    company: "SIPECOM S.A. · Guayaquil, Ecuador",
    period: "Mayo 2022 - Octubre 2022",
    bullets: [
      "Diseñé e implementé funciones de back-end utilizando PHP y Spring Boot, lo que permitió un procesamiento de datos fluido y el correcto funcionamiento de la aplicación.",
      "Documenté flujos de trabajo técnicos y bases de conocimiento para la capacitación de los empleados, lo que mejoró la incorporación de nuevos miembros al equipo y el intercambio de conocimientos.",
      "Desarrollé funciones orientadas al usuario con HTML, CSS y JavaScript para aplicaciones de escritorio, mejorando la interactividad y el rendimiento.",
    ],
  }
];

export const skillCategories: SkillCategory[] = [
  {
    id: "backend",
    label: "Backend",
    title: "Desarrollo Backend",
    summary: "APIs, lógica de negocio y sistemas server-side robustos.",
    icon: Server,
    items: [
      "Laravel",
      "NestJS",
      "PHP",
      "Node.js",
      "MySQL/PostgreSQL",
      "APIs REST",
      "Microservicios",
      "Message Queues",
    ],
  },
  {
    id: "frontend",
    label: "Frontend",
    title: "Desarrollo Frontend",
    summary: "Interfaces de usuario modernas, responsivas y performantes.",
    icon: Globe,
    items: [
      "React.js",
      "Next.js",
      "Vue.js",
      "TypeScript",
      "Tailwind CSS",
      "Vuetify",
      "State Management",
      "Web Performance",
    ],
  },
  {
    id: "infra",
    label: "Infra & Cloud",
    title: "Infraestructura & Cloud",
    summary: "Despliegue, escalabilidad y gestión en la nube.",
    icon: Code2,
    items: [
      "Docker",
      "Kubernetes",
      "AWS",
      "Google Cloud",
      "Azure",
      "CI/CD",
      "Linux",
      "Nginx",
    ],
  },
  {
    id: "ai-tools",
    label: "IA & Herramientas",
    title: "IA & Herramientas de Desarrollo",
    summary: "Herramientas de IA y flujo de desarrollo moderno.",
    icon: Cpu,
    items: [
      "Claude",
      "GitHub Copilot",
      "Codex",
      "Git",
      "VS Code",
      "Testing",
      "Agile/Scrum",
      "SOLID Principles",
    ],
  },
];

export const contactChannels: ContactChannel[] = [
  {
    label: "GitHub",
    value: "github.com/rolmen26",
    href: "https://github.com/rolmen26",
    icon: Github,
  },
  {
    label: "LinkedIn",
    value: "linkedin.com/in/rommel-sorianog",
    href: "https://www.linkedin.com/in/rommel-sorianog",
    icon: Linkedin,
  },
  {
    label: "Email",
    value: "rommelsoriano454@gmail.com",
    href: "mailto:rommelsoriano454@gmail.com",
    icon: Mail,
  },
];

export const profile = {
  name: "Rommel Sebastián Soriano García",
  headline: "Full Stack Developer",
  intro:
    "Full Stack Developer especializado en Laravel y NestJS para backend, y React.js/Next.js/Vue.js para frontend. Experto en infraestructura cloud con Docker, Kubernetes y múltiples proveedores (AWS, GCP, Azure). Apasionado por crear soluciones escalables y de alto rendimiento.",
  location: "Guayaquil, Ecuador",
  phone: "+593 98 341 9244",
  availability: "Disponible para proyectos y posiciones remotas.",
  social: {
    github: "https://github.com/rolmen26",
    linkedin: "https://www.linkedin.com/in/rommel-sorianog",
    email: "mailto:rommelsoriano454@gmail.com",
  },
  cvUrl: "/cv-rommel-soriano.pdf",
};

export const sectionIcons = {
  about: Code2,
  services: Globe,
  projects: Rocket,
  experience: Server,
  skills: Cpu,
  contact: Mail,
  cv: Database,
};

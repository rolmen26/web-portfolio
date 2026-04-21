import * as React from "react";
import { MessageCircle, Send, MapPin, Phone } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SectionBlock } from "@/components/portfolio/ui/SectionBlock";
import type { ContactChannel } from "@/components/portfolio/types";
import { cn } from "@/lib/utils";
import RotatingEarth from "@/components/ui/wireframe-dotted-globe";

interface ContactSectionProps {
  icon: LucideIcon;
  channels: ContactChannel[];
  location: string;
  phone: string;
}

export function ContactSection({
  icon,
  channels,
  location,
  phone,
}: ContactSectionProps) {
  const onSubmit = React.useCallback((event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("nombre") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const message = String(formData.get("mensaje") ?? "").trim();

    const text = `Hola Rommel, soy ${name}.\nEmail: ${email}\n\nContexto del proyecto:\n${message}`;
    const whatsappUrl = `https://wa.me/593983419244?text=${encodeURIComponent(text)}`;

    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  }, []);

  return (
    <SectionBlock
      id="contacto"
      title="Let's Connect"
      description="Si tienes una vacante, propuesta o proyecto, compárteme objetivos y contexto. Podemos continuar por WhatsApp o por correo."
      icon={icon}
    >
      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <Card className="portfolio-card rounded-3xl border-2 border-secondary bg-background/50 hover:border-primary/50 transition-colors">
          <CardHeader className="p-6 md:p-8">
            <CardTitle className="font-display text-4xl font-bold tracking-tight text-foreground">Cuéntame tu reto</CardTitle>
            <p className="text-base text-foreground/70 font-medium pt-2">
              Respondo rápido con una propuesta de enfoque técnico y próximos pasos.
            </p>
          </CardHeader>
          <CardContent className="px-6 pb-6 md:px-8 md:pb-8">
            <form className="space-y-6" onSubmit={onSubmit}>
              <div className="space-y-4">
                <Input
                  name="nombre"
                  placeholder="Nombre"
                  required
                  className="h-14 rounded-2xl border-2 border-secondary bg-secondary/20 focus-visible:ring-primary focus-visible:ring-offset-0 focus-visible:border-primary px-4 text-base transition-colors"
                />
                <Input
                  name="email"
                  type="email"
                  placeholder="Correo electrónico"
                  required
                  className="h-14 rounded-2xl border-2 border-secondary bg-secondary/20 focus-visible:ring-primary focus-visible:ring-offset-0 focus-visible:border-primary px-4 text-base transition-colors"
                />
                <Textarea
                  name="mensaje"
                  placeholder="Describe tu proyecto, objetivos y tiempos"
                  rows={6}
                  required
                  className="rounded-2xl border-2 border-secondary bg-secondary/20 focus-visible:ring-primary focus-visible:ring-offset-0 focus-visible:border-primary p-4 text-base transition-colors resize-none"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <Button type="submit" className="rounded-2xl h-14 bg-primary hover:bg-primary/90 text-background font-bold text-lg px-8 flex-1 group shadow-[0_0_20px_rgba(136,57,239,0.15)] hover:shadow-[0_0_30px_rgba(136,57,239,0.3)] transition-all">
                  <MessageCircle className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                  WhatsApp Directo
                </Button>
                <a
                  href="mailto:3lihan.m.c@gmail.com"
                  className={cn(buttonVariants({ variant: "outline" }), "rounded-2xl h-14 border-2 border-secondary hover:border-primary hover:bg-secondary/30 font-bold text-lg px-8 flex-1 justify-center transition-all")}
                >
                  <Send className="mr-2 h-5 w-5" />
                  Email
                </a>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-6 flex flex-col">
          <Card className="portfolio-card rounded-3xl border-2 border-secondary bg-primary/10 hover:bg-primary/20 transition-colors flex-1 flex flex-col justify-center p-6 md:p-8">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="font-display text-3xl font-bold tracking-tight">Canales oficiales</CardTitle>
            </CardHeader>
            <CardContent className="px-0 pb-0 space-y-4 text-sm text-foreground">
              {channels.map((channel) => {
                const ChannelIcon = channel.icon;
                return (
                  <a
                    key={channel.label}
                    href={channel.href}
                    target={channel.href.startsWith("http") ? "_blank" : undefined}
                    rel={channel.href.startsWith("http") ? "noopener noreferrer" : undefined}
                    className="group flex flex-row items-center gap-4 rounded-2xl border-2 border-primary/20 bg-background/50 p-4 transition-all hover:-translate-y-1 hover:border-primary hover:shadow-[0_0_20px_rgba(136,57,239,0.2)]"
                  >
                    <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-background group-hover:rotate-12 transition-transform duration-300">
                      <ChannelIcon className="h-6 w-6" />
                    </span>
                    <span className="flex flex-col">
                      <span className="text-xs uppercase tracking-[0.15em] font-bold text-primary">
                        {channel.label}
                      </span>
                      <span className="text-base font-medium font-mono">{channel.value}</span>
                    </span>
                  </a>
                );
              })}
            </CardContent>
          </Card>

          <Card className="portfolio-card rounded-3xl border-2 border-secondary bg-background/50 overflow-hidden p-0">
            <div className="flex flex-row items-center gap-4 p-6">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <MapPin className="h-5 w-5 text-primary" />
                  <CardTitle className="font-display text-xl font-bold">Ubicación Global</CardTitle>
                </div>
                <p className="font-mono text-sm text-foreground/70 mb-2">{location}</p>
                <p className="font-mono text-sm text-foreground/70 flex items-center gap-1.5">
                  <Phone className="h-4 w-4" />
                  {phone}
                </p>
              </div>
              <div className="w-[180px] h-[180px] flex-shrink-0">
                <RotatingEarth width={180} height={180} className="w-full h-full" />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </SectionBlock>
  );
}

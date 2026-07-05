import { Link, useLocation } from "react-router-dom";
import { Home, ArrowLeft, Terminal } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const monoStyle = { fontFamily: 'var(--font-mono)' };

interface NotFoundProps {
  readonly onReturnToMain?: () => void;
}

export function NotFound({ onReturnToMain }: NotFoundProps) {
  const location = useLocation();
  const requestedPath = `${location.pathname}${location.search}`;
  const displayPath =
    requestedPath.length > 60 ? `${requestedPath.slice(0, 57)}...` : requestedPath;
  const homeLinkClass = cn(
    buttonVariants({ size: "lg" }),
    "gap-2 cursor-pointer transition-transform hover:-translate-y-0.5"
  );
  const ghostLinkClass = cn(
    buttonVariants({ size: "lg", variant: "outline" }),
    "gap-2 cursor-pointer transition-colors"
  );

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-5 py-12 text-foreground">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 left-1/2 h-72 w-[36rem] -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -bottom-24 left-1/2 h-72 w-[36rem] -translate-x-1/2 rounded-full bg-accent/15 blur-3xl" />
      </div>

      <section className="relative z-10 mx-auto w-full max-w-xl text-center">
        <span
          style={monoStyle}
          className="inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-3.5 py-1.5 text-xs uppercase tracking-wider text-accent"
        >
          <span className="h-2 w-2 animate-pulse rounded-full bg-destructive" />
          <span>HTTP 404 · NOT_FOUND</span>
        </span>

        <h1 className="font-display mt-7 bg-gradient-to-br from-primary via-accent to-destructive bg-clip-text text-[clamp(5rem,22vw,10rem)] font-extrabold leading-none tracking-tighter text-transparent">
          404
        </h1>

        <h2 className="font-display mt-2 text-xl font-semibold sm:text-2xl">
          Esta ruta no existe
        </h2>

        <p className="mx-auto mt-3 max-w-md text-muted-foreground">
          La página que buscas se movió, fue renombrada o nunca existió.
          Aquí siempre hay un camino de vuelta a casa.
        </p>

        <div
          style={monoStyle}
          className="mx-auto mt-8 max-w-md rounded-xl border border-border bg-card p-4 text-left text-sm text-card-foreground shadow-xl backdrop-blur"
        >
          <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
            <Terminal className="h-3.5 w-3.5" aria-hidden="true" />
            <span>terminal</span>
          </div>
          <div className="space-y-1 leading-relaxed">
            <p className="break-all">
              <span className="text-accent">kevelmun@portfolio</span>
              <span className="text-muted-foreground">:</span>
              <span className="text-primary">~</span>
              <span className="text-muted-foreground">$ curl -I {displayPath}</span>
            </p>
            <p className="text-destructive">HTTP/1.1 404 Not Found</p>
            <p className="text-muted-foreground">
              # La página solicitada no fue encontrada en el servidor.
            </p>
            <p className="flex items-center">
              <span className="text-accent">kevelmun@portfolio</span>
              <span className="text-muted-foreground">:</span>
              <span className="text-primary">~</span>
              <span className="text-muted-foreground">$</span>
              <span className="ml-1.5 inline-block h-[1.1em] w-[0.55em] animate-pulse bg-accent" />
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {onReturnToMain ? (
            <Button
              onClick={onReturnToMain}
              size="lg"
              className="gap-2 cursor-pointer transition-transform hover:-translate-y-0.5"
            >
              <Home className="h-4 w-4" aria-hidden="true" />
              Volver al inicio
            </Button>
          ) : (
            <Link to="/" className={homeLinkClass}>
              <Home className="h-4 w-4" aria-hidden="true" />
              Volver al inicio
            </Link>
          )}
          <Link to="/workspace" className={ghostLinkClass}>
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Ir al workspace
          </Link>
        </div>
      </section>
    </main>
  );
}

export default NotFound;

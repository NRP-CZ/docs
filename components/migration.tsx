import { Badge } from "@/components/badge";

interface MigrationHeaderProps {
  date: string;
  title: string;
  prHref?: string;
  versionBadge?: string;
  rdmVersion?: string;
}

function extractPRNumber(href: string): string | null {
  const match = href.match(/\/pull\/(\d+)/);
  return match?.[1] ?? null;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-');
}

export function MigrationHeader({
  date,
  title,
  prHref,
  versionBadge,
  rdmVersion = "v14",
}: MigrationHeaderProps) {
  const prNumber = prHref ? extractPRNumber(prHref) : null;
  const anchorId = `${date}-${slugify(title)}`;

  return (
    <div className="x:mb-4">
      <h2 id={anchorId} className="x:tracking-tight x:text-slate-900 x:dark:text-slate-100 x:font-semibold x:target:animate-[fade-in_1.5s] x:mt-10 x:border-b x:pb-1 x:text-3xl nextra-border">
        {date}: {title}
        <a href={`#${anchorId}`} className="x:focus-visible:nextra-focus subheading-anchor" aria-label="Permalink for this section"></a>
      </h2>
      <div className="x:flex x:flex-wrap x:gap-2">
        {prHref && prNumber && (
          <a href={prHref} target="_blank" rel="noopener noreferrer">
            <Badge variant="yellow">oarepo-ui PR #{prNumber}</Badge>
          </a>
        )}
        {versionBadge && <Badge variant="red">{versionBadge}</Badge>}
        <Badge variant="green">RDM {rdmVersion}</Badge>
      </div>
    </div>
  );
}

interface MigrationAffectedProps {
  children: React.ReactNode;
}

export function MigrationAffected({ children }: MigrationAffectedProps) {
  return <>{children}</>;
}

interface MigrationStepsProps {
  children: React.ReactNode;
}

export function MigrationSteps({ children }: MigrationStepsProps) {
  return (
    <details className="x:mt-4">
      <summary>Show migration steps</summary>
      <div className="x:pt-4">{children}</div>
    </details>
  );
}

export type SkipLinkProps = { label: string; targetId?: string };

export function SkipLink({ label, targetId = "main" }: SkipLinkProps) {
  return (
    <a
      href={`#${targetId}`}
      className="absolute left-2 top-2 z-50 -translate-y-16 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground shadow-lg transition-transform focus:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      {label}
    </a>
  );
}

interface SectionCardProps {
  title: string;
  icon?: string;
  children: React.ReactNode;
}

export function SectionCard({ title, icon, children }: SectionCardProps) {
  return (
    <div
      className="rounded-2xl p-5"
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(0,255,255,0.1)",
      }}
    >
      <h3 className="font-display font-semibold text-base text-foreground flex items-center gap-2 mb-4">
        {icon && <span>{icon}</span>}
        <span>{title}</span>
      </h3>
      {children}
    </div>
  );
}

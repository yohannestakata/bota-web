import React from "react";

interface SectionProps {
  title: string;
  id?: string;
  children: React.ReactNode;
  className?: string;
}

export default function Section({
  title,
  id,
  children,
  className,
}: SectionProps) {
  return (
    <section
      id={id}
      className={`border-border border-b py-12 ${className ?? ""}`.trim()}
    >
      <div className="text-foreground text-2xl font-medium">{title}</div>
      <div className="mt-6">{children}</div>
    </section>
  );
}

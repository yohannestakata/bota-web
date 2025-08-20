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
      <h2 className="text-foreground font-heading text-2xl font-bold">
        {title}
      </h2>
      <div className="mt-6">{children}</div>
    </section>
  );
}

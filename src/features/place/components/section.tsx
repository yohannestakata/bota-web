import React from "react";

interface SectionProps {
  title: string;
  id?: string;
  children: React.ReactNode;
  className?: string;
  titleAction?: React.ReactNode;
}

export default function Section({
  title,
  id,
  children,
  className,
  titleAction,
}: SectionProps) {
  return (
    <section
      id={id}
      className={`border-border border-b px-4 py-8 md:py-12 ${className ?? ""}`.trim()}
    >
      <div className="flex items-center justify-between">
        <h2 className="text-foreground font-heading text-xl font-bold md:text-2xl">
          {title}
        </h2>
        {titleAction}
      </div>
      <div className="mt-6">{children}</div>
    </section>
  );
}

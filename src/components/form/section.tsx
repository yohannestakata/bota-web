"use client";

import * as React from "react";
import * as Accordion from "@radix-ui/react-accordion";
import { ChevronDownIcon } from "lucide-react";
import { motion } from "framer-motion";

type SectionProps = {
  title: string;
  value: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
};

export function CollapsibleSection({
  title,
  value,
  children,
  defaultOpen,
}: SectionProps) {
  const [open, setOpen] = React.useState<boolean>(!!defaultOpen);
  return (
    <motion.div
      initial={false}
      animate={{ paddingTop: open ? 48 : 24, paddingBottom: open ? 48 : 24 }}
    >
      <Accordion.Root
        type="single"
        collapsible
        value={open ? value : undefined}
        onValueChange={(v) => setOpen(v === value)}
        className="divide-y"
      >
        <Accordion.Item value={value}>
          <Accordion.Header>
            <Accordion.Trigger className="flex w-full items-center text-left text-lg font-semibold">
              {title}
              <motion.span
                className="ml-2 inline-flex"
                initial={false}
                animate={{ rotate: open ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDownIcon size={24} />
              </motion.span>
            </Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content forceMount>
            <motion.div
              initial={false}
              animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              style={{ overflow: "hidden" }}
              className="pt-5"
            >
              <div className="space-y-4">{children}</div>
            </motion.div>
          </Accordion.Content>
        </Accordion.Item>
      </Accordion.Root>
    </motion.div>
  );
}

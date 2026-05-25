import { useId, useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";

interface AccordionItemProps {
  question: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
}

export function AccordionItem({ question, children, defaultOpen = false }: AccordionItemProps) {
  const [open, setOpen] = useState(defaultOpen);
  const contentId = useId();

  return (
    <div className="border-b border-ink-200">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={contentId}
        className="w-full flex items-center justify-between gap-4 py-4 text-left text-base font-medium text-ink-900 hover:text-brand-700 transition-colors focus:outline-none focus-visible:shadow-focus"
      >
        <span>{question}</span>
        <ChevronDown
          size={18}
          className={`shrink-0 text-ink-500 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      <div
        id={contentId}
        hidden={!open}
        className="pb-4 pr-8 text-sm text-ink-600 leading-relaxed"
      >
        {children}
      </div>
    </div>
  );
}

interface AccordionProps {
  children: ReactNode;
  className?: string;
}

export function Accordion({ children, className = "" }: AccordionProps) {
  return <div className={`border-t border-ink-200 ${className}`}>{children}</div>;
}

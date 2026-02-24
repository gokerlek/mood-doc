'use client';

import * as React from 'react';
import { Accordion as AccordionPrimitive } from '@base-ui/react/accordion';
import { IconChevronDown } from '@tabler/icons-react';
import { cn } from '@/lib/utils';

// Wrapper that maps shadcn-compatible props to base-ui Accordion.Root
interface AccordionRootProps extends Omit<AccordionPrimitive.Root.Props, 'multiple'> {
  /** shadcn compat: "single" | "multiple" */
  type?: 'single' | 'multiple';
  /** shadcn compat: allow collapsing open item */
  collapsible?: boolean;
  className?: string;
  children?: React.ReactNode;
}

function Accordion({ type, collapsible: _collapsible, ...props }: AccordionRootProps) {
  return (
    <AccordionPrimitive.Root
      multiple={type === 'multiple'}
      {...props}
    />
  );
}

function AccordionItem({
  className,
  ...props
}: AccordionPrimitive.Item.Props) {
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={cn('border-b', className)}
      {...props}
    />
  );
}

function AccordionTrigger({
  className,
  children,
  ...props
}: AccordionPrimitive.Trigger.Props) {
  return (
    <AccordionPrimitive.Header>
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          'flex flex-1 items-center justify-between py-4 text-sm font-medium transition-all hover:underline text-left w-full [&[data-panel-open]>svg]:rotate-180',
          className,
        )}
        {...props}
      >
        {children}
        <IconChevronDown
          size={16}
          strokeWidth={1.5}
          className="text-muted-foreground shrink-0 transition-transform duration-200"
        />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
}

function AccordionContent({
  className,
  children,
  ...props
}: AccordionPrimitive.Panel.Props) {
  return (
    <AccordionPrimitive.Panel
      data-slot="accordion-content"
      className={cn(
        'data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0 overflow-hidden text-sm',
        className,
      )}
      {...props}
    >
      <div className="pb-4 pt-0">{children}</div>
    </AccordionPrimitive.Panel>
  );
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };

'use client';
import { useKbStore } from '@/stores/kbStore';
import { emptyPageSection } from '@/lib/defaults';
import type { PageSection } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  IconPlus, IconFileText, IconHelp,
  IconShieldCheck, IconPuzzle,
} from '@tabler/icons-react';
import type { ComponentType } from 'react';

interface SectionTypeOption {
  type: PageSection['type'];
  label: string;
  icon: ComponentType<{ size?: number; className?: string }>;
}

const SECTION_TYPE_OPTIONS: SectionTypeOption[] = [
  { type: 'text',       label: 'Metin',        icon: IconFileText },
  { type: 'faq',        label: 'FAQ',           icon: IconHelp },
  { type: 'rules',      label: 'Kurallar',      icon: IconShieldCheck },
  { type: 'components', label: 'Componentler',  icon: IconPuzzle },
];

interface AddSectionPaletteProps {
  nodeId: string;
  currentSections: PageSection[];
}

export function AddSectionPalette({ nodeId, currentSections }: AddSectionPaletteProps) {
  const upsertPageSection = useKbStore.useUpsertPageSection();

  const handleAdd = (type: PageSection['type']) => {
    const section = emptyPageSection(type, currentSections.length);
    upsertPageSection(nodeId, section);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button size="sm" variant="outline">
            <IconPlus size={13} />
            Section Ekle
          </Button>
        }
      />
      <DropdownMenuContent align="end">
        {SECTION_TYPE_OPTIONS.map(({ type, label, icon: SectionIcon }) => (
          <DropdownMenuItem
            key={type}
            onClick={() => handleAdd(type)}
            className="gap-2"
          >
            <SectionIcon size={14} />
            {label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

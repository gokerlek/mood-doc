'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  IconBook2, IconAlphabetLatin, IconShieldCheck, IconHelp,
  IconRobot, IconDeviceFloppy, IconLoader2, IconBrandGithub,
  IconSitemap, IconLayoutDashboard, IconPuzzle, IconTags, IconLayoutColumns,
} from '@tabler/icons-react';
import {
  Sidebar, SidebarContent, SidebarHeader, SidebarFooter,
  SidebarGroup, SidebarGroupLabel, SidebarGroupContent,
  SidebarMenu, SidebarMenuItem, SidebarMenuButton,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { useKbStore } from '@/stores/kbStore';
import { useSaveKb } from '@/hooks/useKb';

const NAV_GROUPS = [
  { label: 'Yapı', items: [
    { label: 'Harita', icon: IconSitemap, href: '/map' },
    { label: 'Sayfalar', icon: IconLayoutDashboard, href: '/pages' },
    { label: 'Layout Bileşenleri', icon: IconLayoutColumns, href: '/sections' },
    { label: 'Componentler', icon: IconPuzzle, href: '/components' },
  ]},
  { label: 'İçerik', items: [
    { label: 'FAQ', icon: IconHelp, href: '/faq' },
    { label: 'Kurallar', icon: IconShieldCheck, href: '/rules' },
    { label: 'Sözlük', icon: IconAlphabetLatin, href: '/glossary' },
    { label: 'Taglar', icon: IconTags, href: '/tags' },
  ]},
  { label: 'Sistem', items: [
    { label: 'Agent', icon: IconRobot, href: '/agent' },
  ]},
] as const;

export function AppSidebar() {
  const pathname = usePathname();
  const isDirty = useKbStore.useIsDirty();
  const { mutate: save, isPending } = useSaveKb();

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <Sidebar collapsible="offcanvas" >
      <SidebarHeader>
        <div className="px-1 pt-1 pb-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center shrink-0">
              <IconBook2 size={16} className="text-primary-foreground" />
            </div>
            <div className="min-w-0">
              <p className="font-bold tracking-tight text-sidebar-foreground text-sm leading-tight">Moodivation</p>
              <p className="text-[10px] font-medium text-muted-foreground leading-tight mt-0.5">KB Manager</p>
            </div>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {NAV_GROUPS.map(group => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map(({ label, icon: Icon, href }) => (
                  <SidebarMenuItem key={href}>
                    <SidebarMenuButton render={<Link href={href} />} isActive={isActive(href)}>
                      <Icon size={15} />
                      {label}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter>
        <div className="space-y-2">
          {isDirty && (
            <div className="flex items-center gap-1.5 px-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 animate-pulse" />
              <p className="text-[11px] text-amber-600">Kaydedilmemiş değişiklik</p>
            </div>
          )}
          <Button
            onClick={() => isDirty && save('KB updated')}
            disabled={!isDirty || isPending}
            variant={isDirty ? 'default' : 'ghost'}
            size="sm"
            className="w-full justify-start gap-2 rounded-lg"
          >
            {isPending ? (
              <><IconLoader2 size={13} className="animate-spin" />Kaydediliyor...</>
            ) : isDirty ? (
              <><IconDeviceFloppy size={13} />GitHub&#39;a Kaydet</>
            ) : (
              <><IconBrandGithub size={13} className="text-muted-foreground" />Kaydedildi</>
            )}
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

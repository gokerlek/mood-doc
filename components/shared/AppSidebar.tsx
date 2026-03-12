'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  IconBook2, IconAlphabetLatin, IconShieldCheck, IconHelp,
  IconRobot, IconDeviceFloppy, IconLoader2, IconBrandGithub,
  IconSitemap, IconLayoutDashboard, IconPuzzle, IconTags, IconLayoutColumns,
  IconListDetails, IconRoute,
} from '@tabler/icons-react';
import {
  Sidebar, SidebarContent, SidebarHeader, SidebarFooter,
  SidebarGroup, SidebarGroupLabel, SidebarGroupContent,
  SidebarMenu, SidebarMenuItem, SidebarMenuButton,
  SidebarRail,
} from '@/components/ui/sidebar';
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
  { label: 'Anketler', items: [
    { label: 'Soru Tipleri', icon: IconListDetails, href: '/question-types' },
    { label: 'Driverlar',    icon: IconRoute,        href: '/drivers' },
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
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<Link href="/" />}>
              <div className="flex aspect-square size-8 items-center justify-center rounded-xl bg-primary text-primary-foreground shrink-0">
                <IconBook2 size={16} />
              </div>
              <div className="flex flex-col leading-tight min-w-0">
                <span className="font-bold text-sm text-sidebar-foreground tracking-tight truncate">Moodivation</span>
                <span className="text-xs text-muted-foreground truncate">KB Manager</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {NAV_GROUPS.map(group => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map(({ label, icon: Icon, href }) => (
                  <SidebarMenuItem key={href}>
                    <SidebarMenuButton render={<Link href={href} />} isActive={isActive(href)} tooltip={label}>
                      <Icon size={15} />
                      <span>{label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem className="relative">
            <SidebarMenuButton
              onClick={() => isDirty && save('KB updated')}
              tooltip={isPending ? 'Kaydediliyor...' : isDirty ? "GitHub'a Kaydet" : 'Kaydedildi'}
              className={isDirty
                ? 'bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground font-medium'
                : 'text-muted-foreground'
              }
            >
              {isPending
                ? <IconLoader2 size={15} className="animate-spin shrink-0" />
                : isDirty
                  ? <IconDeviceFloppy size={15} className="shrink-0" />
                  : <IconBrandGithub size={15} className="shrink-0" />
              }
              <span>
                {isPending ? 'Kaydediliyor...' : isDirty ? 'Kaydet' : 'Kaydedildi'}
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}

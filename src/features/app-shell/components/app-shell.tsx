'use client';

import {
  CircleUserRoundIcon,
  CommandIcon,
  EllipsisVerticalIcon,
  Loader2Icon,
  LogOutIcon,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { type CSSProperties, Fragment, type ReactNode, useState } from 'react';
import { toast } from 'sonner';
import { ThemeToggle } from '@/components/theme-toggle';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { useDirection } from '@/components/ui/direction';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { Link, usePathname, useRouter } from '@/i18n/navigation';
import type { UserRole } from '@/lib/api/enums';
import { getNavItems, getSectionHome } from './nav-items';

const SEGMENT_LABEL_KEYS: Record<string, string> = {
  dashboard: 'nav.dashboard',
  profile: 'nav.profile',
  visits: 'nav.visits',
  insurance: 'nav.insurance',
  status: 'nav.insuranceStatus',
  cards: 'nav.insuranceCards',
  applications: 'nav.insuranceApplications',
  dependents: 'nav.insuranceDependents',
  documents: 'nav.insuranceDocuments',
  eligibility: 'nav.insuranceEligibility',
  doctor: 'nav.doctor',
  admin: 'nav.admin',
  audit: 'nav.audit',
  patients: 'nav.patients',
};

function prettifySegment(segment: string): string {
  return segment.charAt(0).toUpperCase() + segment.slice(1);
}

type AppShellProps = {
  allowedRole: UserRole;
  children: ReactNode;
};

export function AppShell({ allowedRole, children }: AppShellProps) {
  return (
    <SidebarProvider
      style={
        {
          '--sidebar-width': 'calc(var(--spacing) * 72)',
          '--header-height': 'calc(var(--spacing) * 14)',
        } as CSSProperties
      }
    >
      <AppShellLayout allowedRole={allowedRole}>{children}</AppShellLayout>
    </SidebarProvider>
  );
}

function AppShellLayout({ allowedRole, children }: AppShellProps) {
  const t = useTranslations('app-shell');
  const router = useRouter();
  const pathname = usePathname();
  const { isMobile } = useSidebar();
  const dir = useDirection();
  const { user, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const items = getNavItems(allowedRole);
  const sectionHome = getSectionHome(allowedRole);

  const segments = pathname.split('/').filter(Boolean);
  const breadcrumbs = segments
    .map((segment, index) => {
      const href = `/${segments.slice(0, index + 1).join('/')}`;
      const labelKey = SEGMENT_LABEL_KEYS[segment];
      const label = labelKey ? t(labelKey) : prettifySegment(segment);
      return { href, label, isLast: index === segments.length - 1 };
    })
    .filter((crumb) => crumb.href !== sectionHome);

  const isNavItemActive = (href: string) =>
    pathname === href ||
    (href.split('/').length > 2 && pathname.startsWith(href));

  const displayName = user?.fullName ?? user?.username ?? t('userMenu.profile');
  const subtitle = user?.username ?? '';
  const initials = (displayName || '?').slice(0, 2).toUpperCase();
  const profileHref =
    allowedRole === 'Patient' ? '/dashboard/profile' : sectionHome;

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await logout();
      router.push('/');
    } catch {
      toast.error(t('userMenu.logoutError'));
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <>
      <Sidebar
        collapsible="offcanvas"
        dir={dir}
        side={dir === 'ltr' ? 'left' : 'right'}
      >
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild size="lg">
                <Link href={sectionHome}>
                  <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <CommandIcon className="size-5" />
                  </div>
                  <span className="text-base font-semibold">{t('brand')}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={isNavItemActive(item.href)}
                        tooltip={t(item.labelKey)}
                      >
                        <Link href={item.href}>
                          <Icon />
                          <span>{t(item.labelKey)}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton
                    size="lg"
                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                  >
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarFallback className="rounded-lg bg-primary text-primary-foreground">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-start text-sm leading-tight">
                      <span className="truncate font-medium">
                        {displayName}
                      </span>
                      <span className="truncate text-xs text-muted-foreground">
                        {subtitle}
                      </span>
                    </div>
                    <EllipsisVerticalIcon className="ms-auto size-4" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                  side={isMobile ? 'bottom' : 'right'}
                  align="end"
                  sideOffset={4}
                >
                  <DropdownMenuLabel className="p-0 font-normal">
                    <div className="flex items-center gap-2 px-1 py-1.5 text-start text-sm">
                      <Avatar className="h-8 w-8 rounded-lg">
                        <AvatarFallback className="rounded-lg">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="grid flex-1 text-start text-sm leading-tight">
                        <span className="truncate font-medium">
                          {displayName}
                        </span>
                        <span className="truncate text-xs text-muted-foreground">
                          {subtitle}
                        </span>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href={profileHref}>
                      <CircleUserRoundIcon />
                      {t('userMenu.profile')}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    asChild
                    onSelect={(event) => event.preventDefault()}
                  >
                    <ThemeToggle label={t('userMenu.theme')} />
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    variant="destructive"
                    disabled={isLoggingOut}
                    onSelect={handleLogout}
                  >
                    {isLoggingOut ? (
                      <Loader2Icon
                        className="size-4 animate-spin"
                        aria-hidden="true"
                      />
                    ) : (
                      <LogOutIcon />
                    )}
                    {t('userMenu.logout')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear">
          <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
            <SidebarTrigger className="-ms-1" />
            <Separator
              orientation="vertical"
              className="mx-2 data-[orientation=vertical]:h-4 my-auto"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href={sectionHome}>{t('breadcrumb.home')}</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                {breadcrumbs.map((crumb) => (
                  <Fragment key={crumb.href}>
                    <BreadcrumbSeparator />
                    {crumb.isLast ? (
                      <BreadcrumbItem>
                        <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                      </BreadcrumbItem>
                    ) : (
                      <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                          <Link href={crumb.href}>{crumb.label}</Link>
                        </BreadcrumbLink>
                      </BreadcrumbItem>
                    )}
                  </Fragment>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
            <div className="ms-auto flex items-center gap-2">
              <ThemeToggle label={t('userMenu.theme')} />
            </div>
          </div>
        </header>
        <div className="flex flex-1 flex-col">{children}</div>
      </SidebarInset>
    </>
  );
}

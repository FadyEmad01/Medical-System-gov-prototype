import type { LucideIcon } from 'lucide-react';
import {
  BadgeCheckIcon,
  ClipboardListIcon,
  CreditCardIcon,
  FilePlus2Icon,
  FileTextIcon,
  LayoutDashboardIcon,
  ScrollTextIcon,
  Settings2Icon,
  ShieldCheckIcon,
  StethoscopeIcon,
  UserRoundIcon,
  UsersIcon,
} from 'lucide-react';
import type { UserRole } from '@/lib/api/enums';

// labelKey is a namespace-relative next-intl key resolved with
// useTranslations('app-shell') at the render site (AppShell), keeping this
// module free of hooks and safe for the client bundle.
export type AppNavItem = {
  labelKey: string;
  href: string;
  icon: LucideIcon;
};

export const PATIENT_NAV_ITEMS: readonly AppNavItem[] = [
  { labelKey: 'nav.dashboard', href: '/dashboard', icon: LayoutDashboardIcon },
  {
    labelKey: 'nav.profile',
    href: '/dashboard/profile',
    icon: UserRoundIcon,
  },
  {
    labelKey: 'nav.visits',
    href: '/dashboard/visits',
    icon: ClipboardListIcon,
  },
  {
    labelKey: 'nav.insuranceStatus',
    href: '/dashboard/insurance/status',
    icon: BadgeCheckIcon,
  },
  {
    labelKey: 'nav.insuranceCards',
    href: '/dashboard/insurance/cards',
    icon: CreditCardIcon,
  },
  {
    labelKey: 'nav.insuranceApplications',
    href: '/dashboard/insurance/applications',
    icon: FilePlus2Icon,
  },
  {
    labelKey: 'nav.insuranceDependents',
    href: '/dashboard/insurance/dependents',
    icon: UsersIcon,
  },
  {
    labelKey: 'nav.insuranceDocuments',
    href: '/dashboard/insurance/documents',
    icon: FileTextIcon,
  },
  {
    labelKey: 'nav.insuranceEligibility',
    href: '/dashboard/insurance/eligibility',
    icon: ShieldCheckIcon,
  },
];

export const DOCTOR_NAV_ITEMS: readonly AppNavItem[] = [
  { labelKey: 'nav.doctor', href: '/doctor', icon: StethoscopeIcon },
  { labelKey: 'nav.patients', href: '/doctor/patients', icon: UsersIcon },
  { labelKey: 'nav.visits', href: '/doctor/visits', icon: ClipboardListIcon },
];

export const ADMIN_NAV_ITEMS: readonly AppNavItem[] = [
  { labelKey: 'nav.admin', href: '/admin', icon: Settings2Icon },
  { labelKey: 'nav.audit', href: '/admin/audit', icon: ScrollTextIcon },
];

const NAV_ITEMS_BY_ROLE: Record<UserRole, readonly AppNavItem[]> = {
  Patient: PATIENT_NAV_ITEMS,
  Doctor: DOCTOR_NAV_ITEMS,
  Admin: ADMIN_NAV_ITEMS,
};

export function getNavItems(role: UserRole): readonly AppNavItem[] {
  return NAV_ITEMS_BY_ROLE[role];
}

export function getSectionHome(role: UserRole): string {
  switch (role) {
    case 'Patient':
      return '/dashboard';
    case 'Doctor':
      return '/doctor';
    case 'Admin':
      return '/admin';
  }
}

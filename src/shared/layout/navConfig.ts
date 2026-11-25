import type { ComponentType } from "react";
import { HomeOutlined, SettingOutlined } from "@ant-design/icons";
import type { Role } from "../api/types";

/**
 * Sidebar areas. The base has the home page and the platform administration; each business area
 * adds its key here, its item to `byRole` and its route permission to `ROUTE_PERMISSIONS` when it
 * is moved in.
 */
export type NavKey = "home" | "platform";

export interface NavChild {
  /** Route path; also the menu key so the open route is highlighted. */
  to: string;
  labelKey: string;
  ns?: "common" | "platform";
}

export interface NavItem {
  key: NavKey;
  to: string;
  icon: ComponentType;
  /** Translation key; `ns` defaults to `common`. */
  labelKey: string;
  ns?: "common" | "platform";
  /** Shows the pending-task count; the header bell opens this inbox. */
  badge?: boolean;
  /** Rendered as an always-open submenu, as in the UniFlow sidebar. */
  children?: NavChild[];
}

/** A business area of the sidebar, shown under its own heading. */
export interface NavSection {
  /** Translation key inside `common`. */
  labelKey: string;
  items: NavItem[];
}

/** Generic resources of Administration, served by the API's resource CRUD. */
export const PLATFORM_RESOURCES = [
  "organizations",
  "users",
  "settings",
  "audit",
] as const;

const home: NavItem = {
  key: "home",
  to: "/home",
  icon: HomeOutlined,
  labelKey: "nav.home",
};
const platform: NavItem = {
  key: "platform",
  to: "/platform/organizations",
  icon: SettingOutlined,
  labelKey: "title",
  ns: "platform",
  children: [
    ...PLATFORM_RESOURCES.map((name) => ({
      to: `/platform/${name}`,
      labelKey: `resources.${name}`,
      ns: "platform" as const,
    })),
    {
      to: "/platform/permissions",
      labelKey: "permissions.title",
      ns: "platform",
    },
  ],
};

const base: NavSection[] = [
  { labelKey: "nav.groups.data", items: [home, platform] },
];

/** Every role sees the same base areas; its permissions decide which of them open. */
export const navByRole = Object.fromEntries(
  (
    [
      "CONTRACT_OWNER",
      "FINANCE_APPROVER",
      "SECONDARY_APPROVER",
      "LEGAL_REVIEWER",
      "ADMIN_AUDITOR",
      "SYSTEM_ADMIN",
      "AUDITOR",
      "SUPPLIER",
      "ORG_ADMIN",
    ] satisfies Role[]
  ).map((role) => [role, base]),
) as Record<Role, NavSection[]>;

/**
 * The read permission each screen needs (packages/contracts/permissions.json). A path with no entry
 * is open to every signed-in user; the API still checks every call.
 */
const ROUTE_PERMISSIONS: [path: string, permission: string][] = [
  ["/platform/permissions", "permissions:read"],
  ...PLATFORM_RESOURCES.map((name): [string, string] => [
    `/platform/${name}`,
    `${name}:read`,
  ]),
];

/** Whether the signed-in user may open a screen: the first (most specific) matching entry decides. */
export function routeAllowed(path: string, permissions: readonly string[]) {
  const entry = ROUTE_PERMISSIONS.find(
    ([prefix]) => path === prefix || path.startsWith(`${prefix}/`),
  );
  return !entry || permissions.includes(entry[1]);
}

/** The role's sidebar without the screens its permissions do not open. */
export function navFor(role: Role, permissions: readonly string[]) {
  const open = (to: string) => routeAllowed(to, permissions);
  return navByRole[role]
    .map((section) => ({
      ...section,
      items: section.items.flatMap((item) => {
        if (!item.children) return open(item.to) ? [item] : [];
        const children = item.children.filter((child) => open(child.to));
        return children.length ? [{ ...item, children }] : [];
      }),
    }))
    .filter((section) => section.items.length > 0);
}

/**
 * First screen after signing in: the administrators land on the accounts they manage, everyone
 * else on the home page until their business area exists.
 */
export const homeByRole: Record<Role, string> = {
  CONTRACT_OWNER: "/home",
  LEGAL_REVIEWER: "/home",
  FINANCE_APPROVER: "/home",
  SECONDARY_APPROVER: "/home",
  ADMIN_AUDITOR: "/home",
  SYSTEM_ADMIN: "/platform/organizations",
  AUDITOR: "/platform/audit",
  SUPPLIER: "/home",
  ORG_ADMIN: "/platform/users",
};

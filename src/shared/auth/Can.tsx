import type { ComponentType, ReactNode } from "react";
import { Result } from "antd";
import { useTranslation } from "react-i18next";
import { useSession } from "./session";

/** One permission, or a list (all of them by default, any of them with `mode: "any"`). */
export type PermissionRule = string | readonly string[];

export function hasPermissions(
  granted: readonly string[],
  rule: PermissionRule,
  mode: "all" | "any" = "all",
): boolean {
  const wanted = typeof rule === "string" ? [rule] : rule;
  return mode === "all"
    ? wanted.every((permission) => granted.includes(permission))
    : wanted.some((permission) => granted.includes(permission));
}

/** Whether the signed-in user holds the permission(s); false when nobody is signed in. */
export function usePermission(
  rule: PermissionRule,
  mode: "all" | "any" = "all",
): boolean {
  const { user } = useSession();
  return !!user && hasPermissions(user.permissions, rule, mode);
}

interface CanProps {
  permission: PermissionRule;
  mode?: "all" | "any";
  /**
   * What to render. A function receives whether the user is allowed (render props), so a screen
   * can show a disabled button with a reason instead of hiding it.
   */
  children: ReactNode | ((allowed: boolean) => ReactNode);
  /** Rendered when not allowed and `children` is not a function. */
  fallback?: ReactNode;
}

/**
 * Shows its children only to users holding the permission. The API checks every call again; this
 * only keeps the interface honest about what the user may do.
 */
export function Can({ permission, mode, children, fallback = null }: CanProps) {
  const allowed = usePermission(permission, mode);
  if (typeof children === "function") return <>{children(allowed)}</>;
  return <>{allowed ? children : fallback}</>;
}

function Forbidden() {
  const { t } = useTranslation("common");
  return (
    <Result
      status="403"
      title={t("access.forbiddenTitle")}
      subTitle={t("access.forbiddenBody")}
      data-testid="forbidden"
    />
  );
}

/**
 * Wraps a screen so it renders only for users holding the permission: a second check behind the
 * route guard (navConfig ROUTE_PERMISSIONS), for screens that can also be reached another way.
 */
export function withPermission<P extends object>(
  Component: ComponentType<P>,
  permission: PermissionRule,
  Fallback: ComponentType = Forbidden,
) {
  function Guarded(props: P) {
    return usePermission(permission) ? <Component {...props} /> : <Fallback />;
  }
  Guarded.displayName = `withPermission(${Component.displayName ?? Component.name ?? "Component"})`;
  return Guarded;
}

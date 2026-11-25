import { createBrowserRouter } from "react-router-dom";
import LoginPage from "@/shared/auth/LoginPage";
import { HomeRedirect, RequireAuth } from "@/shared/auth/RequireAuth";
import { AppLayout } from "@/shared/layout/AppLayout";
import RouteErrorPage from "@/shared/pages/RouteErrorPage";

/**
 * Route table. Every page is a lazy default export so a feature only owns its own folder.
 *
 * Signed-in pages render inside `AppLayout`, which stays mounted across navigation; the inner
 * pathless route catches page errors so the sidebar and header remain usable.
 */
export const router = createBrowserRouter([
  { path: "/login", element: <LoginPage />, errorElement: <RouteErrorPage /> },
  {
    element: <RequireAuth />,
    errorElement: <RouteErrorPage />,
    HydrateFallback: () => null,
    children: [
      {
        element: <AppLayout />,
        children: [{ errorElement: <RouteErrorPage />, children: pages() }],
      },
    ],
  },
]);

function pages() {
  return [
    { path: "/", element: <HomeRedirect /> },
    {
      path: "/home",
      lazy: () => import("@/shared/pages/HomePage").then(asRoute),
    },
    // Platform base: the generic CRUD screen for every resource and the permission matrix.
    // Business screens are added here, one lazy route each, as they are moved in.
    {
      path: "/platform/permissions",
      lazy: () =>
        import("@/features/platform/PermissionMatrixPage").then(asRoute),
    },
    {
      path: "/platform/:resource?",
      lazy: () => import("@/features/platform/ResourcePage").then(asRoute),
    },
    {
      path: "*",
      lazy: () => import("@/shared/pages/NotFoundPage").then(asRoute),
    },
  ];
}

function asRoute(module: { default: React.ComponentType }) {
  return { Component: module.default };
}

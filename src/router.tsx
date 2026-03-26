import Box from "@mui/material/Box"
import { createRouter, createRootRoute, createRoute, Outlet } from "@tanstack/react-router"

import { AppFooter } from "./components/layout/AppFooter"
import { AppHeader } from "./components/layout/AppHeader"
import { JgaDsFormPage } from "./pages/JgaDsFormPage"
import { JgaDuFormPage } from "./pages/JgaDuFormPage"
import { NotFoundPage } from "./pages/NotFoundPage"
import { ResearchEditPage } from "./pages/ResearchEditPage"
import { ResearchListPage } from "./pages/ResearchListPage"

const rootRoute = createRootRoute({
  notFoundComponent: () => <NotFoundPage />,
})

const defaultLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "default-layout",
  component: () => (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <AppHeader />
      <Box component="main" sx={{ flex: 1 }}>
        <Outlet />
      </Box>
      <AppFooter />
    </Box>
  ),
})

const fullScreenLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "full-screen-layout",
  component: () => (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <AppHeader />
      <Box component="main" sx={{ flex: 1, overflow: "hidden" }}>
        <Outlet />
      </Box>
    </Box>
  ),
})

const indexRoute = createRoute({
  getParentRoute: () => defaultLayoutRoute,
  path: "/",
  component: () => <ResearchListPage />,
})

const jgaDsRoute = createRoute({
  getParentRoute: () => defaultLayoutRoute,
  path: "/jga/ds",
  component: () => <JgaDsFormPage />,
})

const jgaDuRoute = createRoute({
  getParentRoute: () => defaultLayoutRoute,
  path: "/jga/du",
  component: () => <JgaDuFormPage />,
})

export const researchEditRoute = createRoute({
  getParentRoute: () => fullScreenLayoutRoute,
  path: "/research/$humId",
  component: () => <ResearchEditPage />,
  validateSearch: (search: Record<string, unknown>): { debugOriginal?: "off" } =>
    search["debugOriginal"] === "off" ? { debugOriginal: "off" } : {},
})

const routeTree = rootRoute.addChildren([
  defaultLayoutRoute.addChildren([indexRoute, jgaDsRoute, jgaDuRoute]),
  fullScreenLayoutRoute.addChildren([researchEditRoute]),
])

export const router = createRouter({ routeTree })

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router
  }
}

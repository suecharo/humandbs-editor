import Box from "@mui/material/Box"
import { createRouter, createRootRoute, createRoute, Outlet } from "@tanstack/react-router"

import { AppFooter } from "./components/layout/AppFooter"
import { AppHeader } from "./components/layout/AppHeader"
import { NotFoundPage } from "./pages/NotFoundPage"
import { ResearchListPage } from "./pages/ResearchListPage"

const rootRoute = createRootRoute({
  component: () => (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <AppHeader />
      <Box component="main" sx={{ flex: 1 }}>
        <Outlet />
      </Box>
      <AppFooter />
    </Box>
  ),
  notFoundComponent: () => <NotFoundPage />,
})

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: () => <ResearchListPage />,
})

const routeTree = rootRoute.addChildren([indexRoute])

export const router = createRouter({ routeTree })

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router
  }
}

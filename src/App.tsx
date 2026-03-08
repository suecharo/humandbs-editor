import CssBaseline from "@mui/material/CssBaseline"
import { ThemeProvider } from "@mui/material/styles"
import { QueryClientProvider } from "@tanstack/react-query"
import { RouterProvider } from "@tanstack/react-router"
import { Provider as JotaiProvider } from "jotai"

import { store } from "./jotai-store"
import { queryClient } from "./query-client"
import { router } from "./router"
import { theme } from "./theme"

export const App = () => (
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <JotaiProvider store={store}>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </JotaiProvider>
  </ThemeProvider>
)

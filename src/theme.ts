import { createTheme } from "@mui/material/styles"

import "@fontsource/inter/400.css"
import "@fontsource/inter/500.css"
import "@fontsource/inter/600.css"
import "@fontsource/inter/700.css"

// Design tokens

export const HEADER_HEIGHT = "3rem"
export const HEADER_BG = "#1E293B"
export const NAV_LINK_COLOR = "#CBD5E1"
export const NAV_LINK_HOVER_COLOR = "#FFFFFF"
export const CONTENT_MARGIN_Y = 3
export const FOOTER_BG = "#1E293B"
export const FOOTER_TEXT_COLOR = "#94A3B8"

const FONT_FAMILY = "'Inter', system-ui, -apple-system, sans-serif"

export const theme = createTheme({
  palette: {
    primary: { main: "#4960D3" },
    secondary: { main: "#D4691E", contrastText: "#fff" },
    error: { main: "#C9393B" },
    warning: { main: "#B88914", contrastText: "#fff" },
    info: { main: "#2889AC", contrastText: "#fff" },
    success: { main: "#247A4B" },
    background: {
      default: "#F8FAFC",
      paper: "#FFFFFF",
    },
    text: {
      primary: "#0F172A",
      secondary: "#64748B",
    },
    divider: "#E2E8F0",
  },
  typography: {
    fontFamily: FONT_FAMILY,
    h1: {
      fontSize: "1.5rem",
      fontWeight: 600,
      lineHeight: 1.3,
      letterSpacing: "-0.02em",
    },
    h2: {
      fontSize: "1.125rem",
      fontWeight: 600,
      lineHeight: 1.3,
      letterSpacing: "-0.015em",
    },
    h3: {
      fontSize: "0.9375rem",
      fontWeight: 600,
      lineHeight: 1.4,
      letterSpacing: "-0.01em",
    },
    body1: {
      fontSize: "0.875rem",
      fontWeight: 400,
      lineHeight: 1.6,
    },
    body2: {
      fontSize: "0.8125rem",
      fontWeight: 400,
      lineHeight: 1.6,
    },
    button: {
      fontWeight: 500,
      letterSpacing: "0.01em",
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: `
        body {
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        :focus-visible {
          outline: 2px solid #4960D3;
          outline-offset: 2px;
        }
      `,
    },
    MuiAppBar: {
      defaultProps: {
        position: "static",
        elevation: 0,
      },
      styleOverrides: {
        root: {
          borderRadius: 0,
        },
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          textTransform: "none",
          borderRadius: 6,
          minWidth: 96,
        },
        text: {
          minWidth: "auto",
          "&:hover": {
            textDecoration: "underline",
            textUnderlineOffset: "3px",
          },
        },
      },
    },
    MuiTextField: {
      defaultProps: { size: "small" },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          backgroundColor: "transparent",
        },
        shrink: {
          backgroundColor: "#FFFFFF",
          paddingInline: "10px",
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        notchedOutline: {
          borderColor: "#CBD5E1",
        },
      },
    },
    MuiSelect: {
      defaultProps: { size: "small" },
    },
    MuiTable: {
      defaultProps: { size: "small" },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          "& .MuiTableCell-root": {
            backgroundColor: "#F1F5F9",
            fontWeight: 600,
            fontSize: "0.6875rem",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            color: "#475569",
            borderBottomWidth: 1,
            borderBottomColor: "#CBD5E1",
          },
        },
      },
    },
    MuiTableBody: {
      styleOverrides: {
        root: {
          "& .MuiTableRow-root": {
            transition: "background-color 0.15s ease, box-shadow 0.15s ease",
          },
          "& .MuiTableRow-root.MuiTableRow-hover:hover": {
            backgroundColor: "#F8FAFC",
            boxShadow: "inset 3px 0 0 0 #4960D3",
          },
          "& .MuiTableRow-root:last-of-type .MuiTableCell-root": {
            borderBottom: "none",
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        sizeSmall: {
          padding: "12px 16px",
        },
        root: {
          borderColor: "#F1F5F9",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
        outlined: {
          borderColor: "#E2E8F0",
        },
      },
    },
    MuiContainer: {
      defaultProps: { maxWidth: "lg" },
    },
    MuiChip: {
      defaultProps: { size: "small" },
      styleOverrides: {
        root: {
          fontWeight: 500,
        },
        colorSuccess: {
          "&.MuiChip-filled": {
            backgroundColor: "rgba(36, 122, 75, 0.12)",
            color: "#247A4B",
          },
        },
        colorWarning: {
          "&.MuiChip-filled": {
            backgroundColor: "rgba(184, 137, 20, 0.12)",
            color: "#B88914",
          },
        },
      },
    },
    MuiTooltip: {
      defaultProps: { placement: "top" },
    },
    MuiLink: {
      defaultProps: {
        underline: "always",
      },
      styleOverrides: {
        root: {
          fontWeight: 500,
          textUnderlineOffset: "3px",
          textDecorationThickness: "1px",
          transition: "text-decoration-color 0.15s ease, color 0.15s ease",
          "&:hover": {
            textDecorationThickness: "2px",
          },
        },
      },
    },
  },
})

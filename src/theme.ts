import { createTheme } from "@mui/material/styles"

import "@fontsource/inter/400.css"
import "@fontsource/inter/500.css"
import "@fontsource/inter/600.css"
import "@fontsource/inter/700.css"

// Color palette

const PRIMARY = "#2D3A96"
const SECONDARY = "#BF6D4A"
const ERROR = "#C93C3C"
const WARNING = "#AD8B1E"
const SUCCESS = "#247A4B"
const INFO = "#2889AC"

// Layout tokens

export const HEADER_HEIGHT = "3rem"
export const HEADER_BG = "#181D35"
export const NAV_LINK_COLOR = "#CBD5E1"
export const NAV_LINK_HOVER_COLOR = "#FFFFFF"
export const CONTENT_MARGIN_Y = 3
export const FOOTER_BG = "#181D35"
export const FOOTER_TEXT_COLOR = "#94A3B8"

export const FORM_FIELD_MAX_WIDTH = "600px"

export const TAB_BAR_SX = { borderBottom: 1, borderColor: "divider", px: 1 } as const
export const TAB_CONTENT_PADDING = 3

export const MONOSPACE_FONT_FAMILY =
  "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace"

export const MONOSPACE_ID_SX = {
  fontFamily: MONOSPACE_FONT_FAMILY,
  fontSize: "0.8125rem",
} as const

// Spacing hierarchy

export const SECTION_GAP = 3
export const SUBSECTION_GAP = 2
export const FIELD_GROUP_GAP = 1.5

// Heading tokens

export const HEADING_BORDER_LARGE = "4px"
export const HEADING_BORDER_SMALL = "3px"
export const HEADING_PL = 1.5

// Accent shadows

export const HOVER_ACCENT_SHADOW = `inset 3px 0 0 0 ${PRIMARY}`
export const SELECTED_ACCENT_SHADOW = `inset 4px 0 0 0 ${SECONDARY}`
export const MODIFIED_ACCENT_SHADOW = `inset 3px 0 0 0 ${SUCCESS}`

// Alpha backgrounds

export const ALPHA_BG_PRIMARY_SUBTLE = "rgba(45, 58, 150, 0.06)"
export const ALPHA_BG_SUCCESS_SUBTLE = "rgba(36, 122, 75, 0.12)"
export const ALPHA_BG_SECONDARY_SUBTLE = "rgba(191, 109, 74, 0.12)"
export const ALPHA_BG_WARNING_SUBTLE = "rgba(173, 139, 30, 0.12)"
export const ALPHA_BG_ERROR_SUBTLE = "rgba(201, 60, 60, 0.12)"
export const ALPHA_BG_INFO_SUBTLE = "rgba(40, 137, 172, 0.12)"

// Form label

export const FORM_LABEL_SX = {
  fontWeight: 500,
  color: "text.secondary",
} as const

const FONT_FAMILY = "'Inter', system-ui, -apple-system, sans-serif"

export const theme = createTheme({
  palette: {
    primary: { main: PRIMARY },
    secondary: { main: SECONDARY, contrastText: "#fff" },
    error: { main: ERROR },
    warning: { main: WARNING, contrastText: "#fff" },
    info: { main: INFO, contrastText: "#fff" },
    success: { main: SUCCESS },
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
          outline: 2px solid ${PRIMARY};
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
    MuiTab: {
      styleOverrides: {
        root: { textTransform: "none" },
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
            textTransform: "none",
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
            boxShadow: HOVER_ACCENT_SHADOW,
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
        colorPrimary: {
          "&.MuiChip-filled": {
            backgroundColor: ALPHA_BG_PRIMARY_SUBTLE,
            color: PRIMARY,
          },
        },
        colorSecondary: {
          "&.MuiChip-filled": {
            backgroundColor: ALPHA_BG_SECONDARY_SUBTLE,
            color: SECONDARY,
          },
        },
        colorSuccess: {
          "&.MuiChip-filled": {
            backgroundColor: ALPHA_BG_SUCCESS_SUBTLE,
            color: SUCCESS,
          },
        },
        colorInfo: {
          "&.MuiChip-filled": {
            backgroundColor: ALPHA_BG_INFO_SUBTLE,
            color: INFO,
          },
        },
        colorWarning: {
          "&.MuiChip-filled": {
            backgroundColor: ALPHA_BG_WARNING_SUBTLE,
            color: WARNING,
          },
        },
        colorError: {
          "&.MuiChip-filled": {
            backgroundColor: ALPHA_BG_ERROR_SUBTLE,
            color: ERROR,
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
    MuiAlert: {
      styleOverrides: {
        root: {
          alignItems: "center",
          borderRadius: 8,
          fontSize: "0.8125rem",
        },
        icon: {
          paddingTop: 8,
          paddingBottom: 8,
        },
        action: {
          paddingRight: 8,
        },
      },
    },
  },
})

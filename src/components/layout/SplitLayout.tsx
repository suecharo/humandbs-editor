import Box from "@mui/material/Box"

interface SplitLayoutProps {
  left: React.ReactNode
  right: React.ReactNode
}

export const SplitLayout = ({ left, right }: SplitLayoutProps) => (
  <Box sx={{ display: "flex", height: "100%", overflow: "hidden" }}>
    <Box sx={{ flex: 1, overflow: "hidden", borderRight: 1, borderColor: "divider" }}>
      {left}
    </Box>
    <Box sx={{ flex: 1, overflow: "hidden", bgcolor: "background.default" }}>
      {right}
    </Box>
  </Box>
)

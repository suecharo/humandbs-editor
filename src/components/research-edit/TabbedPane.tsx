import OpenInNewIcon from "@mui/icons-material/OpenInNew"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import Tab from "@mui/material/Tab"
import Tabs from "@mui/material/Tabs"
import Typography from "@mui/material/Typography"
import { useState } from "react"

import { TAB_BAR_SX, TAB_CONTENT_PADDING } from "../../theme"
import { TabPanel, tabA11yProps } from "../TabPanel"

interface TabbedPaneProps {
  prefix: string
  form: React.ReactNode
  preview: React.ReactNode
  humId: string
  originalUrl: string | null
  showOriginalIframe?: boolean
}

const OriginalFallback = ({ url }: { url: string }) => (
  <Box sx={{ p: TAB_CONTENT_PADDING, display: "flex", flexDirection: "column", gap: 2 }}>
    <Typography color="text.secondary">
      iframe での表示ができません。
    </Typography>
    <Typography variant="body2" color="text.secondary" sx={{ wordBreak: "break-all" }}>
      {url}
    </Typography>
    <Box>
      <Button
        variant="outlined"
        size="small"
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        startIcon={<OpenInNewIcon />}
      >
        新しいタブで開く
      </Button>
    </Box>
  </Box>
)

export const TabbedPane = ({ prefix, form, preview, humId, originalUrl, showOriginalIframe = true }: TabbedPaneProps) => {
  const [tabIndex, setTabIndex] = useState(0)
  const proxyUrl = `/api/researches/${encodeURIComponent(humId)}/original`

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Tabs value={tabIndex} onChange={(_, v: number) => setTabIndex(v)} sx={TAB_BAR_SX}>
        <Tab label="Edit" {...tabA11yProps(prefix, 0)} />
        <Tab label="Preview" {...tabA11yProps(prefix, 1)} />
        <Tab label="Original" {...tabA11yProps(prefix, 2)} />
      </Tabs>
      <Box sx={{ flex: 1, overflow: "hidden" }}>
        <TabPanel value={tabIndex} index={0} prefix={prefix}>
          <Box sx={{ overflow: "auto", height: "100%", p: TAB_CONTENT_PADDING }}>
            {form}
          </Box>
        </TabPanel>
        <TabPanel value={tabIndex} index={1} prefix={prefix} lazy>
          <Box sx={{ overflow: "auto", height: "100%", p: TAB_CONTENT_PADDING }}>
            {preview}
          </Box>
        </TabPanel>
        <TabPanel value={tabIndex} index={2} prefix={prefix} lazy>
          {originalUrl && showOriginalIframe ? (
            <iframe
              src={proxyUrl}
              title="Original page"
              style={{ height: "100%", border: "none", width: "100%" }}
            />
          ) : originalUrl ? (
            <OriginalFallback url={originalUrl} />
          ) : (
            <Box sx={{ p: TAB_CONTENT_PADDING }}>
              <Typography color="text.secondary">Original URL is not available.</Typography>
            </Box>
          )}
        </TabPanel>
      </Box>
    </Box>
  )
}

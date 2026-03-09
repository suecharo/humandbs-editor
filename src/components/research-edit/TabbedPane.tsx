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
  humId: string
  originalUrls: { ja: string | null; en: string | null }
  showOriginalIframe?: boolean
  initialTabIndex?: number
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

const OriginalTabContent = ({
  url,
  iframeSrc,
  showIframe,
}: {
  url: string | null
  iframeSrc: string
  showIframe: boolean
}) => {
  if (url && showIframe) {
    return (
      <iframe
        src={iframeSrc}
        title="Original page"
        style={{ height: "100%", border: "none", width: "100%" }}
      />
    )
  }
  if (url) {
    return <OriginalFallback url={url} />
  }

  return (
    <Box sx={{ p: TAB_CONTENT_PADDING }}>
      <Typography color="text.secondary">Original URL is not available.</Typography>
    </Box>
  )
}

export const TabbedPane = ({ prefix, form, humId, originalUrls, showOriginalIframe = true, initialTabIndex = 0 }: TabbedPaneProps) => {
  const [tabIndex, setTabIndex] = useState(initialTabIndex)
  const proxyUrl = (lang: "ja" | "en") =>
    `/api/researches/${encodeURIComponent(humId)}/original?lang=${lang}`

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Tabs value={tabIndex} onChange={(_, v: number) => setTabIndex(v)} sx={TAB_BAR_SX}>
        <Tab label="Edit" {...tabA11yProps(prefix, 0)} />
        <Tab label="Original Ja" {...tabA11yProps(prefix, 1)} />
        <Tab label="Original En" {...tabA11yProps(prefix, 2)} />
      </Tabs>
      <Box sx={{ flex: 1, overflow: "hidden" }}>
        <TabPanel value={tabIndex} index={0} prefix={prefix} lazy>
          <Box sx={{ overflow: "auto", height: "100%", p: TAB_CONTENT_PADDING }}>
            {form}
          </Box>
        </TabPanel>
        <TabPanel value={tabIndex} index={1} prefix={prefix} lazy>
          <OriginalTabContent
            url={originalUrls.ja}
            iframeSrc={proxyUrl("ja")}
            showIframe={showOriginalIframe}
          />
        </TabPanel>
        <TabPanel value={tabIndex} index={2} prefix={prefix} lazy>
          <OriginalTabContent
            url={originalUrls.en}
            iframeSrc={proxyUrl("en")}
            showIframe={showOriginalIframe}
          />
        </TabPanel>
      </Box>
    </Box>
  )
}

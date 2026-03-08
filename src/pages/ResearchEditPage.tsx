import NavigateNextIcon from "@mui/icons-material/NavigateNext"
import Alert from "@mui/material/Alert"
import Box from "@mui/material/Box"
import Breadcrumbs from "@mui/material/Breadcrumbs"
import CircularProgress from "@mui/material/CircularProgress"
import Container from "@mui/material/Container"
import Typography from "@mui/material/Typography"
import { Link } from "@tanstack/react-router"
import { useAtomValue, useSetAtom } from "jotai"
import { useEffect } from "react"

import { AppFooter } from "../components/layout/AppFooter"
import { SplitLayout } from "../components/layout/SplitLayout"
import { ResearchForm } from "../components/research-edit/ResearchForm"
import { ResearchPreview } from "../components/research-edit/ResearchPreview"
import { BasicInfoSection } from "../components/research-edit/sections/BasicInfoSection"
import { TabbedPane } from "../components/research-edit/TabbedPane"
import { useResearch } from "../hooks/use-research"
import { useResearchVersions } from "../hooks/use-research-versions"
import { researchEditRoute } from "../router"
import { researchDirtyAtom, researchDraftAtom, researchServerAtom } from "../stores/research-edit"
import { HEADER_HEIGHT, SUBSECTION_GAP } from "../theme"

export const ResearchEditPage = () => {
  const { humId } = researchEditRoute.useParams()
  const { debugOriginal } = researchEditRoute.useSearch()
  const { data: research, isLoading, error } = useResearch(humId)
  const { data: versions } = useResearchVersions(humId)
  const setServer = useSetAtom(researchServerAtom)
  const setDraft = useSetAtom(researchDraftAtom)
  const dirty = useAtomValue(researchDirtyAtom)

  useEffect(() => {
    if (research) {
      setServer(research)
      setDraft(structuredClone(research))
    }
  }, [research, setServer, setDraft])

  useEffect(() => () => {
    setServer(null)
    setDraft(null)
  }, [setServer, setDraft])

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Failed to load research {humId}: {error.message}
        </Alert>
      </Box>
    )
  }

  return (
    <Box sx={{ height: "100%", overflow: "auto" }}>
      <Box sx={{ bgcolor: "background.default" }}>
        <Container sx={{ pt: SUBSECTION_GAP }}>
          <Breadcrumbs sx={{ mb: SUBSECTION_GAP }} separator={<NavigateNextIcon sx={{ fontSize: "0.875rem" }} />}>
            <Link to="/" style={{ color: "inherit", textDecoration: "none" }}>
              <Typography variant="body2" sx={{ "&:hover": { textDecoration: "underline" } }}>
                研究一覧
              </Typography>
            </Link>
            <Typography variant="body2" color="text.primary" fontWeight={600}>
              {humId}
            </Typography>
          </Breadcrumbs>
          {research && (
            <Box sx={{ pb: SUBSECTION_GAP }}>
              <BasicInfoSection research={research} versions={versions ?? []} />
            </Box>
          )}
        </Container>
      </Box>
      {dirty && (
        <Alert severity="info" sx={{ borderRadius: 0 }}>
          Unsaved changes
        </Alert>
      )}
      <Box sx={{ height: `calc(100vh - ${HEADER_HEIGHT})` }}>
        <SplitLayout
          left={
            <TabbedPane
              prefix="left"
              form={<ResearchForm versions={versions ?? []} />}
              preview={<ResearchPreview />}
              humId={humId}
              originalUrl={research?.url.ja ?? null}
              showOriginalIframe={debugOriginal !== "off"}
            />
          }
          right={
            <TabbedPane
              prefix="right"
              form={<ResearchForm versions={versions ?? []} />}
              preview={<ResearchPreview />}
              humId={humId}
              originalUrl={research?.url.ja ?? null}
              showOriginalIframe={debugOriginal !== "off"}
            />
          }
        />
      </Box>
      <AppFooter />
    </Box>
  )
}

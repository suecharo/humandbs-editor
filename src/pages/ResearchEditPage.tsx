import NavigateNextIcon from "@mui/icons-material/NavigateNext"
import Alert from "@mui/material/Alert"
import Box from "@mui/material/Box"
import Breadcrumbs from "@mui/material/Breadcrumbs"
import CircularProgress from "@mui/material/CircularProgress"
import Container from "@mui/material/Container"
import Typography from "@mui/material/Typography"
import { Link, useBlocker } from "@tanstack/react-router"
import { useAtom, useAtomValue, useSetAtom } from "jotai"
import { useCallback, useEffect } from "react"

import { AppFooter } from "../components/layout/AppFooter"
import { SplitLayout } from "../components/layout/SplitLayout"
import { ResearchForm } from "../components/research-edit/ResearchForm"
import { BasicInfoSection } from "../components/research-edit/sections/BasicInfoSection"
import { TabbedPane } from "../components/research-edit/TabbedPane"
import { useCurationStatus, useUpdateSectionStatus } from "../hooks/use-curation-status"
import { useResearch } from "../hooks/use-research"
import { useResearchVersions } from "../hooks/use-research-versions"
import { useSaveResearch } from "../hooks/use-save-research"
import { useSaveResearchVersions } from "../hooks/use-save-research-versions"
import { researchEditRoute } from "../router"
import type { SectionCurationStatus } from "../schemas/editor-state"
import type { ResearchVersion } from "../schemas/research-version"
import { dirtyAtom, researchDraftAtom, researchServerAtom, versionsDraftAtom, versionsServerAtom } from "../stores/research-edit"
import { FOOTER_HEIGHT, HEADER_HEIGHT, SUBSECTION_GAP } from "../theme"
import { RESEARCH_SECTION_IDS } from "../utils/curation"

export const ResearchEditPage = () => {
  const { humId } = researchEditRoute.useParams()
  const { debugOriginal } = researchEditRoute.useSearch()
  const { data: research, isLoading, error } = useResearch(humId)
  const { data: versions } = useResearchVersions(humId)
  const { data: curationData } = useCurationStatus(humId)
  const updateSectionStatus = useUpdateSectionStatus(humId)
  const saveMutation = useSaveResearch(humId)
  const saveVersionsMutation = useSaveResearchVersions(humId)
  const [server, setServer] = useAtom(researchServerAtom)
  const setDraft = useSetAtom(researchDraftAtom)
  const draft = useAtomValue(researchDraftAtom)
  const [versionsServer, setVersionsServer] = useAtom(versionsServerAtom)
  const [versionsDraft, setVersionsDraft] = useAtom(versionsDraftAtom)
  const dirty = useAtomValue(dirtyAtom)

  useEffect(() => {
    if (research) {
      setServer(research)
      setDraft(structuredClone(research))
    }
  }, [research, setServer, setDraft])

  useEffect(() => {
    if (versions) {
      setVersionsServer(versions)
      setVersionsDraft(structuredClone(versions))
    }
  }, [versions, setVersionsServer, setVersionsDraft])

  useEffect(() => () => {
    setServer(null)
    setDraft(null)
    setVersionsServer([])
    setVersionsDraft([])
  }, [setServer, setDraft, setVersionsServer, setVersionsDraft])

  // Navigation guard: in-app navigation (TanStack Router)
  useBlocker({
    shouldBlockFn: useCallback(() => {
      if (!dirty) return false

      return !window.confirm("未保存の変更があります。このページを離れますか？")
    }, [dirty]),
  })

  // Navigation guard: browser reload / tab close
  useEffect(() => {
    if (!dirty) return

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault()
    }
    window.addEventListener("beforeunload", handleBeforeUnload)

    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [dirty])

  const handleSave = () => {
    if (!draft) return
    saveMutation.mutate(draft, {
      onSuccess: (saved) => {
        setServer(saved)
        setDraft(structuredClone(saved))
      },
    })
    if (versionsDraft.length > 0) {
      saveVersionsMutation.mutate(versionsDraft, {
        onSuccess: (saved) => {
          setVersionsServer(saved)
          setVersionsDraft(structuredClone(saved))
        },
      })
    }
  }

  const handleDiscardChanges = () => {
    if (server) setDraft(structuredClone(server))
    setVersionsDraft(structuredClone(versionsServer))
  }

  const handleVersionChange = (updated: ResearchVersion) => {
    setVersionsDraft((prev) =>
      prev.map((v) => v.humVersionId === updated.humVersionId ? updated : v),
    )
  }

  const handleToggleSection = (sectionId: string) => {
    const current = curationData?.sectionStatuses[sectionId] ?? "uncurated"
    const next: SectionCurationStatus = current === "curated" ? "uncurated" : "curated"
    updateSectionStatus.mutate({ [sectionId]: next })
  }

  const handleSetAllSections = (status: SectionCurationStatus) => {
    const allStatuses = Object.fromEntries(
      RESEARCH_SECTION_IDS.map((id) => [id, status]),
    ) as Record<string, SectionCurationStatus>
    updateSectionStatus.mutate(allStatuses)
  }

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

  const sectionStatuses = curationData?.sectionStatuses ?? {}

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
              <BasicInfoSection
                research={research}
                versions={versionsDraft}
                curationStatus={curationData?.status ?? "uncurated"}
                dirty={dirty}
                saving={saveMutation.isPending || saveVersionsMutation.isPending}
                onSave={handleSave}
                onDiscardChanges={handleDiscardChanges}
                onSetAllSections={handleSetAllSections}
                onVersionChange={handleVersionChange}
              />
            </Box>
          )}
        </Container>
      </Box>
      {dirty && (
        <Alert severity="info" sx={{ borderRadius: 0 }}>
          Unsaved changes
        </Alert>
      )}
      <Box sx={{ position: "sticky", top: 0, height: `calc(100vh - ${HEADER_HEIGHT} - ${FOOTER_HEIGHT})` }}>
        <SplitLayout
          left={
            <TabbedPane
              prefix="left"
              form={
                <ResearchForm
                  versions={versions ?? []}
                  sectionStatuses={sectionStatuses}
                  onToggleSection={handleToggleSection}
                />
              }
              humId={humId}
              originalUrls={{ ja: research?.url.ja ?? null, en: research?.url.en ?? null }}
              showOriginalIframe={debugOriginal !== "off"}
            />
          }
          right={
            <TabbedPane
              prefix="right"
              form={
                <ResearchForm
                  versions={versions ?? []}
                  sectionStatuses={sectionStatuses}
                  onToggleSection={handleToggleSection}
                />
              }
              humId={humId}
              originalUrls={{ ja: research?.url.ja ?? null, en: research?.url.en ?? null }}
              showOriginalIframe={debugOriginal !== "off"}
              initialTabIndex={1}
            />
          }
        />
      </Box>
      <Box sx={{ position: "relative", zIndex: 1 }}>
        <AppFooter />
      </Box>
    </Box>
  )
}

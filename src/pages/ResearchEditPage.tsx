import NavigateNextIcon from "@mui/icons-material/NavigateNext"
import Alert from "@mui/material/Alert"
import Box from "@mui/material/Box"
import Breadcrumbs from "@mui/material/Breadcrumbs"
import CircularProgress from "@mui/material/CircularProgress"
import Container from "@mui/material/Container"
import Typography from "@mui/material/Typography"
import { Link, useBlocker, useNavigate } from "@tanstack/react-router"
import equal from "fast-deep-equal"
import { useAtom, useAtomValue, useSetAtom } from "jotai"
import { useCallback, useEffect, useRef, useState } from "react"

import { ConfirmDialog } from "../components/common/ConfirmDialog"
import { LockConflictDialog } from "../components/common/LockConflictDialog"
import { AppFooter } from "../components/layout/AppFooter"
import { SplitLayout } from "../components/layout/SplitLayout"
import { ResearchForm } from "../components/research-edit/ResearchForm"
import { BasicInfoSection } from "../components/research-edit/sections/BasicInfoSection"
import { DatasetsSection } from "../components/research-edit/sections/DatasetsSection"
import { TabbedPane } from "../components/research-edit/TabbedPane"
import { PanelSideProvider } from "../contexts/panel-side"
import { useCurationStatus, useUpdateSectionStatus } from "../hooks/use-curation-status"
import { useHeartbeat } from "../hooks/use-heartbeat"
import { LockConflictError, useAcquireLock } from "../hooks/use-lock"
import { useResearch } from "../hooks/use-research"
import { useResearchVersions } from "../hooks/use-research-versions"
import { useSaveDataset } from "../hooks/use-save-dataset"
import { useSaveResearch } from "../hooks/use-save-research"
import { useSaveResearchVersions } from "../hooks/use-save-research-versions"
import { researchEditRoute } from "../router"
import type { SectionCurationStatus } from "../schemas/editor-state"
import type { ResearchVersion } from "../schemas/research-version"
import { datasetModifiedAtsAtom, datasetsDraftAtom, datasetsServerAtom, dirtyAtom, fileModifiedAtAtom, researchDraftAtom, researchServerAtom, versionsDraftAtom, versionsServerAtom } from "../stores/research-edit"
import { userNameAtom } from "../stores/user"
import { FOOTER_HEIGHT, HEADER_HEIGHT, INLINE_ICON_SIZE, SUBSECTION_GAP } from "../theme"
import { RESEARCH_SECTION_IDS } from "../utils/curation"
import { ConflictError } from "../utils/fetch-api"

type ViewMode = "pending" | "editing" | "readOnly"

export const ResearchEditPage = () => {
  const { humId } = researchEditRoute.useParams()
  const { debugOriginal } = researchEditRoute.useSearch()
  const navigate = useNavigate()
  const userName = useAtomValue(userNameAtom)
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
  const datasetsServerVal = useAtomValue(datasetsServerAtom)
  const datasetsDraftVal = useAtomValue(datasetsDraftAtom)
  const setDatasetsServer = useSetAtom(datasetsServerAtom)
  const setDatasetsDraft = useSetAtom(datasetsDraftAtom)
  const setFileModifiedAt = useSetAtom(fileModifiedAtAtom)
  const setDatasetModifiedAts = useSetAtom(datasetModifiedAtsAtom)
  const datasetSaveMutation = useSaveDataset()
  const dirty = useAtomValue(dirtyAtom)

  // Lock state
  const [viewMode, setViewMode] = useState<ViewMode>("pending")
  const [lockConflict, setLockConflict] = useState<{ editingByName: string; editingAt: string } | null>(null)
  const [conflictDialogOpen, setConflictDialogOpen] = useState(false)
  const acquireLock = useAcquireLock()
  const lockAcquiredRef = useRef(false)

  // Heartbeat
  useHeartbeat(humId, userName, viewMode === "editing")

  // Acquire lock on mount
  useEffect(() => {
    if (!userName || lockAcquiredRef.current) return
    lockAcquiredRef.current = true

    acquireLock.mutate(
      { humId, userName },
      {
        onSuccess: () => setViewMode("editing"),
        onError: (err) => {
          if (err instanceof LockConflictError) {
            setLockConflict({
              editingByName: err.lockInfo.editingByName,
              editingAt: err.lockInfo.editingAt,
            })
          } else {
            // On error (e.g. network), allow editing anyway
            setViewMode("editing")
          }
        },
      },
    )
  }, [userName, humId, acquireLock])

  // Release lock on unmount / page hide
  useEffect(() => {
    if (!userName) return

    const releaseLock = () => {
      fetch(`/api/lock/research/${encodeURIComponent(humId)}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userName }),
        keepalive: true,
      }).catch(() => {
        // Best effort
      })
    }

    const handlePageHide = () => releaseLock()
    window.addEventListener("pagehide", handlePageHide)

    return () => {
      window.removeEventListener("pagehide", handlePageHide)
      releaseLock()
    }
  }, [humId, userName])

  // LockConflictDialog handlers
  const handleGoBack = () => {
    navigate({ to: "/" })
  }

  const handleReadOnly = () => {
    setLockConflict(null)
    setViewMode("readOnly")
  }

  const handleForceEdit = () => {
    acquireLock.mutate(
      { humId, userName, force: true },
      {
        onSuccess: () => {
          setLockConflict(null)
          setViewMode("editing")
        },
      },
    )
  }

  const handleSwitchToEditing = () => {
    acquireLock.mutate(
      { humId, userName, force: true },
      {
        onSuccess: () => setViewMode("editing"),
        onError: (err) => {
          if (err instanceof LockConflictError) {
            setLockConflict({
              editingByName: err.lockInfo.editingByName,
              editingAt: err.lockInfo.editingAt,
            })
          }
        },
      },
    )
  }

  // Sync research data to atoms
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

  // Cleanup atoms on unmount
  useEffect(() => () => {
    setServer(null)
    setDraft(null)
    setVersionsServer([])
    setVersionsDraft([])
    setDatasetsServer({})
    setDatasetsDraft({})
    setFileModifiedAt(null)
    setDatasetModifiedAts({})
  }, [setServer, setDraft, setVersionsServer, setVersionsDraft, setDatasetsServer, setDatasetsDraft, setFileModifiedAt, setDatasetModifiedAts])

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

  // Optimistic lock conflict on save
  const handleSaveConflict = () => {
    setConflictDialogOpen(false)
    // Invalidate queries to reload fresh data
    saveMutation.reset()
  }

  const handleSave = () => {
    if (!draft) return
    saveMutation.mutate(draft, {
      onSuccess: ({ data: saved }) => {
        setServer(saved)
        setDraft(structuredClone(saved))
      },
      onError: (err) => {
        if (err instanceof ConflictError) {
          setConflictDialogOpen(true)
        }
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

    // Dirty datasets を並列保存
    for (const [key, draftDs] of Object.entries(datasetsDraftVal)) {
      if (!datasetsServerVal[key] || equal(datasetsServerVal[key], draftDs)) continue
      datasetSaveMutation.mutate(draftDs, {
        onSuccess: ({ data: saved }) => {
          const savedKey = `${saved.datasetId}-${saved.version}`
          setDatasetsServer((prev) => ({ ...prev, [savedKey]: saved }))
          setDatasetsDraft((prev) => ({ ...prev, [savedKey]: structuredClone(saved) }))
        },
        onError: (err) => {
          if (err instanceof ConflictError) {
            setConflictDialogOpen(true)
          }
        },
      })
    }
  }

  const handleDiscardChanges = () => {
    if (server) setDraft(structuredClone(server))
    setVersionsDraft(structuredClone(versionsServer))
    setDatasetsDraft(structuredClone(datasetsServerVal))
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
    const datasetKeys = Object.keys(sectionStatuses).filter((k) => k.startsWith("dataset:"))
    const allStatuses = Object.fromEntries(
      [...RESEARCH_SECTION_IDS, ...datasetKeys].map((id) => [id, status]),
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
  const isReadOnly = viewMode === "readOnly"

  return (
    <Box sx={{ height: "100%", overflow: "auto" }}>
      {/* Lock conflict dialog */}
      {lockConflict && (
        <LockConflictDialog
          open
          editingByName={lockConflict.editingByName}
          editingAt={lockConflict.editingAt}
          onGoBack={handleGoBack}
          onReadOnly={handleReadOnly}
          onForceEdit={handleForceEdit}
        />
      )}

      {/* Optimistic lock conflict dialog */}
      <ConfirmDialog
        open={conflictDialogOpen}
        title="保存の競合"
        confirmLabel="閉じる"
        confirmColor="primary"
        onConfirm={handleSaveConflict}
        onCancel={handleSaveConflict}
      >
        他のユーザーがデータを更新しました。ページをリロードして最新のデータを読み込み直してください。
      </ConfirmDialog>

      <Box sx={{ bgcolor: "background.default" }}>
        <Container sx={{ pt: SUBSECTION_GAP }}>
          <Breadcrumbs sx={{ mb: SUBSECTION_GAP }} separator={<NavigateNextIcon sx={{ fontSize: INLINE_ICON_SIZE }} />}>
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
                saving={saveMutation.isPending || saveVersionsMutation.isPending || datasetSaveMutation.isPending}
                onSave={handleSave}
                onDiscardChanges={handleDiscardChanges}
                onSetAllSections={handleSetAllSections}
                onVersionChange={handleVersionChange}
                viewMode={viewMode === "pending" ? "editing" : viewMode}
                editingByName={lockConflict?.editingByName}
                onForceEdit={handleSwitchToEditing}
              />
            </Box>
          )}
        </Container>
      </Box>
      <Box sx={{ position: "sticky", top: 0, height: `calc(100vh - ${HEADER_HEIGHT} - ${FOOTER_HEIGHT})` }}>
        <SplitLayout
          left={
            <PanelSideProvider side="left">
              <TabbedPane
                prefix="left"
                form={
                  <ResearchForm
                    sectionStatuses={sectionStatuses}
                    onToggleSection={handleToggleSection}
                    readOnly={isReadOnly}
                  />
                }
                datasetSection={draft && (
                  <DatasetsSection
                    humId={humId}
                    versions={versions ?? []}
                    latestVersionId={draft.latestVersion}
                    sectionStatuses={sectionStatuses}
                    onToggleSection={handleToggleSection}
                    readOnly={isReadOnly}
                  />
                )}
                humId={humId}
                originalUrls={{ ja: research?.url.ja ?? null, en: research?.url.en ?? null }}
                showOriginalIframe={debugOriginal !== "off"}
              />
            </PanelSideProvider>
          }
          right={
            <PanelSideProvider side="right">
              <TabbedPane
                prefix="right"
                form={
                  <ResearchForm
                    sectionStatuses={sectionStatuses}
                    onToggleSection={handleToggleSection}
                    readOnly={isReadOnly}
                  />
                }
                datasetSection={draft && (
                  <DatasetsSection
                    humId={humId}
                    versions={versions ?? []}
                    latestVersionId={draft.latestVersion}
                    sectionStatuses={sectionStatuses}
                    onToggleSection={handleToggleSection}
                    readOnly={isReadOnly}
                  />
                )}
                humId={humId}
                originalUrls={{ ja: research?.url.ja ?? null, en: research?.url.en ?? null }}
                showOriginalIframe={debugOriginal !== "off"}
                initialTabIndex={2}
              />
            </PanelSideProvider>
          }
        />
      </Box>
      <Box sx={{ position: "relative", zIndex: 1 }}>
        <AppFooter />
      </Box>
    </Box>
  )
}

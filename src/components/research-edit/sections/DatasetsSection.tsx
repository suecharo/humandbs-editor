import AddOutlined from "@mui/icons-material/AddOutlined"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import Stack from "@mui/material/Stack"
import Typography from "@mui/material/Typography"
import { useQueries } from "@tanstack/react-query"
import { useSetAtom } from "jotai"
import { useEffect, useState } from "react"

import { ConfirmDialog } from "@/components/common/ConfirmDialog"
import { useDeleteDataset } from "@/hooks/use-delete-dataset"
import type { Dataset } from "@/schemas/dataset"
import { DatasetSchema } from "@/schemas/dataset"
import type { SectionCurationStatus } from "@/schemas/editor-state"
import type { ResearchVersion } from "@/schemas/research-version"
import { datasetsDraftAtom, datasetsServerAtom } from "@/stores/research-edit"
import { FIELD_GROUP_GAP, SUBSECTION_GAP } from "@/theme"
import { fetchApi } from "@/utils/fetch-api"

import { DatasetAddDialog } from "./DatasetAddDialog"
import { DatasetCard } from "./DatasetCard"

interface DatasetsSectionProps {
  humId: string
  versions: ResearchVersion[]
  latestVersionId: string
  sectionStatuses: Record<string, SectionCurationStatus>
  onToggleSection: (sectionId: string) => void
  readOnly?: boolean
}

export const DatasetsSection = ({ humId, versions, latestVersionId, sectionStatuses, onToggleSection, readOnly: _readOnly }: DatasetsSectionProps) => {
  const latestVersion = versions.find((v) => v.humVersionId === latestVersionId) ?? versions.at(-1)
  const datasetRefs = latestVersion?.datasets ?? []

  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<{ datasetId: string; version: string } | null>(null)

  const deleteMutation = useDeleteDataset(humId)
  const setDatasetsServer = useSetAtom(datasetsServerAtom)
  const setDatasetsDraft = useSetAtom(datasetsDraftAtom)

  const datasetQueries = useQueries({
    queries: datasetRefs.map((ref) => {
      const key = `${ref.datasetId}-${ref.version}`

      return {
        queryKey: ["dataset", key],
        queryFn: () => fetchApi(`/api/datasets/${encodeURIComponent(key)}`, DatasetSchema),
      }
    }),
  })

  // Sync query results → Jotai atoms
  const allLoaded = datasetQueries.every((q) => q.isSuccess)
  const queryDataKey = datasetQueries.map((q) => q.dataUpdatedAt).join(",")

  useEffect(() => {
    if (!allLoaded) return
    const serverMap: Record<string, Dataset> = {}
    for (const query of datasetQueries) {
      if (query.data) {
        const key = `${query.data.datasetId}-${query.data.version}`
        serverMap[key] = query.data
      }
    }
    if (Object.keys(serverMap).length === 0) return

    setDatasetsServer(serverMap)
    setDatasetsDraft((prev) => {
      if (Object.keys(prev).length === 0) return structuredClone(serverMap)
      const next = { ...prev }
      for (const key of Object.keys(serverMap)) {
        const serverDs = serverMap[key]
        if (!(key in next) && serverDs) next[key] = structuredClone(serverDs)
      }

      return next
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps -- queryDataKey captures data freshness
  }, [queryDataKey, allLoaded, setDatasetsServer, setDatasetsDraft])

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return

    const key = `${deleteTarget.datasetId}-${deleteTarget.version}`
    deleteMutation.mutate(key, {
      onSuccess: () => {
        setDeleteTarget(null)
        setDatasetsServer((prev) => {
          const { [key]: _, ...rest } = prev

          return rest
        })
        setDatasetsDraft((prev) => {
          const { [key]: _, ...rest } = prev

          return rest
        })
      },
    })
  }

  return (
    <>
      <Box sx={{ mb: SUBSECTION_GAP }}>
        <Button
          variant="outlined"
          size="small"
          startIcon={<AddOutlined />}
          onClick={() => setAddDialogOpen(true)}
        >
          Add Dataset
        </Button>
      </Box>

      <Stack spacing={FIELD_GROUP_GAP}>
        {datasetRefs.length === 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>
            No datasets added yet.
          </Typography>
        )}

        {datasetRefs.map((ref, index) => {
          const key = `${ref.datasetId}-${ref.version}`
          const query = datasetQueries[index]

          return (
            <DatasetCard
              key={key}
              datasetKey={key}
              datasetId={ref.datasetId}
              version={ref.version}
              isLoading={query?.isLoading ?? true}
              curationStatus={sectionStatuses[`dataset:${key}`] ?? "uncurated"}
              onToggleCuration={() => onToggleSection(`dataset:${key}`)}
              onRemove={() => setDeleteTarget(ref)}
            />
          )
        })}
      </Stack>

      <DatasetAddDialog
        open={addDialogOpen}
        humId={humId}
        humVersionId={latestVersion?.humVersionId ?? ""}
        onClose={() => setAddDialogOpen(false)}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        title="データセットの削除"
        confirmLabel="削除"
        confirmColor="error"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      >
        {deleteTarget ? `${deleteTarget.datasetId} (${deleteTarget.version}) を削除しますか？この操作は取り消せません。` : ""}
      </ConfirmDialog>
    </>
  )
}

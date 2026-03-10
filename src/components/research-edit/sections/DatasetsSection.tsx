import AddOutlined from "@mui/icons-material/AddOutlined"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import Stack from "@mui/material/Stack"
import Typography from "@mui/material/Typography"
import { useQueries } from "@tanstack/react-query"
import { useState } from "react"

import { ConfirmDialog } from "@/components/common/ConfirmDialog"
import { useDeleteDataset } from "@/hooks/use-delete-dataset"
import { DatasetSchema } from "@/schemas/dataset"
import type { SectionCurationStatus } from "@/schemas/editor-state"
import type { ResearchVersion } from "@/schemas/research-version"
import { fetchApi } from "@/utils/fetch-api"

import { SectionCurationToggle } from "../SectionCurationToggle"

import { DatasetAddDialog } from "./DatasetAddDialog"
import { DatasetCard } from "./DatasetCard"

interface DatasetsSectionProps {
  humId: string
  versions: ResearchVersion[]
  latestVersionId: string
  sectionStatus?: SectionCurationStatus | undefined
  onToggleStatus?: (() => void) | undefined
}

export const DatasetsSection = ({ humId, versions, latestVersionId, sectionStatus, onToggleStatus }: DatasetsSectionProps) => {
  const latestVersion = versions.find((v) => v.humVersionId === latestVersionId) ?? versions.at(-1)
  const datasetRefs = latestVersion?.datasets ?? []

  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<{ datasetId: string; version: string } | null>(null)

  const deleteMutation = useDeleteDataset(humId)

  const datasetQueries = useQueries({
    queries: datasetRefs.map((ref) => {
      const key = `${ref.datasetId}-${ref.version}`

      return {
        queryKey: ["dataset", key],
        queryFn: () => fetchApi(`/api/datasets/${encodeURIComponent(key)}`, DatasetSchema),
      }
    }),
  })

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return

    const key = `${deleteTarget.datasetId}-${deleteTarget.version}`
    deleteMutation.mutate(key, {
      onSuccess: () => setDeleteTarget(null),
    })
  }

  return (
    <>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
        <Button
          variant="outlined"
          size="small"
          startIcon={<AddOutlined />}
          onClick={() => setAddDialogOpen(true)}
        >
          Add Dataset
        </Button>
        {sectionStatus !== undefined && onToggleStatus && (
          <SectionCurationToggle status={sectionStatus} onToggle={onToggleStatus} />
        )}
      </Box>

      <Stack spacing={1.5}>
        {datasetRefs.length === 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>
            No datasets added yet.
          </Typography>
        )}

        {datasetRefs.map((ref, index) => {
          const query = datasetQueries[index]

          return (
            <DatasetCard
              key={`${ref.datasetId}-${ref.version}`}
              datasetId={ref.datasetId}
              version={ref.version}
              dataset={query?.data}
              isLoading={query?.isLoading ?? true}
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

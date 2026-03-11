import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown"
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp"
import OpenInNewIcon from "@mui/icons-material/OpenInNew"
import Alert from "@mui/material/Alert"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import Chip from "@mui/material/Chip"
import Collapse from "@mui/material/Collapse"
import IconButton from "@mui/material/IconButton"
import Link from "@mui/material/Link"
import Paper from "@mui/material/Paper"
import Table from "@mui/material/Table"
import TableBody from "@mui/material/TableBody"
import TableCell from "@mui/material/TableCell"
import TableContainer from "@mui/material/TableContainer"
import TableHead from "@mui/material/TableHead"
import TableRow from "@mui/material/TableRow"
import TextField from "@mui/material/TextField"
import Typography from "@mui/material/Typography"
import equal from "fast-deep-equal"
import { useAtomValue } from "jotai"
import { Fragment, useMemo, useState } from "react"

import { ConfirmDialog } from "@/components/common/ConfirmDialog"
import { CurationStatusChip } from "@/components/CurationStatusChip"
import { SectionHeader } from "@/components/SectionHeader"
import type { CurationStatus, SectionCurationStatus } from "@/schemas/editor-state"
import type { Research } from "@/schemas/research"
import type { ResearchVersion } from "@/schemas/research-version"
import { versionsServerAtom } from "@/stores/research-edit"
import { BUTTON_MIN_WIDTH_ACTION, COMPACT_GAP, FIELD_GROUP_GAP, FORM_LABEL_SX, INLINE_GAP, INLINE_ICON_SIZE, MODIFIED_FIELD_BG, MODIFIED_FIELD_SX, MONOSPACE_ID_SX, SECTION_GAP, SUBSECTION_GAP } from "@/theme"

interface BasicInfoSectionProps {
  research: Research
  versions: ResearchVersion[]
  curationStatus: CurationStatus
  dirty: boolean
  saving: boolean
  onSave: () => void
  onDiscardChanges: () => void
  onSetAllSections: (status: SectionCurationStatus) => void
  onVersionChange: (updated: ResearchVersion) => void
  viewMode: "editing" | "readOnly"
  editingByName?: string | undefined
  onForceEdit?: (() => void) | undefined
}

export const BasicInfoSection = ({
  research,
  versions,
  curationStatus,
  dirty,
  saving,
  onSave,
  onDiscardChanges,
  onSetAllSections,
  onVersionChange,
  viewMode,
  editingByName,
  onForceEdit,
}: BasicInfoSectionProps) => {
  const [expandedVersion, setExpandedVersion] = useState<string | null>(null)
  const [confirmAction, setConfirmAction] = useState<"save" | "discard" | "uncurated" | "curated" | null>(null)
  const versionsServer = useAtomValue(versionsServerAtom)

  const modifiedVersionIds = useMemo(() => {
    const ids = new Set<string>()
    for (const draftV of versions) {
      const serverV = versionsServer.find((s) => s.humVersionId === draftV.humVersionId)
      if (!serverV || !equal(serverV, draftV)) ids.add(draftV.humVersionId)
    }

    return ids
  }, [versions, versionsServer])

  const handleToggleExpand = (versionId: string) => {
    setExpandedVersion((prev) => (prev === versionId ? null : versionId))
  }

  const handleConfirm = () => {
    if (confirmAction === "save") onSave()
    else if (confirmAction === "discard") onDiscardChanges()
    else if (confirmAction === "uncurated") onSetAllSections("uncurated")
    else if (confirmAction === "curated") onSetAllSections("curated")
    setConfirmAction(null)
  }

  const isReadOnly = viewMode === "readOnly"

  return (
    <Paper variant="outlined" sx={{ p: SUBSECTION_GAP, display: "flex", flexDirection: "column", gap: SECTION_GAP }}>
      {/* Lock banner */}
      {viewMode === "editing" && (
        <Alert severity="info" sx={{ py: 0.5 }}>
          あなたが編集中です
        </Alert>
      )}
      {viewMode === "readOnly" && (
        <Alert
          severity="warning"
          sx={{ py: 0.5 }}
          action={
            onForceEdit && (
              <Button color="inherit" size="small" onClick={onForceEdit}>
                編集を開始する
              </Button>
            )
          }
        >
          {editingByName ? `${editingByName} さんが編集中のため閲覧のみです` : "閲覧モードです"}
        </Alert>
      )}

      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: INLINE_GAP }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: FIELD_GROUP_GAP }}>
          <SectionHeader title={research.humId} component="h1" />
          <CurationStatusChip status={curationStatus} />
        </Box>
        {!isReadOnly && (
          <Box sx={{ display: "flex", alignItems: "center", gap: INLINE_GAP, "& .MuiButton-root": { minWidth: BUTTON_MIN_WIDTH_ACTION } }}>
            <Button
              size="small"
              variant="outlined"
              color="success"
              onClick={() => setConfirmAction("curated")}
            >
              全て Curated
            </Button>
            <Button
              size="small"
              variant="outlined"
              color="warning"
              onClick={() => setConfirmAction("uncurated")}
            >
              全て Uncurated
            </Button>
            <Button
              size="small"
              variant="contained"
              color="primary"
              disabled={!dirty || saving}
              onClick={() => setConfirmAction("save")}
            >
              {saving ? "保存中…" : "保存"}
            </Button>
            <Button
              size="small"
              variant="outlined"
              disabled={!dirty}
              onClick={() => setConfirmAction("discard")}
            >
              変更を破棄
            </Button>
          </Box>
        )}
      </Box>

      <ConfirmDialog
        open={confirmAction === "save"}
        title="保存"
        confirmLabel="保存"
        confirmColor="primary"
        onConfirm={handleConfirm}
        onCancel={() => setConfirmAction(null)}
      >
        編集内容を保存しますか？
      </ConfirmDialog>

      <ConfirmDialog
        open={confirmAction === "discard"}
        title="変更を破棄"
        confirmLabel="破棄"
        confirmColor="primary"
        onConfirm={handleConfirm}
        onCancel={() => setConfirmAction(null)}
      >
        未保存の変更をすべて破棄し、サーバーの状態に戻します。この操作は元に戻せません。
      </ConfirmDialog>

      <ConfirmDialog
        open={confirmAction === "uncurated"}
        title="全て Uncurated に設定"
        confirmLabel="Uncurated に設定"
        confirmColor="warning"
        onConfirm={handleConfirm}
        onCancel={() => setConfirmAction(null)}
      >
        全セクションの curation 状態を Uncurated にリセットします。
      </ConfirmDialog>

      <ConfirmDialog
        open={confirmAction === "curated"}
        title="全て Curated に設定"
        confirmLabel="Curated に設定"
        confirmColor="success"
        onConfirm={handleConfirm}
        onCancel={() => setConfirmAction(null)}
      >
        全セクションの curation 状態を Curated に設定します。
      </ConfirmDialog>

      {/* Metadata */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: FIELD_GROUP_GAP }}>
        <MetaField label="URL (JA)" value={research.url.ja} isLink />
        <MetaField label="Published" value={research.datePublished} />
        <MetaField label="URL (EN)" value={research.url.en} isLink />
        <MetaField label="Modified" value={research.dateModified} />
      </Box>

      {/* Releases */}
      <Box>
        <Box sx={{ mb: SUBSECTION_GAP }}>
          <SectionHeader title="Releases" size="small" modified={modifiedVersionIds.size > 0} />
        </Box>
        <ReleasesTable
          versions={versions}
          versionsServer={versionsServer}
          expandedVersion={expandedVersion}
          onToggleExpand={handleToggleExpand}
          onVersionChange={onVersionChange}
          modifiedVersionIds={modifiedVersionIds}
        />
      </Box>
    </Paper>
  )
}

const MetaField = ({ label, value, isLink }: {
  label: string
  value: string | null | undefined
  isLink?: boolean | undefined
}) => (
  <Box>
    <Typography variant="body2" sx={{ ...FORM_LABEL_SX, mb: COMPACT_GAP }}>
      {label}
    </Typography>
    {isLink && value ? (
      <Link
        href={value}
        target="_blank"
        rel="noopener noreferrer"
        variant="body1"
        sx={{ display: "inline-flex", alignItems: "center", gap: COMPACT_GAP }}
      >
        {value}
        <OpenInNewIcon sx={{ fontSize: INLINE_ICON_SIZE }} />
      </Link>
    ) : (
      <Typography variant="body1">{value ?? "-"}</Typography>
    )}
  </Box>
)

const RELEASE_NOTE_MAX_LENGTH = 60

const getReleaseNoteSummary = (v: ResearchVersion): string => {
  const text = v.releaseNote.ja?.text || v.releaseNote.en?.text
  if (!text) return "-"

  return text.length > RELEASE_NOTE_MAX_LENGTH
    ? `${text.slice(0, RELEASE_NOTE_MAX_LENGTH)}…`
    : text
}

const ReleasesTable = ({ versions, versionsServer, expandedVersion, onToggleExpand, onVersionChange, modifiedVersionIds }: {
  versions: ResearchVersion[]
  versionsServer: ResearchVersion[]
  expandedVersion: string | null
  onToggleExpand: (versionId: string) => void
  onVersionChange: (updated: ResearchVersion) => void
  modifiedVersionIds: ReadonlySet<string>
}) => (
  <TableContainer>
    <Table size="small">
      <TableHead>
        <TableRow sx={{ "& > .MuiTableCell-root": { py: 0.625 } }}>
          <TableCell sx={{ width: 32, px: 0.5 }} />
          <TableCell>Version</TableCell>
          <TableCell>Release Date</TableCell>
          <TableCell>Release Note</TableCell>
          <TableCell align="center">Datasets</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {versions.map((v) => {
          const isExpanded = expandedVersion === v.humVersionId
          const isModified = modifiedVersionIds.has(v.humVersionId)
          const serverV = versionsServer.find((s) => s.humVersionId === v.humVersionId)

          return (
            <Fragment key={v.humVersionId}>
              <TableRow
                hover
                onClick={() => onToggleExpand(v.humVersionId)}
                sx={{
                  cursor: "pointer",
                  ...(isModified && { bgcolor: MODIFIED_FIELD_BG }),
                  "& > .MuiTableCell-root": {
                    py: 0.625,
                    ...(isExpanded && { borderBottomColor: "transparent" }),
                  },
                }}
              >
                <TableCell sx={{ width: 32, px: 0.5, verticalAlign: "middle", lineHeight: 0 }}>
                  <IconButton size="small" tabIndex={-1} sx={{ p: 0.25 }}>
                    {isExpanded ? <KeyboardArrowUpIcon fontSize="small" /> : <KeyboardArrowDownIcon fontSize="small" />}
                  </IconButton>
                </TableCell>
                <TableCell sx={MONOSPACE_ID_SX}>{v.version}</TableCell>
                <TableCell>{v.versionReleaseDate}</TableCell>
                <TableCell>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 360 }}
                  >
                    {getReleaseNoteSummary(v)}
                  </Typography>
                </TableCell>
                <TableCell align="center">{v.datasets.length}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell
                  colSpan={5}
                  sx={{ py: 0, ...(isExpanded ? {} : { borderBottom: 0 }) }}
                >
                  <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                    <Box
                      sx={{ py: FIELD_GROUP_GAP, px: SUBSECTION_GAP, display: "flex", flexDirection: "column", gap: FIELD_GROUP_GAP }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <TextField
                        label="Release Date"
                        size="small"
                        value={v.versionReleaseDate}
                        onChange={(e) => onVersionChange({
                          ...v,
                          versionReleaseDate: e.target.value,
                        })}
                        sx={{ maxWidth: 200, ...(serverV && serverV.versionReleaseDate !== v.versionReleaseDate ? MODIFIED_FIELD_SX : {}) }}
                      />
                      <TextField
                        label="Release Note (JA)"
                        size="small"
                        multiline
                        minRows={2}
                        value={v.releaseNote.ja?.text ?? ""}
                        onChange={(e) => onVersionChange({
                          ...v,
                          releaseNote: {
                            ...v.releaseNote,
                            ja: { rawHtml: v.releaseNote.ja?.rawHtml ?? "", text: e.target.value },
                          },
                        })}
                        sx={serverV && serverV.releaseNote.ja?.text !== v.releaseNote.ja?.text ? MODIFIED_FIELD_SX : undefined}
                      />
                      <TextField
                        label="Release Note (EN)"
                        size="small"
                        multiline
                        minRows={2}
                        value={v.releaseNote.en?.text ?? ""}
                        onChange={(e) => onVersionChange({
                          ...v,
                          releaseNote: {
                            ...v.releaseNote,
                            en: { rawHtml: v.releaseNote.en?.rawHtml ?? "", text: e.target.value },
                          },
                        })}
                        sx={serverV && serverV.releaseNote.en?.text !== v.releaseNote.en?.text ? MODIFIED_FIELD_SX : undefined}
                      />
                      <Box>
                        <Typography variant="body2" fontWeight={600} sx={{ mb: 0.5 }}>
                          Datasets
                        </Typography>
                        {v.datasets.length > 0 ? (
                          <Box sx={{ display: "flex", flexWrap: "wrap", gap: COMPACT_GAP }}>
                            {v.datasets.map((ds) => (
                              <Chip
                                key={`${ds.datasetId}-${ds.version}`}
                                label={`${ds.datasetId} (${ds.version})`}
                                size="small"
                                variant="outlined"
                                sx={{ fontFamily: "monospace" }}
                              />
                            ))}
                          </Box>
                        ) : (
                          <Typography variant="body2" color="text.secondary">-</Typography>
                        )}
                      </Box>
                    </Box>
                  </Collapse>
                </TableCell>
              </TableRow>
            </Fragment>
          )
        })}
        {versions.length === 0 && (
          <TableRow>
            <TableCell colSpan={5} align="center">
              <Typography variant="body2" color="text.secondary">No releases</Typography>
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  </TableContainer>
)

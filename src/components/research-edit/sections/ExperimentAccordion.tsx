import AddOutlined from "@mui/icons-material/AddOutlined"
import DeleteOutlined from "@mui/icons-material/DeleteOutlined"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import KeyboardArrowDownOutlined from "@mui/icons-material/KeyboardArrowDownOutlined"
import KeyboardArrowUpOutlined from "@mui/icons-material/KeyboardArrowUpOutlined"
import Accordion from "@mui/material/Accordion"
import AccordionDetails from "@mui/material/AccordionDetails"
import AccordionSummary from "@mui/material/AccordionSummary"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import Divider from "@mui/material/Divider"
import IconButton from "@mui/material/IconButton"
import TextField from "@mui/material/TextField"
import Tooltip from "@mui/material/Tooltip"
import Typography from "@mui/material/Typography"
import { useState } from "react"

import { SectionHeader } from "@/components/SectionHeader"
import type { Experiment, SearchableExperimentFields } from "@/schemas/dataset"
import { createDefaultSearchableFields } from "@/schemas/defaults"
import { FIELD_GROUP_GAP, FORM_LABEL_SX, SUBSECTION_GAP } from "@/theme"

import { SearchableFieldsEditor } from "./SearchableFieldsEditor"

interface ExperimentAccordionProps {
  experiment: Experiment
  index: number
  total: number
  onChange: (experiment: Experiment) => void
  onRemove: () => void
  onMoveUp: () => void
  onMoveDown: () => void
}

const experimentLabel = (experiment: Experiment, index: number): string => {
  const assayTypes = experiment.searchable?.assayType ?? []
  if (assayTypes.length > 0) return assayTypes.join(", ")

  return `Experiment ${index + 1}`
}

export const ExperimentAccordion = ({
  experiment,
  index,
  total,
  onChange,
  onRemove,
  onMoveUp,
  onMoveDown,
}: ExperimentAccordionProps) => {
  const [newKeyName, setNewKeyName] = useState("")

  const dataKeys = Object.keys(experiment.data)

  const handleAddDataKey = () => {
    const trimmed = newKeyName.trim()
    if (trimmed === "" || trimmed in experiment.data) return

    onChange({
      ...experiment,
      data: {
        ...experiment.data,
        [trimmed]: { ja: { text: "", rawHtml: "" }, en: { text: "", rawHtml: "" } },
      },
    })
    setNewKeyName("")
  }

  const handleRemoveDataKey = (key: string) => {
    const { [key]: _, ...rest } = experiment.data
    onChange({ ...experiment, data: rest })
  }

  const handleDataValueChange = (key: string, lang: "ja" | "en", text: string) => {
    const current = experiment.data[key]
    const langValue = current?.[lang]

    onChange({
      ...experiment,
      data: {
        ...experiment.data,
        [key]: {
          ...current,
          ja: current?.ja ?? null,
          en: current?.en ?? null,
          [lang]: langValue
            ? { ...langValue, text }
            : { text, rawHtml: "" },
        },
      },
    })
  }

  const handleSearchableChange = (searchable: SearchableExperimentFields) => {
    onChange({ ...experiment, searchable })
  }

  return (
    <Accordion>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, width: "100%" }}>
          <Typography sx={{ flexGrow: 1 }}>{experimentLabel(experiment, index)}</Typography>
          <Box sx={{ display: "flex", gap: 0.5 }} onClick={(e) => e.stopPropagation()}>
            <Tooltip title="Move Up">
              <span>
                <IconButton size="small" onClick={onMoveUp} disabled={index === 0}>
                  <KeyboardArrowUpOutlined fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title="Move Down">
              <span>
                <IconButton size="small" onClick={onMoveDown} disabled={index === total - 1}>
                  <KeyboardArrowDownOutlined fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title="Delete">
              <IconButton size="small" onClick={onRemove} color="error">
                <DeleteOutlined fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        {/* Data */}
        <SectionHeader title="Data" size="small" />
        <Box sx={{ display: "flex", flexDirection: "column", gap: SUBSECTION_GAP, mt: 1, mb: SUBSECTION_GAP }}>
          {dataKeys.map((key) => (
            <Box key={key}>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 0.5 }}>
                <Typography variant="body2" sx={FORM_LABEL_SX}>{key}</Typography>
                <Tooltip title="Delete key">
                  <IconButton size="small" onClick={() => handleRemoveDataKey(key)} color="error">
                    <DeleteOutlined sx={{ fontSize: "1rem" }} />
                  </IconButton>
                </Tooltip>
              </Box>
              <Box sx={{ display: "flex", flexDirection: "column", gap: FIELD_GROUP_GAP }}>
                <TextField
                  size="small"
                  label="JA"
                  value={experiment.data[key]?.ja?.text ?? ""}
                  onChange={(e) => handleDataValueChange(key, "ja", e.target.value)}
                  fullWidth
                  multiline
                  minRows={1}
                />
                <TextField
                  size="small"
                  label="EN"
                  value={experiment.data[key]?.en?.text ?? ""}
                  onChange={(e) => handleDataValueChange(key, "en", e.target.value)}
                  fullWidth
                  multiline
                  minRows={1}
                />
              </Box>
            </Box>
          ))}
          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            <TextField
              size="small"
              label="New key name"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  handleAddDataKey()
                }
              }}
            />
            <Button
              size="small"
              startIcon={<AddOutlined />}
              onClick={handleAddDataKey}
              disabled={newKeyName.trim() === ""}
            >
              キー追加
            </Button>
          </Box>
        </Box>

        <Divider sx={{ my: SUBSECTION_GAP }} />

        {/* Searchable fields */}
        <SectionHeader title="Searchable Fields" size="small" />
        <Box sx={{ mt: 1 }}>
          {experiment.searchable ? (
            <SearchableFieldsEditor
              fields={experiment.searchable}
              onChange={handleSearchableChange}
            />
          ) : (
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Searchable fields are not set.
              </Typography>
              <Button
                size="small"
                variant="outlined"
                onClick={() => onChange({ ...experiment, searchable: createDefaultSearchableFields() })}
              >
                Initialize Searchable Fields
              </Button>
            </Box>
          )}
        </Box>
      </AccordionDetails>
    </Accordion>
  )
}

import AddIcon from "@mui/icons-material/Add"
import DeleteIcon from "@mui/icons-material/Delete"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import IconButton from "@mui/material/IconButton"
import Paper from "@mui/material/Paper"
import TextField from "@mui/material/TextField"
import Typography from "@mui/material/Typography"

import { SectionHeader } from "@/components/SectionHeader"
import { useStableKeys } from "@/hooks/use-stable-keys"
import type { TextValue } from "@/schemas/common"
import type { Research } from "@/schemas/research"
import { FORM_FIELD_MAX_WIDTH, FORM_LABEL_SX, SUBSECTION_GAP } from "@/theme"

interface FootersSectionProps {
  draft: Research
  onChange: (updated: Research) => void
}

const FooterList = ({
  label,
  items,
  onChangeItem,
  onAdd,
  onRemove,
}: {
  label: string
  items: TextValue[]
  onChangeItem: (index: number, text: string) => void
  onAdd: () => void
  onRemove: (index: number) => void
}) => {
  const { keys, removeKey } = useStableKeys(items.length)

  return (
    <Box sx={{ mb: SUBSECTION_GAP }}>
      <Typography variant="body2" sx={{ ...FORM_LABEL_SX, mb: 1 }}>
        {label}
      </Typography>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1, maxWidth: FORM_FIELD_MAX_WIDTH }}>
        {items.map((item, i) => (
          <Box key={keys[i]} sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
            <TextField
              value={item.text}
              onChange={(e) => onChangeItem(i, e.target.value)}
              multiline
              minRows={1}
              fullWidth
            />
            <IconButton
              size="small"
              onClick={() => {
                removeKey(i)
                onRemove(i)
              }}
              color="error"
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        ))}
        <Button startIcon={<AddIcon />} size="small" onClick={onAdd} sx={{ alignSelf: "flex-start" }}>
          Add
        </Button>
      </Box>
    </Box>
  )
}

export const FootersSection = ({ draft, onChange }: FootersSectionProps) => {
  const { footers } = draft.summary

  const updateFooters = (
    lang: "ja" | "en",
    updater: (items: TextValue[]) => TextValue[],
  ) => {
    onChange({
      ...draft,
      summary: {
        ...draft.summary,
        footers: { ...footers, [lang]: updater(footers[lang]) },
      },
    })
  }

  return (
    <Paper variant="outlined" sx={{ p: SUBSECTION_GAP }}>
      <Box sx={{ mb: SUBSECTION_GAP }}>
        <SectionHeader title="Footers" size="small" />
      </Box>
      <FooterList
        label="JA"
        items={footers.ja}
        onChangeItem={(i, text) =>
          updateFooters("ja", (items) =>
            items.map((item, idx) => idx === i ? { ...item, text } : item),
          )
        }
        onAdd={() =>
          updateFooters("ja", (items) => [...items, { text: "", rawHtml: "" }])
        }
        onRemove={(i) =>
          updateFooters("ja", (items) => items.filter((_, idx) => idx !== i))
        }
      />
      <FooterList
        label="EN"
        items={footers.en}
        onChangeItem={(i, text) =>
          updateFooters("en", (items) =>
            items.map((item, idx) => idx === i ? { ...item, text } : item),
          )
        }
        onAdd={() =>
          updateFooters("en", (items) => [...items, { text: "", rawHtml: "" }])
        }
        onRemove={(i) =>
          updateFooters("en", (items) => items.filter((_, idx) => idx !== i))
        }
      />
    </Paper>
  )
}

import Autocomplete from "@mui/material/Autocomplete"
import Chip from "@mui/material/Chip"
import type { SxProps, Theme } from "@mui/material/styles"
import TextField from "@mui/material/TextField"

interface TagInputProps {
  label: string
  value: string[]
  onChange: (value: string[]) => void
  options?: string[]
  sx?: SxProps<Theme> | undefined
}

export const TagInput = ({ label, value, onChange, options = [], sx }: TagInputProps) => (
  <Autocomplete
    multiple
    freeSolo
    options={options}
    value={value}
    onChange={(_event, newValue) => onChange(newValue as string[])}
    renderTags={(tagValue, getTagProps) =>
      tagValue.map((option, index) => {
        const { key, ...rest } = getTagProps({ index })

        return <Chip key={key} label={option} size="small" {...rest} />
      })
    }
    renderInput={(params) => (
      <TextField {...params} label={label} />
    )}
    sx={sx}
  />
)

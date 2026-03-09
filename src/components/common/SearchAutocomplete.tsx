import SearchOutlined from "@mui/icons-material/SearchOutlined"
import Autocomplete from "@mui/material/Autocomplete"
import CircularProgress from "@mui/material/CircularProgress"
import InputAdornment from "@mui/material/InputAdornment"
import TextField from "@mui/material/TextField"
import type React from "react"

import { SEARCH_FIELD_SX } from "@/theme"

export interface SearchAutocompleteProps<T> {
  options: T[]
  loading: boolean
  inputValue: string
  onInputChange: (value: string) => void
  getOptionLabel: (option: T) => string
  isOptionEqualToValue: (a: T, b: T) => boolean
  onSelect: (value: T | null) => void
  renderOption: (props: React.HTMLAttributes<HTMLLIElement>, option: T) => React.ReactNode
  placeholder: string
  ariaLabel: string
  noOptionsText: string
  filterOptions?: (options: T[]) => T[]
}

// eslint-disable-next-line @stylistic/comma-dangle -- TSX generic requires trailing comma
export const SearchAutocomplete = <T,>({
  options,
  loading,
  inputValue,
  onInputChange,
  getOptionLabel,
  isOptionEqualToValue,
  onSelect,
  renderOption,
  placeholder,
  ariaLabel,
  noOptionsText,
  filterOptions,
}: SearchAutocompleteProps<T>) => (
  <Autocomplete
    size="small"
    fullWidth
    options={options}
    loading={loading}
    inputValue={inputValue}
    onInputChange={(_e, value) => onInputChange(value)}
    getOptionLabel={getOptionLabel}
    isOptionEqualToValue={isOptionEqualToValue}
    onChange={(_e, value) => onSelect(value)}
    filterOptions={filterOptions ?? ((x) => x)}
    noOptionsText={noOptionsText}
    renderOption={renderOption}
    renderInput={(params) => (
      <TextField
        {...(params as React.ComponentProps<typeof TextField>)}
        placeholder={placeholder}
        sx={SEARCH_FIELD_SX}
        slotProps={{
          input: {
            ...params.InputProps,
            startAdornment: (
              <InputAdornment position="start">
                <SearchOutlined fontSize="small" color="action" />
              </InputAdornment>
            ),
            endAdornment: (
              <>
                {loading && <CircularProgress color="inherit" size={18} />}
                {params.InputProps.endAdornment}
              </>
            ),
          },
          htmlInput: {
            ...params.inputProps,
            "aria-label": ariaLabel,
          },
        }}
      />
    )}
  />
)

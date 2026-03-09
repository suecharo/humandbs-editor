import Typography from "@mui/material/Typography"
import { useState } from "react"

import type { OrcidSearchResult } from "@/hooks/use-orcid-search"
import { useOrcidSearch } from "@/hooks/use-orcid-search"

import { SearchAutocomplete } from "./SearchAutocomplete"

export interface OrcidAutocompleteProps {
  onSelect: (result: OrcidSearchResult) => void
}

const formatOption = (r: OrcidSearchResult): string => {
  const name = [r.familyNames, r.givenNames].filter(Boolean).join(", ")
  const inst = r.institutionNames[0]

  return inst ? `${name} (${inst})` : name
}

export const OrcidAutocomplete = ({ onSelect }: OrcidAutocompleteProps) => {
  const [inputValue, setInputValue] = useState("")
  const { data, isLoading } = useOrcidSearch(inputValue)

  return (
    <SearchAutocomplete
      options={data}
      loading={isLoading}
      inputValue={inputValue}
      onInputChange={setInputValue}
      getOptionLabel={formatOption}
      isOptionEqualToValue={(a, b) => a.orcidId === b.orcidId}
      onSelect={(value) => {
        if (value !== null) {
          onSelect(value)
          setInputValue("")
        }
      }}
      noOptionsText={inputValue.length < 2 ? "Type to search ORCID" : "No results found"}
      placeholder="Type a name or ORCID to search..."
      ariaLabel="Search ORCID"
      renderOption={(props, option) => (
        <li {...props} key={option.orcidId}>
          <div>
            <Typography variant="body2">
              {[option.familyNames, option.givenNames].filter(Boolean).join(", ")}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {option.orcidId}
              {option.institutionNames.length > 0 && ` \u00b7 ${option.institutionNames[0]}`}
            </Typography>
          </div>
        </li>
      )}
    />
  )
}

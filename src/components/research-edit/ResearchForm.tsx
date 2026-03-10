import Box from "@mui/material/Box"
import { useAtom, useAtomValue } from "jotai"
import { useMemo } from "react"

import type { SectionCurationStatus } from "@/schemas/editor-state"
import { computeModifiedPaths, researchDraftAtom, researchServerAtom } from "@/stores/research-edit"
import { SECTION_GAP } from "@/theme"

import { ControlledAccessUserSection } from "./sections/ControlledAccessUserSection"
import { DataProviderSection } from "./sections/DataProviderSection"
import { GrantSection } from "./sections/GrantSection"
import { PublicationSection } from "./sections/PublicationSection"
import { SummarySection } from "./sections/SummarySection"
import { TitleSection } from "./sections/TitleSection"

interface ResearchFormProps {
  sectionStatuses: Record<string, SectionCurationStatus>
  onToggleSection: (sectionId: string) => void
}

export const ResearchForm = ({ sectionStatuses, onToggleSection }: ResearchFormProps) => {
  const [draft, setDraft] = useAtom(researchDraftAtom)
  const server = useAtomValue(researchServerAtom)

  const modifiedPaths = useMemo(() => {
    if (!server || !draft) return new Set<string>()

    return computeModifiedPaths(server, draft)
  }, [server, draft])

  if (!draft) return null

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: SECTION_GAP }}>
      <TitleSection
        draft={draft}
        onChange={setDraft}
        sectionStatus={sectionStatuses.title ?? "uncurated"}
        onToggleStatus={() => onToggleSection("title")}
        modifiedPaths={modifiedPaths}
      />
      <SummarySection
        draft={draft}
        onChange={setDraft}
        sectionStatus={sectionStatuses.summary ?? "uncurated"}
        onToggleStatus={() => onToggleSection("summary")}
        modifiedPaths={modifiedPaths}
      />
      <DataProviderSection
        draft={draft}
        onChange={setDraft}
        serverProviders={server?.dataProvider}
        serverProjects={server?.researchProject}
        sectionStatus={sectionStatuses.dataProvider ?? "uncurated"}
        onToggleStatus={() => onToggleSection("dataProvider")}
        sectionModified={modifiedPaths.has("dataProvider") || modifiedPaths.has("researchProject")}
      />
      <GrantSection
        draft={draft}
        onChange={setDraft}
        serverItems={server?.grant}
        sectionStatus={sectionStatuses.grant ?? "uncurated"}
        onToggleStatus={() => onToggleSection("grant")}
        sectionModified={modifiedPaths.has("grant")}
      />
      <PublicationSection
        draft={draft}
        onChange={setDraft}
        serverItems={server?.relatedPublication}
        sectionStatus={sectionStatuses.publication ?? "uncurated"}
        onToggleStatus={() => onToggleSection("publication")}
        sectionModified={modifiedPaths.has("relatedPublication")}
      />
      <ControlledAccessUserSection
        draft={draft}
        onChange={setDraft}
        serverItems={server?.controlledAccessUser}
        sectionStatus={sectionStatuses.controlledAccessUser ?? "uncurated"}
        onToggleStatus={() => onToggleSection("controlledAccessUser")}
        sectionModified={modifiedPaths.has("controlledAccessUser")}
      />
    </Box>
  )
}

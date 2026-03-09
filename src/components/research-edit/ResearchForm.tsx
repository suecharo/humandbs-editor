import Box from "@mui/material/Box"
import { useAtom } from "jotai"

import type { SectionCurationStatus } from "@/schemas/editor-state"
import type { ResearchVersion } from "@/schemas/research-version"
import { researchDraftAtom } from "@/stores/research-edit"
import { SECTION_GAP } from "@/theme"

import { ControlledAccessUserSection } from "./sections/ControlledAccessUserSection"
import { DataProviderSection } from "./sections/DataProviderSection"
import { DatasetsSection } from "./sections/DatasetsSection"
import { GrantSection } from "./sections/GrantSection"
import { PublicationSection } from "./sections/PublicationSection"
import { SummarySection } from "./sections/SummarySection"
import { TitleSection } from "./sections/TitleSection"

interface ResearchFormProps {
  versions: ResearchVersion[]
  sectionStatuses: Record<string, SectionCurationStatus>
  onToggleSection: (sectionId: string) => void
}

export const ResearchForm = ({ versions, sectionStatuses, onToggleSection }: ResearchFormProps) => {
  const [draft, setDraft] = useAtom(researchDraftAtom)

  if (!draft) return null

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: SECTION_GAP }}>
      <TitleSection
        draft={draft}
        onChange={setDraft}
        sectionStatus={sectionStatuses.title ?? "uncurated"}
        onToggleStatus={() => onToggleSection("title")}
      />
      <SummarySection
        draft={draft}
        onChange={setDraft}
        sectionStatus={sectionStatuses.summary ?? "uncurated"}
        onToggleStatus={() => onToggleSection("summary")}
      />
      <DatasetsSection
        versions={versions}
        latestVersionId={draft.latestVersion}
        sectionStatus={sectionStatuses.datasets ?? "uncurated"}
        onToggleStatus={() => onToggleSection("datasets")}
      />
      <DataProviderSection
        draft={draft}
        onChange={setDraft}
        sectionStatus={sectionStatuses.dataProvider ?? "uncurated"}
        onToggleStatus={() => onToggleSection("dataProvider")}
      />
      <GrantSection
        draft={draft}
        onChange={setDraft}
        sectionStatus={sectionStatuses.grant ?? "uncurated"}
        onToggleStatus={() => onToggleSection("grant")}
      />
      <PublicationSection
        draft={draft}
        onChange={setDraft}
        sectionStatus={sectionStatuses.publication ?? "uncurated"}
        onToggleStatus={() => onToggleSection("publication")}
      />
      <ControlledAccessUserSection
        draft={draft}
        onChange={setDraft}
        sectionStatus={sectionStatuses.controlledAccessUser ?? "uncurated"}
        onToggleStatus={() => onToggleSection("controlledAccessUser")}
      />
    </Box>
  )
}

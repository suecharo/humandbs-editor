import Box from "@mui/material/Box"
import { useAtom } from "jotai"

import type { ResearchVersion } from "@/schemas/research-version"
import { researchDraftAtom } from "@/stores/research-edit"
import { SECTION_GAP } from "@/theme"

import { BasicInfoSection } from "./sections/BasicInfoSection"
import { ControlledAccessUserSection } from "./sections/ControlledAccessUserSection"
import { DataProviderSection } from "./sections/DataProviderSection"
import { DatasetsSection } from "./sections/DatasetsSection"
import { FootersSection } from "./sections/FootersSection"
import { GrantSection } from "./sections/GrantSection"
import { PublicationSection } from "./sections/PublicationSection"
import { ResearchProjectSection } from "./sections/ResearchProjectSection"
import { SummarySection } from "./sections/SummarySection"
import { TitleSection } from "./sections/TitleSection"
import { VersionsSection } from "./sections/VersionsSection"

interface ResearchFormProps {
  versions: ResearchVersion[]
}

export const ResearchForm = ({ versions }: ResearchFormProps) => {
  const [draft, setDraft] = useAtom(researchDraftAtom)

  if (!draft) return null

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: SECTION_GAP }}>
      <BasicInfoSection research={draft} />
      <TitleSection draft={draft} onChange={setDraft} />
      <SummarySection draft={draft} onChange={setDraft} />
      <FootersSection draft={draft} onChange={setDraft} />
      <DataProviderSection draft={draft} onChange={setDraft} />
      <ResearchProjectSection draft={draft} onChange={setDraft} />
      <GrantSection draft={draft} onChange={setDraft} />
      <PublicationSection draft={draft} onChange={setDraft} />
      <ControlledAccessUserSection draft={draft} onChange={setDraft} />
      <VersionsSection versions={versions} />
      <DatasetsSection versions={versions} latestVersionId={draft.latestVersion} />
    </Box>
  )
}

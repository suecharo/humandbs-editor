import equal from "fast-deep-equal"

import { ActionCard } from "@/components/common/ActionCard"
import { BilingualCardContent, type BilingualRow } from "@/components/common/BilingualCardContent"
import { CollapsibleChips } from "@/components/common/CollapsibleChips"
import type { CardActions } from "@/components/common/ItemCardList"
import type { Grant } from "@/schemas/research"

interface GrantCardProps {
  grant: Grant
  actions: CardActions
  serverGrant?: Grant | undefined
}

export const GrantCard = ({ grant, actions, serverGrant }: GrantCardProps) => {
  const modified = serverGrant !== undefined ? !equal(grant, serverGrant) : false

  const rows: BilingualRow[] = [
    {
      label: "タイトル",
      ja: grant.title.ja,
      en: grant.title.en,
      jaModified: serverGrant ? grant.title.ja !== serverGrant.title.ja : false,
      enModified: serverGrant ? grant.title.en !== serverGrant.title.en : false,
    },
    {
      label: "助成金名",
      ja: grant.agency.name.ja,
      en: grant.agency.name.en,
      jaModified: serverGrant ? grant.agency.name.ja !== serverGrant.agency.name.ja : false,
      enModified: serverGrant ? grant.agency.name.en !== serverGrant.agency.name.en : false,
    },
  ]

  return (
    <ActionCard label="grant" actions={actions} modified={modified}>
      <BilingualCardContent rows={rows} />
      <CollapsibleChips ids={grant.id} />
    </ActionCard>
  )
}

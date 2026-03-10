import { createContext, useContext } from "react"

export type PanelSide = "left" | "right"

const PanelSideContext = createContext<PanelSide | null>(null)

export const PanelSideProvider = ({ side, children }: { side: PanelSide; children: React.ReactNode }) => (
  <PanelSideContext.Provider value={side}>
    {children}
  </PanelSideContext.Provider>
)

// eslint-disable-next-line react-refresh/only-export-components
export const usePanelSide = (): PanelSide | null => useContext(PanelSideContext)

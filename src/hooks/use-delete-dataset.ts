import { useMutation, useQueryClient } from "@tanstack/react-query"

export const useDeleteDataset = (humId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (datasetKey: string) => {
      const res = await fetch(`/api/datasets/${encodeURIComponent(datasetKey)}`, {
        method: "DELETE",
      })
      if (!res.ok) {
        throw new Error(`Failed to delete dataset: ${res.status}`)
      }
    },
    onSuccess: (_data, datasetKey) => {
      queryClient.removeQueries({ queryKey: ["dataset", datasetKey] })
      queryClient.invalidateQueries({ queryKey: ["research-versions", humId] })
    },
  })
}

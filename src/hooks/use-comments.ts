import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { z } from "zod/v4"

import { ResearchCommentSchema } from "../schemas/editor-state"
import type { ResearchComment } from "../schemas/editor-state"
import { fetchApi } from "../utils/fetch-api"

const CommentsResponseSchema = z.object({
  comments: z.array(ResearchCommentSchema),
})

const AddCommentResponseSchema = z.object({
  comment: ResearchCommentSchema,
})

export const useComments = (humId: string) =>
  useQuery({
    queryKey: ["comments", "research", humId],
    queryFn: async () => {
      const res = await fetchApi(
        `/api/comments/research/${encodeURIComponent(humId)}`,
        CommentsResponseSchema,
      )

      return res.comments
    },
  })

export const useAddComment = (humId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (body: { author: string; text: string }) => {
      const res = await fetchApi(
        `/api/comments/research/${encodeURIComponent(humId)}`,
        AddCommentResponseSchema,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        },
      )

      return res.comment
    },
    onSuccess: (newComment) => {
      queryClient.setQueryData(
        ["comments", "research", humId],
        (old: ResearchComment[] | undefined) => [...(old ?? []), newComment],
      )
    },
  })
}

export const useDeleteComment = (humId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (commentId: string) => {
      await fetchApi(
        `/api/comments/research/${encodeURIComponent(humId)}/${encodeURIComponent(commentId)}`,
        z.object({ deleted: z.literal(true) }),
        { method: "DELETE" },
      )

      return commentId
    },
    onSuccess: (deletedId) => {
      queryClient.setQueryData(
        ["comments", "research", humId],
        (old: ResearchComment[] | undefined) =>
          (old ?? []).filter((c) => c.id !== deletedId),
      )
    },
  })
}

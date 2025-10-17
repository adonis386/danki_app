import { z } from 'zod'

export const createReviewSchema = z.object({
  tienda_id: z.string().uuid('ID de tienda inválido'),
  pedido_id: z.string().uuid('ID de pedido inválido').optional(),
  rating: z.number()
    .int('El rating debe ser un número entero')
    .min(1, 'El rating mínimo es 1 estrella')
    .max(5, 'El rating máximo es 5 estrellas'),
  titulo: z.string()
    .min(3, 'El título debe tener al menos 3 caracteres')
    .max(100, 'El título no puede exceder 100 caracteres')
    .trim(),
  comentario: z.string()
    .max(1000, 'El comentario no puede exceder 1000 caracteres')
    .trim()
    .optional()
    .or(z.literal(''))
})

export const updateReviewSchema = z.object({
  rating: z.number()
    .int('El rating debe ser un número entero')
    .min(1, 'El rating mínimo es 1 estrella')
    .max(5, 'El rating máximo es 5 estrellas')
    .optional(),
  titulo: z.string()
    .min(3, 'El título debe tener al menos 3 caracteres')
    .max(100, 'El título no puede exceder 100 caracteres')
    .trim()
    .optional(),
  comentario: z.string()
    .max(1000, 'El comentario no puede exceder 1000 caracteres')
    .trim()
    .optional()
    .or(z.literal(''))
})

export const reviewVoteSchema = z.object({
  reseña_id: z.string().uuid('ID de reseña inválido'),
  es_util: z.boolean()
})

export const reviewResponseSchema = z.object({
  reseña_id: z.string().uuid('ID de reseña inválido'),
  tienda_id: z.string().uuid('ID de tienda inválido'),
  respuesta: z.string()
    .min(3, 'La respuesta debe tener al menos 3 caracteres')
    .max(500, 'La respuesta no puede exceder 500 caracteres')
    .trim()
})

export const updateReviewResponseSchema = z.object({
  respuesta: z.string()
    .min(3, 'La respuesta debe tener al menos 3 caracteres')
    .max(500, 'La respuesta no puede exceder 500 caracteres')
    .trim()
})

export type CreateReviewFormData = z.infer<typeof createReviewSchema>
export type UpdateReviewFormData = z.infer<typeof updateReviewSchema>
export type ReviewVoteFormData = z.infer<typeof reviewVoteSchema>
export type ReviewResponseFormData = z.infer<typeof reviewResponseSchema>
export type UpdateReviewResponseFormData = z.infer<typeof updateReviewResponseSchema>

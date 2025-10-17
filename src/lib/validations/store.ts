import { z } from 'zod'

export const storeSchema = z.object({
  nombre: z
    .string()
    .min(1, 'El nombre es requerido')
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  descripcion: z
    .string()
    .min(1, 'La descripción es requerida')
    .min(10, 'La descripción debe tener al menos 10 caracteres')
    .max(500, 'La descripción no puede exceder 500 caracteres'),
  categoria: z
    .string()
    .min(1, 'La categoría es requerida'),
  logo_url: z
    .string()
    .url('Debe ser una URL válida')
    .optional()
    .or(z.literal('')),
  imagen_portada: z
    .string()
    .url('Debe ser una URL válida')
    .optional()
    .or(z.literal('')),
  rating: z
    .number()
    .min(0, 'El rating no puede ser negativo')
    .max(5, 'El rating no puede ser mayor a 5')
    .default(0),
  num_resenas: z
    .number()
    .min(0, 'El número de reseñas no puede ser negativo')
    .default(0),
  tiempo_entrega: z
    .number()
    .min(1, 'El tiempo de entrega debe ser al menos 1 minuto')
    .max(180, 'El tiempo de entrega no puede exceder 180 minutos')
    .default(30),
  costo_envio: z
    .number()
    .min(0, 'El costo de envío no puede ser negativo')
    .default(0),
  certificado_calidad: z
    .boolean()
    .default(false),
  activo: z
    .boolean()
    .default(true),
})

export const storeUpdateSchema = storeSchema.partial()

export type StoreFormData = z.infer<typeof storeSchema>
export type StoreUpdateData = z.infer<typeof storeUpdateSchema>

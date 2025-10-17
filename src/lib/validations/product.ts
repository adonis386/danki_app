import { z } from 'zod'

export const productSchema = z.object({
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
  precio: z
    .number()
    .min(0.01, 'El precio debe ser mayor a 0')
    .max(9999.99, 'El precio no puede exceder $9999.99'),
  imagen_url: z
    .string()
    .url('Debe ser una URL válida')
    .optional()
    .or(z.literal('')),
  stock: z
    .number()
    .min(0, 'El stock no puede ser negativo')
    .max(9999, 'El stock no puede exceder 9999'),
  activo: z
    .boolean(),
  destacado: z
    .boolean(),
  tienda_id: z
    .string()
    .min(1, 'La tienda es requerida'),
  categoria_id: z
    .string()
    .optional()
    .or(z.literal('')),
})

export const productUpdateSchema = productSchema.partial()

export type ProductFormData = z.infer<typeof productSchema>
export type ProductUpdateData = z.infer<typeof productUpdateSchema>

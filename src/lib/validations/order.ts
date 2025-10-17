import { z } from 'zod'
import { OrderStatus } from '@/types/order'

export const createOrderSchema = z.object({
  items: z.array(z.object({
    product_id: z.string().min(1, 'ID del producto es requerido'),
    quantity: z.number().min(1, 'La cantidad debe ser al menos 1'),
    price: z.number().min(0.01, 'El precio debe ser mayor a 0'),
  })).min(1, 'Debe agregar al menos un producto'),
  delivery_address: z
    .string()
    .min(1, 'La dirección de entrega es requerida')
    .min(10, 'La dirección debe tener al menos 10 caracteres')
    .max(200, 'La dirección no puede exceder 200 caracteres'),
  delivery_phone: z
    .string()
    .min(1, 'El teléfono es requerido')
    .min(10, 'El teléfono debe tener al menos 10 dígitos')
    .max(15, 'El teléfono no puede exceder 15 dígitos'),
  delivery_notes: z
    .string()
    .max(300, 'Las notas no pueden exceder 300 caracteres')
    .optional()
    .or(z.literal('')),
  payment_method: z.enum(['cash', 'card'], {
    required_error: 'El método de pago es requerido',
  }),
  total: z.number().min(0.01, 'El total debe ser mayor a 0'),
  subtotal: z.number().min(0, 'El subtotal no puede ser negativo'),
  delivery_fee: z.number().min(0, 'La tarifa de delivery no puede ser negativa'),
  tax: z.number().min(0, 'El impuesto no puede ser negativo'),
})

export const updateOrderSchema = z.object({
  status: z.enum([
    'pending',
    'confirmed', 
    'preparing',
    'ready',
    'out_for_delivery',
    'delivered',
    'cancelled'
  ]).optional(),
  delivery_address: z
    .string()
    .min(10, 'La dirección debe tener al menos 10 caracteres')
    .max(200, 'La dirección no puede exceder 200 caracteres')
    .optional(),
  delivery_phone: z
    .string()
    .min(10, 'El teléfono debe tener al menos 10 dígitos')
    .max(15, 'El teléfono no puede exceder 15 dígitos')
    .optional(),
  delivery_notes: z
    .string()
    .max(300, 'Las notas no pueden exceder 300 caracteres')
    .optional(),
  estimated_delivery_time: z
    .number()
    .min(5, 'El tiempo estimado debe ser al menos 5 minutos')
    .max(180, 'El tiempo estimado no puede exceder 180 minutos')
    .optional(),
})

export type CreateOrderFormData = z.infer<typeof createOrderSchema>
export type UpdateOrderFormData = z.infer<typeof updateOrderSchema>

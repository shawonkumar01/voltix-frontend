import { z } from "zod";

// API Response Types
export const ApiResponseSchema = z.object({
  data: z.unknown(),
  message: z.string().optional(),
  success: z.boolean().optional(),
});

export type ApiResponse = z.infer<typeof ApiResponseSchema>;

// Product Types
export const ProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: z.number(),
  discount: z.number().optional(),
  description: z.string().optional(),
  images: z.array(z.string()).optional(),
  brand: z.string().optional(),
  stock: z.number().optional(),
  rating: z.number().optional(),
  reviewCount: z.number().optional(),
  isFeatured: z.boolean().optional(),
  category: z.object({
    id: z.string(),
    name: z.string(),
  }).optional(),
  specifications: z.record(z.string(), z.unknown()).optional(),
  sku: z.string().optional(),
  model: z.string().optional(),
  warranty: z.string().optional(),
  weight: z.number().optional(),
});

export type Product = z.infer<typeof ProductSchema>;

// User Types
export const UserSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string(),
  role: z.string(),
  avatar: z.string().optional(),
});

export type User = z.infer<typeof UserSchema>;

// Auth Types
export const LoginResponseSchema = z.object({
  user: UserSchema,
  token: z.string(),
});

export type LoginResponse = z.infer<typeof LoginResponseSchema>;

// Cart Types
export const CartItemSchema = z.object({
  id: z.string(),
  quantity: z.number(),
  product: ProductSchema,
});

export type CartItem = z.infer<typeof CartItemSchema>;

export const CartSchema = z.object({
  items: z.array(CartItemSchema),
  total: z.number(),
});

export type Cart = z.infer<typeof CartSchema>;

// Order Types
export const OrderSchema = z.object({
  id: z.string(),
  status: z.string(),
  total: z.number(),
  items: z.array(CartItemSchema),
  createdAt: z.string(),
  shippingAddress: z.record(z.string(), z.unknown()).optional(),
});

export type Order = z.infer<typeof OrderSchema>;

// Review Types
export const ReviewSchema = z.object({
  id: z.string(),
  rating: z.number(),
  title: z.string().optional(),
  comment: z.string(),
  helpfulCount: z.number().optional(),
  createdAt: z.string(),
  user: z.object({
    firstName: z.string(),
    lastName: z.string(),
    avatar: z.string().optional(),
  }).optional(),
});

export type Review = z.infer<typeof ReviewSchema>;

// Category Types
export const CategorySchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  image: z.string().optional(),
  _count: z.object({
    products: z.number(),
  }).optional(),
});

export type Category = z.infer<typeof CategorySchema>;

import { z } from "zod";
import { 
  ApiResponse, 
  Product, 
  Cart, 
  Order, 
  Review, 
  Category,
  ApiResponseSchema,
  ProductSchema,
  CartSchema,
  OrderSchema,
  ReviewSchema,
  CategorySchema
} from "@/types";

// Environment variable validation
const envSchema = z.object({
  NEXT_PUBLIC_API_URL: z.string().url().default("http://localhost:3001/api"),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().optional(),
});

const env = envSchema.parse({
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
});

export { env };

// Enhanced API response validation
export const validateApiResponse = <T>(schema: z.ZodType<T>, data: unknown): T => {
  const response = ApiResponseSchema.parse(data);
  return schema.parse(response.data);
};

// Specific API response validators
const ProductResponseSchema = z.array(ProductSchema);
const SingleProductResponseSchema = ProductSchema;
const CartResponseSchema = CartSchema;
const OrderResponseSchema = z.array(OrderSchema);
const ReviewResponseSchema = z.array(ReviewSchema);
const CategoryResponseSchema = z.array(CategorySchema);

// Type guards
export const isProduct = (data: unknown): data is Product => {
  return ProductSchema.safeParse(data).success;
};

export const isProductArray = (data: unknown): data is Product[] => {
  return ProductResponseSchema.safeParse(data).success;
};

export const isCart = (data: unknown): data is Cart => {
  return CartSchema.safeParse(data).success;
};

// Error handling utilities
export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export const handleApiError = (error: unknown): ApiError => {
  if (error instanceof ApiError) return error;
  
  if (error instanceof Error) {
    return new ApiError(error.message);
  }
  
  return new ApiError("An unexpected error occurred");
};

// Success response wrapper
export const createSuccessResponse = <T>(data: T, message?: string) => ({
  success: true,
  data,
  message: message || "Operation successful",
});

// Error response wrapper
export const createErrorResponse = (message: string, status?: number, code?: string) => ({
  success: false,
  error: message,
  status,
  code,
});

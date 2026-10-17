import "server-only";
import { z } from "zod";
import { saveProduct, hideProduct } from "@/repositories/admin-product.repository";

const schema = z.object({
  sku: z.string().trim().regex(/^[A-Za-z0-9-]{3,30}$/),
  name: z.string().trim().min(3).max(120),
  description: z.string().trim().min(5).max(1000),
  categoryId: z.number().int().positive(),
  priceVnd: z.number().int().positive().max(1000000000),
  stock: z.number().int().min(0).max(1000000),
  imagePath: z.string().regex(/^(?:\/images\/[a-zA-Z0-9._-]+\.(?:jpg|jpeg|png|webp)|\/api\/media\/upload-[0-9a-f-]{36}\.(?:jpg|png|webp))$/),
  occasion: z.string().trim().min(2).max(100),
  flowerStyle: z.string().trim().min(2).max(100),
  active: z.boolean(),
});

export async function upsertProduct(body: unknown, id?: number) {
  const data = schema.parse(body);
  return saveProduct(data, id);
}
export async function archiveProduct(id: number) { return hideProduct(id); }

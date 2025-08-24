import { z } from "zod";

export const dayHoursSchema = z
  .object({
    is_closed: z.boolean().optional(),
    is_24_hours: z.boolean().optional(),
    open_time: z.string().min(1).optional(),
    close_time: z.string().min(1).optional(),
  })
  .partial();

export const requestEditSchema = z.object({
  type: z.enum(["correction", "closure", "duplicate", "other"]),
  name: z.string().trim().optional(),
  address: z.string().trim().optional(),
  website_url: z
    .string()
    .trim()
    .url({ message: "Enter a valid URL" })
    .optional()
    .or(z.literal("").transform(() => undefined)),
  phone: z.string().trim().optional(),
  price_range: z
    .union([z.number().int().min(1).max(4), z.literal("")])
    .optional(),
  category_id: z.union([z.number().int().positive(), z.literal("")]).optional(),
  latitude: z.string().trim().optional(),
  longitude: z.string().trim().optional(),
  business_hours: z.record(z.string(), dayHoursSchema).optional(),
  message: z.string().trim().optional(),
  evidence_url: z
    .string()
    .trim()
    .url({ message: "Enter a valid URL" })
    .optional()
    .or(z.literal("").transform(() => undefined)),
  duplicate_target: z
    .object({ id: z.string(), name: z.string(), slug: z.string() })
    .nullable()
    .optional(),
});

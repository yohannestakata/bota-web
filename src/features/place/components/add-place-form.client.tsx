"use client";

import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/app/auth-context";
import { useToast } from "@/components/ui/toast";
import { getFriendlyErrorMessage } from "@/lib/errors";

const schema = z.object({
  name: z.string().min(2, "Please enter a name"),
  description: z.string().max(500).optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  website_url: z.string().url("Enter a valid URL").optional().or(z.literal("")),
  address_line1: z.string().optional().or(z.literal("")),
  address_line2: z.string().optional().or(z.literal("")),
  city: z.string().optional().or(z.literal("")),
  state: z.string().optional().or(z.literal("")),
  postal_code: z.string().optional().or(z.literal("")),
  country: z.string().optional().or(z.literal("")),
  latitude: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine(
      (v) =>
        v === "" ||
        (!Number.isNaN(Number(v)) && Number(v) >= -90 && Number(v) <= 90),
      { message: "Latitude must be between -90 and 90" },
    ),
  longitude: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine(
      (v) =>
        v === "" ||
        (!Number.isNaN(Number(v)) && Number(v) >= -180 && Number(v) <= 180),
      { message: "Longitude must be between -180 and 180" },
    ),
  category_id: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine((v) => v === "" || Number.isInteger(Number(v)), {
      message: "Select a category",
    }),
  price_range: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine((v) => v === "" || (Number(v) >= 1 && Number(v) <= 4), {
      message: "Price range is 1 (budget) to 4 (premium)",
    }),
});

type FormValues = z.infer<typeof schema>;

export default function AddPlaceForm({
  categories,
}: {
  categories: { id: number; name: string }[];
}) {
  const { user, isLoading } = useAuth();
  const { notify } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = handleSubmit(async (values) => {
    if (!user) {
      notify("Please sign in to continue.", "error");
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        owner_id: user.id,
        name: values.name,
        description: values.description || null,
        phone: values.phone || null,
        website_url: values.website_url || null,
        address_line1: values.address_line1 || null,
        address_line2: values.address_line2 || null,
        city: values.city || null,
        state: values.state || null,
        postal_code: values.postal_code || null,
        country: values.country || null,
        latitude: values.latitude ? Number(values.latitude) : undefined,
        longitude: values.longitude ? Number(values.longitude) : undefined,
        category_id: values.category_id
          ? Number(values.category_id)
          : undefined,
        price_range: values.price_range
          ? Number(values.price_range)
          : undefined,
      };

      const { data, error } = await supabase
        .from("places")
        .insert(payload)
        .select("id, slug")
        .single();

      if (error) throw error;

      notify("Place added. Thanks!", "success");
      reset();
      if (data?.slug) {
        window.setTimeout(() => {
          window.location.href = `/place/${data.slug}`;
        }, 600);
      }
    } catch (err) {
      notify(getFriendlyErrorMessage(err), "error");
    } finally {
      setSubmitting(false);
    }
  });

  if (isLoading) return null;
  if (!user) {
    return <div className="text-sm">Please sign in to add a place.</div>;
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="grid gap-4">
        <div>
          <label className="mb-1 block text-sm">Name</label>
          <input
            type="text"
            {...register("name")}
            className="border-input bg-background w-full rounded-md border px-3 py-2 focus:outline-none"
          />
          {errors.name && (
            <p className="text-destructive mt-1 text-xs">
              {errors.name.message as string}
            </p>
          )}
        </div>
        <div>
          <label className="mb-1 block text-sm">Description</label>
          <textarea
            rows={4}
            {...register("description")}
            className="border-input bg-background w-full rounded-md border px-3 py-2 focus:outline-none"
          />
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm">Phone</label>
            <input
              type="text"
              {...register("phone")}
              className="border-input bg-background w-full rounded-md border px-3 py-2 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm">Website</label>
            <input
              type="url"
              {...register("website_url")}
              className="border-input bg-background w-full rounded-md border px-3 py-2 focus:outline-none"
            />
            {errors.website_url && (
              <p className="text-destructive mt-1 text-xs">
                {errors.website_url.message as string}
              </p>
            )}
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm">Address line 1</label>
          <input
            type="text"
            {...register("address_line1")}
            className="border-input bg-background w-full rounded-md border px-3 py-2 focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm">Address line 2</label>
          <input
            type="text"
            {...register("address_line2")}
            className="border-input bg-background w-full rounded-md border px-3 py-2 focus:outline-none"
          />
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm">City</label>
            <input
              type="text"
              {...register("city")}
              className="border-input bg-background w-full rounded-md border px-3 py-2 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm">State</label>
            <input
              type="text"
              {...register("state")}
              className="border-input bg-background w-full rounded-md border px-3 py-2 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm">Postal code</label>
            <input
              type="text"
              {...register("postal_code")}
              className="border-input bg-background w-full rounded-md border px-3 py-2 focus:outline-none"
            />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm">Country</label>
          <input
            type="text"
            {...register("country")}
            className="border-input bg-background w-full rounded-md border px-3 py-2 focus:outline-none"
          />
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm">Latitude</label>
            <input
              type="number"
              step="any"
              {...register("latitude")}
              className="border-input bg-background w-full rounded-md border px-3 py-2 focus:outline-none"
            />
            {errors.latitude && (
              <p className="text-destructive mt-1 text-xs">
                {errors.latitude.message as string}
              </p>
            )}
          </div>
          <div>
            <label className="mb-1 block text-sm">Longitude</label>
            <input
              type="number"
              step="any"
              {...register("longitude")}
              className="border-input bg-background w-full rounded-md border px-3 py-2 focus:outline-none"
            />
            {errors.longitude && (
              <p className="text-destructive mt-1 text-xs">
                {errors.longitude.message as string}
              </p>
            )}
          </div>
          <div>
            <label className="mb-1 block text-sm">Price range</label>
            <select
              {...register("price_range")}
              className="border-input bg-background w-full rounded-md border px-3 py-2 focus:outline-none"
            >
              <option value="">Select</option>
              <option value="1">Budget</option>
              <option value="2">Moderate</option>
              <option value="3">Upscale</option>
              <option value="4">Premium</option>
            </select>
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm">Category</label>
          <select
            {...register("category_id")}
            className="border-input bg-background w-full rounded-md border px-3 py-2 focus:outline-none"
          >
            <option value="">Select a category</option>
            {categories.map((c) => (
              <option key={c.id} value={String(c.id)}>
                {c.name}
              </option>
            ))}
          </select>
          {errors.category_id && (
            <p className="text-destructive mt-1 text-xs">
              {errors.category_id.message as string}
            </p>
          )}
        </div>
      </div>
      <div>
        <button
          type="submit"
          disabled={submitting}
          className="bg-primary text-primary-foreground rounded-md px-4 py-2 text-sm font-medium disabled:opacity-60"
        >
          {submitting ? "Adding…" : "Add place"}
        </button>
      </div>
    </form>
  );
}

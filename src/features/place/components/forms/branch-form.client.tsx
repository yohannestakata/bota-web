"use client";

import { useEffect, useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useAuth } from "@/app/auth-context";
import { useToast } from "@/components/ui/toast";
import { getFriendlyErrorMessage } from "@/lib/errors";
import {
  addBranch,
  getPlacesForBranchSelection,
  type BranchFormData,
  type Place,
} from "@/lib/supabase/queries";
import {
  InputField,
  TextAreaField,
  SelectField,
  CheckboxField,
} from "@/components/form/fields";
import { CollapsibleSection } from "@/components/form/section";

const branchSchema = z.object({
  place_id: z.string().min(1, "Place is required"),
  name: z.string().min(2, "Please enter a branch name"),
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
  price_range: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine((v) => v === "" || (Number(v) >= 1 && Number(v) <= 4), {
      message: "Price range is 1 (budget) to 4 (premium)",
    }),
  is_main_branch: z.boolean(),
});

type BranchFormValues = z.infer<typeof branchSchema>;

export default function BranchForm() {
  const { user } = useAuth();
  const { notify } = useToast();
  const [branchSubmitting, setBranchSubmitting] = useState(false);
  const [places, setPlaces] = useState<Place[]>([]);
  const [loadingPlaces, setLoadingPlaces] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<BranchFormValues>({ resolver: zodResolver(branchSchema) });

  useEffect(() => {
    const loadPlaces = async () => {
      setLoadingPlaces(true);
      try {
        const { data, error } = await getPlacesForBranchSelection();
        if (error) {
          console.error("Error loading places:", error);
          notify("Failed to load places", "error");
        } else {
          setPlaces(data || []);
        }
      } catch (error) {
        console.error("Error loading places:", error);
        notify("Failed to load places", "error");
      } finally {
        setLoadingPlaces(false);
      }
    };
    loadPlaces();
  }, [notify]);

  const onSubmit = handleSubmit(async (values) => {
    if (!user) return;
    setBranchSubmitting(true);
    try {
      const payload: BranchFormData = {
        place_id: values.place_id,
        name: values.name,
        description: values.description || undefined,
        phone: values.phone || undefined,
        website_url: values.website_url || undefined,
        address_line1: values.address_line1 || undefined,
        address_line2: values.address_line2 || undefined,
        city: values.city || undefined,
        state: values.state || undefined,
        postal_code: values.postal_code || undefined,
        country: values.country || undefined,
        latitude: values.latitude ? Number(values.latitude) : undefined,
        longitude: values.longitude ? Number(values.longitude) : undefined,
        price_range: values.price_range
          ? Number(values.price_range)
          : undefined,
        is_main_branch: values.is_main_branch,
      };

      const { error } = await addBranch(payload);
      if (error) throw error;

      notify("Branch added successfully!", "success");
      reset();

      const selectedPlace = places.find((p) => p.id === values.place_id);
      if (selectedPlace?.slug) {
        window.setTimeout(() => {
          window.location.href = `/place/${selectedPlace.slug}`;
        }, 600);
      }
    } catch (err) {
      notify(getFriendlyErrorMessage(err), "error");
    } finally {
      setBranchSubmitting(false);
    }
  });

  return (
    <form onSubmit={onSubmit} className="space-y-6 divide-y">
      <div className="space-y-6">
        <CollapsibleSection title="Place & Name" value="basic" defaultOpen>
          <SelectField
            label="Select Place"
            {...register("place_id")}
            disabled={loadingPlaces}
          >
            <option value="">
              {loadingPlaces ? "Loading places..." : "Select a place"}
            </option>
            {places.map((place) => (
              <option key={place.id} value={place.id}>
                {place.name}
                {place.city && ` - ${place.city}`}
              </option>
            ))}
          </SelectField>
          {errors.place_id && (
            <p className="text-destructive mt-1 text-xs">
              {errors.place_id.message as string}
            </p>
          )}

          <InputField
            label="Branch Name"
            placeholder="e.g., Downtown Location, Airport Branch"
            {...register("name")}
          />
          {errors.name && (
            <p className="text-destructive mt-1 text-xs">
              {errors.name.message as string}
            </p>
          )}
          <TextAreaField
            label="Description"
            placeholder="Describe this branch location..."
            {...register("description")}
          />
        </CollapsibleSection>

        <CollapsibleSection title="Contact" value="contact">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <InputField
              label="Phone"
              placeholder="+251 911 234 567"
              {...register("phone")}
            />
            <InputField
              label="Website"
              type="url"
              placeholder="https://example.com"
              {...register("website_url")}
            />
          </div>
        </CollapsibleSection>

        <CollapsibleSection title="Location" value="location">
          <InputField
            label="Address line 1"
            placeholder="Street and number"
            {...register("address_line1")}
          />
          <InputField
            label="Address line 2"
            placeholder="Apartment, suite, etc. (optional)"
            {...register("address_line2")}
          />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <InputField label="City" placeholder="City" {...register("city")} />
            <InputField
              label="State"
              placeholder="State / Region"
              {...register("state")}
            />
            <InputField
              label="Postal code"
              placeholder="ZIP / Postal"
              {...register("postal_code")}
            />
          </div>
          <InputField
            label="Country"
            placeholder="Country"
            {...register("country")}
          />
        </CollapsibleSection>

        <CollapsibleSection title="Geolocation & Pricing" value="geo">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <InputField
              label="Latitude"
              type="number"
              step="any"
              placeholder="e.g., 9.0108"
              {...register("latitude")}
              error={errors.latitude?.message as string}
            />
            <InputField
              label="Longitude"
              type="number"
              step="any"
              placeholder="e.g., 38.7613"
              {...register("longitude")}
              error={errors.longitude?.message as string}
            />
            <SelectField label="Price range" {...register("price_range")}>
              <option value="">Select</option>
              <option value="1">Budget</option>
              <option value="2">Moderate</option>
              <option value="3">Upscale</option>
              <option value="4">Premium</option>
            </SelectField>
          </div>
        </CollapsibleSection>

        <CollapsibleSection title="Settings" value="settings">
          <CheckboxField
            label="Set as main branch (will replace existing main branch)"
            {...register("is_main_branch")}
          />
        </CollapsibleSection>
      </div>

      <div className="pt-6">
        <button
          type="submit"
          disabled={branchSubmitting}
          className="bg-primary text-primary-foreground px-4 py-2 text-sm font-medium disabled:opacity-60"
        >
          {branchSubmitting ? "Adding branch…" : "Add branch"}
        </button>
      </div>
    </form>
  );
}

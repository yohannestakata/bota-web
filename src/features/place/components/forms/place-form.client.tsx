"use client";

import { useEffect, useRef, useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/app/auth-context";
import { useToast } from "@/components/ui/toast";
import { getFriendlyErrorMessage } from "@/lib/errors";
import { searchPlaces } from "@/lib/supabase/queries";
import {
  InputField,
  TextAreaField,
  SelectField,
} from "@/components/form/fields";
import { CollapsibleSection } from "@/components/form/section";
import MapPicker from "../map-picker";
import { Dialog } from "@/components/ui/dialog";

const placeSchema = z.object({
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
  branch_name: z.string().optional().or(z.literal("")),
  is_main_branch: z.boolean().optional(),
});

type PlaceFormValues = z.infer<typeof placeSchema>;

export default function PlaceForm({
  categories,
}: {
  categories: { id: number; name: string }[];
}) {
  const { user } = useAuth();
  const { notify } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<{
    id: string;
    name: string;
    slug: string;
    city?: string | null;
  } | null>(null);

  const [nameQuery, setNameQuery] = useState("");
  const [nameResults, setNameResults] = useState<
    Array<{ id: string; name: string; slug: string; city?: string | null }>
  >([]);
  const [showNameResults, setShowNameResults] = useState(false);
  const [loadingNames, setLoadingNames] = useState(false);
  const nameContainerRef = useRef<HTMLDivElement | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm<PlaceFormValues>({ resolver: zodResolver(placeSchema) });

  const watchedName = watch("name");
  const watchedLatitude = watch("latitude");
  const watchedLongitude = watch("longitude");

  useEffect(() => {
    setNameQuery(watchedName || "");
  }, [watchedName]);

  useEffect(() => {
    const handle = window.setTimeout(async () => {
      const q = nameQuery.trim();
      if (!q || q.length < 2) {
        setNameResults([]);
        return;
      }
      setLoadingNames(true);
      try {
        const places = await searchPlaces(q, 5);
        setNameResults(
          (places || []).map((p) => ({
            id: p.id,
            name: p.name,
            slug: p.slug,
            city: p.city,
          })),
        );
      } catch (error) {
        console.error("Error searching places:", error);
        setNameResults([]);
      } finally {
        setLoadingNames(false);
      }
    }, 300);
    return () => window.clearTimeout(handle);
  }, [nameQuery]);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!nameContainerRef.current) return;
      if (!nameContainerRef.current.contains(e.target as Node)) {
        setShowNameResults(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const onSubmit = handleSubmit(async (values) => {
    if (!user) return;
    setSubmitting(true);
    try {
      const proposedBranch = {
        name: values.branch_name?.trim() || values.name,
        phone: values.phone || null,
        website_url: values.website_url || null,
        address_line1: values.address_line1 || null,
        address_line2: values.address_line2 || null,
        city: values.city || null,
        state: values.state || null,
        postal_code: values.postal_code || null,
        country: values.country || null,
        latitude: values.latitude ? Number(values.latitude) : null,
        longitude: values.longitude ? Number(values.longitude) : null,
        price_range: values.price_range ? Number(values.price_range) : null,
        is_main_branch: Boolean(values.is_main_branch),
      };
      let insertError: unknown = null;
      if (selectedPlace) {
        const { error } = await supabase.from("branch_add_requests").insert({
          author_id: user.id,
          place_id: selectedPlace.id,
          proposed_branch: proposedBranch,
          status: "pending",
        });
        insertError = error;
      } else {
        const proposedPlace = {
          name: values.name,
          description: values.description || null,
          category_id: values.category_id ? Number(values.category_id) : null,
        };
        const { error } = await supabase.from("place_add_requests").insert({
          author_id: user.id,
          proposed_place: proposedPlace,
          proposed_branch: proposedBranch,
          status: "pending",
        });
        insertError = error;
      }

      if (insertError) throw insertError;

      notify("Request submitted. We’ll review it shortly.", "success");
      reset();
      setSelectedPlace(null);
      setSuccessOpen(true);
    } catch (err) {
      notify(getFriendlyErrorMessage(err), "error");
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <>
      <form onSubmit={onSubmit}>
        <div className="divide-border mt-12 divide-y">
          <div className="pb-12">
            <div className="text-xl font-bold">Basics</div>
            <div ref={nameContainerRef} className="relative mt-6">
              <label className="block font-semibold">
                {selectedPlace ? "Place" : "Name"}
              </label>
              <input
                type="text"
                {...register("name")}
                value={nameQuery}
                onChange={(e) => {
                  setNameQuery(e.target.value);
                  setValue("name", e.target.value);
                  setShowNameResults(true);
                }}
                onFocus={() => setShowNameResults(true)}
                className="border-input bg-background mt-2 w-full border p-3 focus:outline-none"
                placeholder={
                  selectedPlace
                    ? selectedPlace.name
                    : "What’s this place called?"
                }
                disabled={!!selectedPlace}
              />
              {errors.name && (
                <p className="text-destructive mt-1 text-sm">
                  {errors.name.message as string}
                </p>
              )}

              {selectedPlace ? (
                <div className="mt-2 flex items-center justify-between text-sm">
                  <div>
                    Adding a branch to{" "}
                    <span className="font-semibold">{selectedPlace.name}</span>
                  </div>
                  <button
                    type="button"
                    className="underline underline-offset-4"
                    onClick={() => {
                      setSelectedPlace(null);
                      setShowNameResults(false);
                    }}
                  >
                    Change
                  </button>
                </div>
              ) : null}

              {showNameResults && (nameResults.length > 0 || loadingNames) && (
                <div className="bg-popover border-border bg-background absolute z-10 mt-1 w-full overflow-hidden border shadow-lg">
                  {loadingNames && (
                    <div className="text-muted-foreground px-3 py-2 text-sm">
                      Searching...
                    </div>
                  )}

                  {!loadingNames && nameResults.length > 0 && (
                    <div className="py-1">
                      <div className="text-muted-foreground px-3 py-1 text-xs font-medium">
                        Similar places found:
                      </div>
                      {nameResults.map((place) => (
                        <div
                          key={place.id}
                          className="hover:bg-muted cursor-pointer px-3 py-2 text-sm"
                          onClick={() => {
                            setValue("name", place.name);
                            setNameQuery(place.name);
                            setShowNameResults(false);
                            setSelectedPlace(place);
                          }}
                        >
                          <div className="font-medium">{place.name}</div>
                          {place.city && (
                            <div className="text-muted-foreground text-xs">
                              {place.city}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {!loadingNames &&
                    nameQuery.trim() &&
                    nameResults.length === 0 && (
                      <div className="text-muted-foreground px-3 py-2 text-sm">
                        No similar places found.
                      </div>
                    )}
                </div>
              )}
            </div>

            <InputField
              label="Branch name (optional)"
              placeholder="If different from place name"
              {...register("branch_name")}
              containerClassName="mt-6"
            />

            <div className="mt-2">
              <label className="flex items-center gap-2">
                <input type="checkbox" {...register("is_main_branch")} />
                <span className="text-sm">This is the main branch</span>
              </label>
            </div>

            {selectedPlace ? null : (
              <TextAreaField
                label="Description"
                placeholder="Tell folks what makes this place special..."
                {...register("description")}
                error={errors.description?.message as string}
                containerClassName="mt-6"
              />
            )}
          </div>

          <CollapsibleSection title="Contact" value="contact" defaultOpen>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <InputField
                label="Phone"
                placeholder="e.g., +251 911 234 567"
                {...register("phone")}
              />
              <InputField
                label="Website"
                placeholder="https://example.com"
                type="url"
                {...register("website_url")}
                error={errors.website_url?.message as string}
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
              <InputField
                label="City"
                placeholder="City"
                {...register("city")}
              />
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
            <div className="mb-4">
              <label className="mb-2 block font-semibold">Location</label>
              <MapPicker
                lat={watchedLatitude ? Number(watchedLatitude) : null}
                lon={watchedLongitude ? Number(watchedLongitude) : null}
                onChange={(newLat, newLon) => {
                  setValue("latitude", String(newLat), {
                    shouldValidate: true,
                  });
                  setValue("longitude", String(newLon), {
                    shouldValidate: true,
                  });
                }}
              />
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
              {selectedPlace ? null : (
                <SelectField
                  label="Category"
                  {...register("category_id")}
                  error={errors.category_id?.message as string}
                >
                  <option value="">Select a category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={String(c.id)}>
                      {c.name}
                    </option>
                  ))}
                </SelectField>
              )}

              <SelectField label="Price range" {...register("price_range")}>
                <option value="">Select</option>
                <option value="1">Budget</option>
                <option value="2">Moderate</option>
                <option value="3">Upscale</option>
                <option value="4">Premium</option>
              </SelectField>
            </div>
          </CollapsibleSection>
        </div>

        <div className="flex items-center justify-end gap-3 pb-12">
          <button
            type="submit"
            disabled={submitting}
            className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-3 font-semibold disabled:opacity-60"
          >
            {submitting ? "Submitting…" : "Submit request"}
          </button>
        </div>
      </form>

      <Dialog open={successOpen} onOpenChange={setSuccessOpen} size="lg">
        <div className="p-6">
          <div className="mb-3 text-3xl font-semibold">
            Thanks, your request is in!
          </div>
          <p className="mb-5 leading-6">
            We’ll give it a quick look and follow up shortly. If we need
            anything else, we’ll reach out. Appreciate you helping keep Bota
            Review fresh and useful.
          </p>
          <div className="flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              className="border-border hover:bg-muted border p-3"
              onClick={() => setSuccessOpen(false)}
            >
              Submit another place
            </button>
            <button
              type="button"
              className="bg-primary text-primary-foreground hover:bg-primary/90 p-3 font-semibold"
              onClick={() => {
                window.location.href = "/";
              }}
            >
              Back to home
            </button>
          </div>
        </div>
      </Dialog>
    </>
  );
}

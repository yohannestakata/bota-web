"use client";

import { useState, useEffect, useRef } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/app/auth-context";
import { useToast } from "@/components/ui/toast";
import { getFriendlyErrorMessage } from "@/lib/errors";
import {
  searchPlaces,
  getPlacesForBranchSelection,
  addBranch,
  type Place,
  type BranchFormData,
} from "@/lib/supabase/queries";
import { motion, AnimatePresence } from "framer-motion";
import AuthGate from "@/components/ui/auth-gate";

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
  // Simple branch name field
  branch_name: z.string().optional().or(z.literal("")),
});

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

type PlaceFormValues = z.infer<typeof placeSchema>;
type BranchFormValues = z.infer<typeof branchSchema>;

export default function AddPlaceForm({
  categories,
}: {
  categories: { id: number; name: string }[];
}) {
  const { user, isLoading } = useAuth();
  const { notify } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<"place" | "branch">("place");

  // Name recommendations state
  const [nameQuery, setNameQuery] = useState("");
  const [nameResults, setNameResults] = useState<
    Array<{ id: string; name: string; slug: string; city?: string | null }>
  >([]);
  const [showNameResults, setShowNameResults] = useState(false);
  const [loadingNames, setLoadingNames] = useState(false);
  const nameContainerRef = useRef<HTMLDivElement | null>(null);

  // Branch form state
  const [places, setPlaces] = useState<Place[]>([]);
  const [loadingPlaces, setLoadingPlaces] = useState(false);
  const [branchSubmitting, setBranchSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm<PlaceFormValues>({ resolver: zodResolver(placeSchema) });

  const {
    register: registerBranch,
    handleSubmit: handleSubmitBranch,
    // watch: watchBranch,
    // setValue: setValueBranch,
    formState: { errors: branchErrors },
    reset: resetBranch,
  } = useForm<BranchFormValues>({ resolver: zodResolver(branchSchema) });

  const watchedName = watch("name");

  // Debounced name search
  useEffect(() => {
    const handle = setTimeout(async () => {
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
    return () => clearTimeout(handle);
  }, [nameQuery]);

  // Load places for branch selection
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

    if (activeTab === "branch") {
      loadPlaces();
    }
  }, [activeTab, notify]);

  // Update name query when form name changes
  useEffect(() => {
    setNameQuery(watchedName || "");
  }, [watchedName]);

  // Close dropdown when clicking outside
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
    if (!user) return; // AuthGate will handle this
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

      // If branch name is provided, update the main branch name
      if (values.branch_name && values.branch_name.trim()) {
        const { error: branchError } = await supabase
          .from("branches")
          .update({ name: values.branch_name.trim() })
          .eq("place_id", data.id)
          .eq("is_main_branch", true);

        if (branchError) {
          console.error("Failed to update branch name:", branchError);
          // Don't throw error here as the place was created successfully
        }
      }

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

  const onBranchSubmit = handleSubmitBranch(async (values) => {
    if (!user) return; // AuthGate will handle this
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
      resetBranch();

      // Redirect to the place page
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

  if (isLoading) return null;
  if (!user) {
    return <div className="text-sm">Please sign in to add a place.</div>;
  }

  return (
    <AuthGate
      title="Sign in to add a place"
      description="You need an account to add new places to our directory."
    >
      <div className="space-y-6">
        {/* Tab Navigation */}
        <div className="border-border bg-muted/50 flex rounded-lg border p-1">
          <button
            type="button"
            onClick={() => setActiveTab("place")}
            className={`relative flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              activeTab === "place"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Add Place
            {activeTab === "place" && (
              <motion.div
                layoutId="activeTab"
                className="bg-primary absolute inset-0 rounded-md"
                style={{ zIndex: -1 }}
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("branch")}
            className={`relative flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              activeTab === "branch"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Add Branch
            {activeTab === "branch" && (
              <motion.div
                layoutId="activeTab"
                className="bg-primary absolute inset-0 rounded-md"
                style={{ zIndex: -1 }}
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
          </button>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === "place" ? (
            <motion.form
              key="place"
              onSubmit={onSubmit}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="grid gap-4">
                <div ref={nameContainerRef} className="relative">
                  <label className="mb-1 block text-sm">Name</label>
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
                    className="border-input bg-background w-full rounded-md border px-3 py-2 focus:outline-none"
                    placeholder="Enter place name..."
                  />
                  {errors.name && (
                    <p className="text-destructive mt-1 text-xs">
                      {errors.name.message as string}
                    </p>
                  )}

                  {/* Name recommendations dropdown */}
                  {showNameResults &&
                    (nameResults.length > 0 || loadingNames) && (
                      <div className="bg-popover border-border bg-background absolute z-10 mt-1 w-full overflow-hidden rounded-md border shadow-lg">
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
            </motion.form>
          ) : (
            <motion.form
              key="branch"
              onSubmit={onBranchSubmit}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="grid gap-4">
                <div>
                  <label className="mb-1 block text-sm">Select Place</label>
                  <select
                    {...registerBranch("place_id")}
                    className="border-input bg-background w-full rounded-md border px-3 py-2 focus:outline-none"
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
                  </select>
                  {branchErrors.place_id && (
                    <p className="text-destructive mt-1 text-xs">
                      {branchErrors.place_id.message as string}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-1 block text-sm">Branch Name</label>
                  <input
                    type="text"
                    {...registerBranch("name")}
                    className="border-input bg-background w-full rounded-md border px-3 py-2 focus:outline-none"
                    placeholder="e.g., Downtown Location, Airport Branch"
                  />
                  {branchErrors.name && (
                    <p className="text-destructive mt-1 text-xs">
                      {branchErrors.name.message as string}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-1 block text-sm">Description</label>
                  <textarea
                    rows={4}
                    {...registerBranch("description")}
                    className="border-input bg-background w-full rounded-md border px-3 py-2 focus:outline-none"
                    placeholder="Describe this branch location..."
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm">Phone</label>
                    <input
                      type="text"
                      {...registerBranch("phone")}
                      className="border-input bg-background w-full rounded-md border px-3 py-2 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm">Website</label>
                    <input
                      type="url"
                      {...registerBranch("website_url")}
                      className="border-input bg-background w-full rounded-md border px-3 py-2 focus:outline-none"
                    />
                    {branchErrors.website_url && (
                      <p className="text-destructive mt-1 text-xs">
                        {branchErrors.website_url.message as string}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-sm">Address line 1</label>
                  <input
                    type="text"
                    {...registerBranch("address_line1")}
                    className="border-input bg-background w-full rounded-md border px-3 py-2 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm">Address line 2</label>
                  <input
                    type="text"
                    {...registerBranch("address_line2")}
                    className="border-input bg-background w-full rounded-md border px-3 py-2 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div>
                    <label className="mb-1 block text-sm">City</label>
                    <input
                      type="text"
                      {...registerBranch("city")}
                      className="border-input bg-background w-full rounded-md border px-3 py-2 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm">State</label>
                    <input
                      type="text"
                      {...registerBranch("state")}
                      className="border-input bg-background w-full rounded-md border px-3 py-2 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm">Postal code</label>
                    <input
                      type="text"
                      {...registerBranch("postal_code")}
                      className="border-input bg-background w-full rounded-md border px-3 py-2 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-sm">Country</label>
                  <input
                    type="text"
                    {...registerBranch("country")}
                    className="border-input bg-background w-full rounded-md border px-3 py-2 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div>
                    <label className="mb-1 block text-sm">Latitude</label>
                    <input
                      type="number"
                      step="any"
                      {...registerBranch("latitude")}
                      className="border-input bg-background w-full rounded-md border px-3 py-2 focus:outline-none"
                    />
                    {branchErrors.latitude && (
                      <p className="text-destructive mt-1 text-xs">
                        {branchErrors.latitude.message as string}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="mb-1 block text-sm">Longitude</label>
                    <input
                      type="number"
                      step="any"
                      {...registerBranch("longitude")}
                      className="border-input bg-background w-full rounded-md border px-3 py-2 focus:outline-none"
                    />
                    {branchErrors.longitude && (
                      <p className="text-destructive mt-1 text-xs">
                        {branchErrors.longitude.message as string}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="mb-1 block text-sm">Price range</label>
                    <select
                      {...registerBranch("price_range")}
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

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_main_branch"
                    {...registerBranch("is_main_branch")}
                    className="rounded border-gray-300"
                  />
                  <label htmlFor="is_main_branch" className="text-sm">
                    Set as main branch (will replace existing main branch)
                  </label>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={branchSubmitting}
                  className="bg-primary text-primary-foreground rounded-md px-4 py-2 text-sm font-medium disabled:opacity-60"
                >
                  {branchSubmitting ? "Adding branch…" : "Add branch"}
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </AuthGate>
  );
}

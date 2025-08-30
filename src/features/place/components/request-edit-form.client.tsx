"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/app/auth-context";
import { useToast } from "@/components/ui/toast";
import {
  createPlaceEditRequest,
  getMyPlaceEditRequests,
  searchPlaces,
} from "@/lib/supabase/queries";
import AuthGate from "@/components/ui/auth-gate";
import { requestEditSchema } from "../schemas/request-edit.schema";
import type { RequestEditFormValues } from "../types/request-edit.types";
import CorrectionDetailsSection from "./sections/correction-details-section";
import BusinessHoursSection from "./sections/business-hours-section";
import DuplicateSection from "./sections/duplicate-section";
import NotesSection from "./sections/notes-section";
import { supabase } from "@/lib/supabase/client";

type RequestType = "correction" | "closure" | "duplicate" | "other";

export default function RequestEditForm({
  placeId,
  placeSlug,
}: {
  placeId: string;
  placeSlug: string;
}) {
  const { user, isLoading } = useAuth();
  const { notify } = useToast();
  const router = useRouter();
  const search = useSearchParams();
  const initialType = (search.get("type") as RequestType) || "correction";

  const [requestType, setRequestType] = useState<RequestType>(initialType);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [website, setWebsite] = useState("");
  const [phone, setPhone] = useState("");
  type DayHours = {
    is_closed?: boolean;
    is_24_hours?: boolean;
    open_time?: string;
    close_time?: string;
  };
  const [hours, setHours] = useState<Record<number, DayHours>>({});
  const [message, setMessage] = useState("");
  const [evidenceUrl, setEvidenceUrl] = useState("");
  const [categoryId, setCategoryId] = useState<number | "">("");
  const [categories, setCategories] = useState<
    Array<{ id: number; name: string }>
  >([]);
  const [latitude, setLatitude] = useState<string>("");
  const [longitude, setLongitude] = useState<string>("");
  const [duplicateQuery, setDuplicateQuery] = useState("");
  const [duplicateResults, setDuplicateResults] = useState<
    { id: string; name: string; slug: string }[]
  >([]);
  const [selectedDuplicate, setSelectedDuplicate] = useState<{
    id: string;
    name: string;
    slug: string;
  } | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [myRequests, setMyRequests] = useState<
    { id: string; status: string; created_at: string }[]
  >([]);

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace(
        `/login?redirect=/place/${encodeURIComponent(placeSlug)}/request-edit`,
      );
    }
  }, [isLoading, user, placeSlug, router]);

  useEffect(() => {
    (async () => {
      try {
        const rows = await getMyPlaceEditRequests(placeId);
        setMyRequests(
          rows as Array<{ id: string; status: string; created_at: string }>,
        );
      } catch {}
    })();
  }, [placeId]);

  // Load categories for optional category change
  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase
          .from("categories")
          .select("id, name")
          .order("name");
        setCategories((data as Array<{ id: number; name: string }>) || []);
      } catch {}
    })();
  }, []);

  const proposedChanges = useMemo(() => {
    const changes: Record<string, unknown> = {};
    if (requestType === "duplicate" && selectedDuplicate) {
      changes["duplicate_of_place_id"] = selectedDuplicate.id;
      changes["duplicate_of_slug"] = selectedDuplicate.slug;
    }
    if (requestType === "correction" || requestType === "other") {
      if (name.trim()) changes["name"] = name.trim();
      if (address.trim()) changes["address"] = address.trim();
      if (website.trim()) changes["website_url"] = website.trim();
      if (phone.trim()) changes["phone"] = phone.trim();
      if (categoryId !== "") changes["category_id"] = Number(categoryId);
      if (latitude.trim()) changes["latitude"] = Number(latitude);
      if (longitude.trim()) changes["longitude"] = Number(longitude);
      // Include only days that have any value set
      const filteredDays: Record<string, DayHours> = {};
      for (let d = 0; d <= 6; d++) {
        const v = hours[d];
        if (!v) continue;
        const hasAny =
          v.is_closed !== undefined ||
          v.is_24_hours !== undefined ||
          (v.open_time && v.open_time.length) ||
          (v.close_time && v.close_time.length);
        if (hasAny) filteredDays[String(d)] = v;
      }
      if (Object.keys(filteredDays).length > 0) {
        changes["business_hours"] = filteredDays;
      }
    }
    return changes;
  }, [
    requestType,
    name,
    address,
    website,
    phone,
    categoryId,
    latitude,
    longitude,
    hours,
    selectedDuplicate,
  ]);

  // Debounced search for duplicate target
  useEffect(() => {
    if (requestType !== "duplicate") return;
    const q = duplicateQuery.trim();
    if (selectedDuplicate && q === selectedDuplicate.name) return;
    if (q.length < 2) {
      setDuplicateResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        setIsSearching(true);
        const results = await searchPlaces(q, 6);
        setDuplicateResults(
          (results || []).map(
            (p: { id: string; name: string; slug: string }) => ({
              id: p.id,
              name: p.name,
              slug: p.slug,
            }),
          ),
        );
      } catch {
        setDuplicateResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [duplicateQuery, requestType, selectedDuplicate]);

  const form = useForm<RequestEditFormValues>({
    resolver: zodResolver(requestEditSchema),
    defaultValues: {
      type: requestType,
      name: "",
      address: "",
      website_url: "",
      phone: "",
      category_id: "",
      latitude: "",
      longitude: "",
      business_hours: {},
      message: "",
      evidence_url: "",
      duplicate_target: null,
    },
    mode: "onBlur",
  });

  useEffect(() => {
    form.setValue("type", requestType);
  }, [requestType, form]);

  async function onSubmit() {
    if (!user) return; // AuthGate will handle this
    // Basic validation
    if (requestType === "duplicate" && !selectedDuplicate) {
      setError("Please select the place this is a duplicate of.");
      return;
    }
    // No JSON validation needed; hours are structured inputs
    try {
      setSubmitting(true);
      setError(null);
      const values = form.getValues();
      await createPlaceEditRequest({
        branchId: placeId,
        requestType,
        proposedChanges,
        message: values.message?.trim() || undefined,
        evidenceUrl: values.evidence_url?.trim() || undefined,
      });
      notify("Thanks! Your request has been submitted.", "success");
      router.replace(`/place/${placeSlug}`);
    } catch (err) {
      setError((err as Error)?.message || "Submission failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthGate
      title="Sign in to request edits"
      description="You need an account to submit edit requests."
    >
      <FormProvider {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="divide-border mt-12 space-y-12 divide-y"
        >
          <div className="pb-12">
            <label className="mb-1 block text-lg font-semibold">
              Request type
            </label>
            <select
              value={requestType}
              onChange={(e) => setRequestType(e.target.value as RequestType)}
              className="border-input bg-background mt-2 w-full max-w-xs border p-3 text-sm focus:outline-none"
            >
              <option value="correction">Correction</option>
              <option value="closure">Closure</option>
              <option value="duplicate">Duplicate</option>
              <option value="other">Other</option>
            </select>
          </div>

          {(requestType === "correction" || requestType === "other") && (
            <CorrectionDetailsSection
              name={name}
              setName={setName}
              website={website}
              setWebsite={setWebsite}
              phone={phone}
              setPhone={setPhone}
              categories={categories}
              categoryId={categoryId}
              setCategoryId={setCategoryId}
              address={address}
              setAddress={setAddress}
              latitude={latitude}
              setLatitude={setLatitude}
              longitude={longitude}
              setLongitude={setLongitude}
            />
          )}

          {(requestType === "correction" || requestType === "other") && (
            <BusinessHoursSection hours={hours} setHours={setHours} />
          )}

          {requestType === "duplicate" && (
            <DuplicateSection
              duplicateQuery={duplicateQuery}
              setDuplicateQuery={setDuplicateQuery}
              selectedDuplicate={selectedDuplicate}
              setSelectedDuplicate={setSelectedDuplicate}
              duplicateResults={duplicateResults}
              isSearching={isSearching}
              setDuplicateResults={setDuplicateResults}
            />
          )}

          <NotesSection
            message={message}
            setMessage={setMessage}
            evidenceUrl={evidenceUrl}
            setEvidenceUrl={setEvidenceUrl}
          />

          {error ? (
            <div className="text-destructive text-sm">{error}</div>
          ) : null}

          <div className="flex items-center gap-3 pb-12">
            <button
              type="submit"
              disabled={submitting}
              className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-3 disabled:opacity-60"
            >
              {submitting ? "Submitting…" : "Submit request"}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="border-border hover:bg-muted border px-4 py-3 disabled:opacity-60"
            >
              Cancel
            </button>
          </div>

          {myRequests.length ? (
            <div className="mt-8 rounded-lg">
              <div className="mb-2 text-sm font-medium">
                Your recent requests
              </div>
              <ul className="text-sm">
                {myRequests.map((r) => (
                  <li
                    key={r.id}
                    className="flex items-center justify-between py-1"
                  >
                    <span className="text-muted-foreground">
                      {r.id.slice(0, 8)}…
                    </span>
                    <span className="bg-muted rounded px-2 py-0.5 text-xs uppercase">
                      {r.status}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </form>
      </FormProvider>
    </AuthGate>
  );
}

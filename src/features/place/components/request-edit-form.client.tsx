"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/app/auth-context";
import { useToast } from "@/components/ui/toast";
import {
  createPlaceEditRequest,
  getMyPlaceEditRequests,
  searchPlaces,
} from "@/lib/supabase/queries";
import AuthGate from "@/components/ui/auth-gate";
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
  const [priceRange, setPriceRange] = useState<number | "">("");
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
      if (priceRange !== "") changes["price_range"] = Number(priceRange);
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
    priceRange,
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

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
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
      await createPlaceEditRequest({
        branchId: placeId,
        requestType,
        proposedChanges,
        message: message.trim() || undefined,
        evidenceUrl: evidenceUrl.trim() || undefined,
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
      <form onSubmit={onSubmit} className="space-y-6">
        <div>
          <label className="mb-1 block text-sm font-medium">Request type</label>
          <select
            value={requestType}
            onChange={(e) => setRequestType(e.target.value as RequestType)}
            className="border-input bg-background w-full max-w-xs rounded-md border px-2 py-2 text-sm focus:outline-none"
          >
            <option value="correction">Correction</option>
            <option value="closure">Closure</option>
            <option value="duplicate">Duplicate</option>
            <option value="other">Other</option>
          </select>
        </div>

        {(requestType === "correction" || requestType === "other") && (
          <div className="space-y-4">
            <div className="text-foreground text-sm font-medium">
              Details to correct
            </div>
            <div className="rounded-lg border p-3">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs">Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Proposed new name"
                    className="border-input bg-background w-full border px-2 py-2 text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs">Website</label>
                  <input
                    type="url"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://example.com"
                    className="border-input bg-background w-full rounded-md border px-2 py-2 text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs">Phone</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(555) 123-4567"
                    className="border-input bg-background w-full rounded-md border px-2 py-2 text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs">Price range</label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4].map((v) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => setPriceRange(v)}
                        className={`border-input ${
                          priceRange === v ? "bg-muted" : "bg-background"
                        } rounded-md border px-2 py-1 text-sm`}
                      >
                        {"$".repeat(v)}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setPriceRange("")}
                      className="text-muted-foreground hover:text-foreground text-xs"
                    >
                      Clear
                    </button>
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-xs">Category</label>
                  <select
                    value={categoryId === "" ? "" : String(categoryId)}
                    onChange={(e) =>
                      setCategoryId(
                        e.target.value ? Number(e.target.value) : "",
                      )
                    }
                    className="border-input bg-background w-full rounded-md border px-2 py-2 text-sm focus:outline-none"
                  >
                    <option value="">No change</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1 block text-xs">Address</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Street, City, State ZIP"
                    className="border-input bg-background w-full rounded-md border px-2 py-2 text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs">Latitude</label>
                  <input
                    inputMode="decimal"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    placeholder="e.g. 9.0108"
                    className="border-input bg-background w-full rounded-md border px-2 py-2 text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs">Longitude</label>
                  <input
                    inputMode="decimal"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    placeholder="e.g. 38.7613"
                    className="border-input bg-background w-full rounded-md border px-2 py-2 text-sm focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="border-t" />

            <div className="text-foreground text-sm font-medium">
              Business hours (optional)
            </div>
            <div className="rounded-lg border p-3">
              <div className="grid grid-cols-1 gap-3">
                {(
                  [
                    "Sunday",
                    "Monday",
                    "Tuesday",
                    "Wednesday",
                    "Thursday",
                    "Friday",
                    "Saturday",
                  ] as const
                ).map((label, idx) => {
                  const v = hours[idx] || {};
                  const set = (next: Partial<DayHours>) =>
                    setHours((prev) => ({
                      ...prev,
                      [idx]: { ...v, ...next },
                    }));
                  return (
                    <div key={label} className="rounded-lg border p-3">
                      <div className="mb-2 text-sm font-medium">{label}</div>
                      <div className="flex flex-wrap items-center gap-3 text-sm">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={Boolean(v.is_closed)}
                            onChange={(e) =>
                              set({
                                is_closed: e.target.checked || undefined,
                                is_24_hours: e.target.checked
                                  ? undefined
                                  : v.is_24_hours,
                                open_time: e.target.checked
                                  ? undefined
                                  : v.open_time,
                                close_time: e.target.checked
                                  ? undefined
                                  : v.close_time,
                              })
                            }
                          />
                          Closed
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={Boolean(v.is_24_hours)}
                            onChange={(e) =>
                              set({
                                is_24_hours: e.target.checked || undefined,
                                is_closed: e.target.checked
                                  ? undefined
                                  : v.is_closed,
                                open_time: e.target.checked
                                  ? undefined
                                  : v.open_time,
                                close_time: e.target.checked
                                  ? undefined
                                  : v.close_time,
                              })
                            }
                          />
                          Open 24 hours
                        </label>
                        {!v.is_closed && !v.is_24_hours && (
                          <div className="flex items-center gap-2">
                            <label className="text-xs">Open</label>
                            <input
                              type="time"
                              value={v.open_time || ""}
                              onChange={(e) =>
                                set({
                                  open_time: e.target.value || undefined,
                                })
                              }
                              className="border-input bg-background rounded-md border px-2 py-1 text-sm focus:outline-none"
                            />
                            <label className="text-xs">Close</label>
                            <input
                              type="time"
                              value={v.close_time || ""}
                              onChange={(e) =>
                                set({
                                  close_time: e.target.value || undefined,
                                })
                              }
                              className="border-input bg-background rounded-md border px-2 py-1 text-sm focus:outline-none"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="text-muted-foreground mt-2 text-xs">
                Set only the days you want to change. Leave others blank.
              </div>
            </div>
          </div>
        )}

        {requestType === "duplicate" && (
          <div className="space-y-4">
            <div className="text-foreground text-sm font-medium">
              Mark as duplicate of…
            </div>
            <div className="rounded-lg border p-3">
              <label className="mb-1 block text-xs">Duplicate of</label>
              <input
                type="text"
                value={duplicateQuery}
                onChange={(e) => {
                  setDuplicateQuery(e.target.value);
                  setSelectedDuplicate(null);
                }}
                placeholder="Search places by name or city"
                className="border-input bg-background w-full rounded-md border px-2 py-2 text-sm focus:outline-none"
                autoComplete="off"
              />
              {selectedDuplicate ? (
                <div className="mt-2 text-xs">
                  Selected:{" "}
                  <span className="font-medium">{selectedDuplicate.name}</span>
                  <span className="text-muted-foreground">
                    {" "}
                    (/{selectedDuplicate.slug})
                  </span>
                </div>
              ) : null}
              {!selectedDuplicate &&
                (duplicateResults.length > 0 || isSearching) && (
                  <ul className="bg-popover border-border mt-2 max-h-56 w-full overflow-auto rounded-md border text-sm shadow">
                    {isSearching ? (
                      <li className="text-muted-foreground px-3 py-2">
                        Searching…
                      </li>
                    ) : (
                      duplicateResults.map((opt) => (
                        <li
                          key={opt.id}
                          className="hover:bg-muted cursor-pointer px-3 py-2"
                          onClick={() => {
                            setSelectedDuplicate(opt);
                            setDuplicateQuery(opt.name);
                            setDuplicateResults([]);
                          }}
                        >
                          <div className="font-medium">{opt.name}</div>
                          <div className="text-muted-foreground text-xs">
                            /{opt.slug}
                          </div>
                        </li>
                      ))
                    )}
                    {!isSearching && duplicateResults.length === 0 ? (
                      <li className="text-muted-foreground px-3 py-2">
                        No results
                      </li>
                    ) : null}
                  </ul>
                )}
            </div>
          </div>
        )}

        <div className="border-t" />

        <div className="space-y-4">
          <div className="text-foreground text-sm font-medium">
            Notes & evidence (optional)
          </div>
          <div className="rounded-lg border p-3">
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-xs">Message</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  placeholder="Explain what needs to change and why."
                  className="border-input bg-background w-full rounded-md border px-2 py-2 text-sm focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs">Evidence link</label>
                <input
                  type="url"
                  value={evidenceUrl}
                  onChange={(e) => setEvidenceUrl(e.target.value)}
                  placeholder="Link to official site, news, etc."
                  className="border-input bg-background w-full rounded-md border px-2 py-2 text-sm focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {error ? <div className="text-destructive text-sm">{error}</div> : null}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-4 py-2 text-sm disabled:opacity-60"
          >
            {submitting ? "Submitting..." : "Submit request"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="border-border hover:bg-muted rounded-md border px-4 py-2 text-sm"
          >
            Cancel
          </button>
        </div>

        {myRequests.length ? (
          <div className="border-border mt-8 rounded-lg border p-3">
            <div className="mb-2 text-sm font-medium">Your recent requests</div>
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
    </AuthGate>
  );
}

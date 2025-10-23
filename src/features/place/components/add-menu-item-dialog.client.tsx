"use client";

import { useEffect, useMemo, useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/app/auth-context";

type SectionOption = { id: string; name: string };

export default function AddMenuItemDialog({
  open,
  onOpenChange,
  branchId,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (next: boolean) => void;
  branchId: string | null;
  onSaved?: () => void;
}) {
  const { user } = useAuth();

  const [loadingSections, setLoadingSections] = useState(false);
  const [sectionOptions, setSectionOptions] = useState<SectionOption[]>([]);
  const [selectedSectionId, setSelectedSectionId] = useState("");
  const [itemName, setItemName] = useState("");
  const [itemDescription, setItemDescription] = useState("");
  const [itemPrice, setItemPrice] = useState("");
  const [itemCurrency, setItemCurrency] = useState("ETB");
  const [saving, setSaving] = useState(false);

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setSectionOptions([]);
      setSelectedSectionId("");
      setItemName("");
      setItemDescription("");
      setItemPrice("");
      setItemCurrency("ETB");
    }
  }, [open]);

  // Fetch sections when dialog opens and branchId is available
  useEffect(() => {
    let mounted = true;
    async function loadSections() {
      if (!open || !branchId) return;
      console.log("[menu] loadSections ->", { open, branchId });
      setLoadingSections(true);
      try {
        // Try Supabase join with explicit foreign key reference
        const { data, error } = await supabase
          .from("branch_menu_sections")
          .select(
            `
            id,
            menu_section_id,
            position,
            is_active,
            menu_sections!menu_section_id(
              id,
              name
            )
          `,
          )
          .eq("branch_id", branchId)
          .eq("is_active", true)
          .order("position");

        console.log("[menu] raw sections:", {
          count: (data || []).length,
          error,
        });

        const rows = (data ?? []) as Array<{
          id: string;
          position: number;
          is_active: boolean;
          menu_section_id?: string;
          menu_sections?: { id: string; name: string }[];
        }>;

        // Collect missing names to backfill
        const missing: Array<{ id: string; menu_section_id?: string }> = [];
        const pre: SectionOption[] = rows.map((row) => {
          const sectionName = row.menu_sections?.[0]?.name;
          if (!sectionName) {
            missing.push({ id: row.id, menu_section_id: row.menu_section_id });
          }
          return { id: row.id, name: sectionName ?? "Section" };
        });

        if (missing.length) {
          const ids = Array.from(
            new Set(
              missing.map((m) => m.menu_section_id).filter(Boolean) as string[],
            ),
          );
          if (ids.length) {
            const { data: secData, error: secErr } = await supabase
              .from("menu_sections")
              .select("id, name")
              .in("id", ids);
            if (secErr) {
              console.warn("[menu] fallback fetch menu_sections error", secErr);
            } else {
              const map = new Map(
                (secData || []).map((s: { id: string; name: string }) => [
                  s.id,
                  s.name,
                ]),
              );
              // Patch names
              for (const m of missing) {
                const name = m.menu_section_id
                  ? map.get(m.menu_section_id)
                  : null;
                if (name) {
                  const idx = pre.findIndex((p) => p.id === m.id);
                  if (idx >= 0) pre[idx] = { id: pre[idx].id, name };
                }
              }
            }
          }
        }

        const opts = pre;

        console.log("🎯 Final section options:", opts);
        setSectionOptions(opts);
        setSelectedSectionId(opts[0]?.id ?? "");
      } catch (e) {
        console.error("[menu] failed to load sections", e);
        if (mounted) {
          setSectionOptions([]);
          setSelectedSectionId("");
        }
      } finally {
        if (mounted) setLoadingSections(false);
      }
    }
    loadSections();
    return () => {
      mounted = false;
    };
  }, [open, branchId]);

  const canSave = useMemo(() => {
    return (
      !!user &&
      !!branchId &&
      !!selectedSectionId &&
      itemName.trim().length > 0 &&
      !saving
    );
  }, [user, branchId, selectedSectionId, itemName, saving]);

  async function handleSave() {
    if (!canSave) return;
    setSaving(true);
    try {
      const { error } = await supabase.from("menu_items").insert({
        branch_menu_section_id: selectedSectionId,
        author_id: user!.id,
        name: itemName.trim(),
        description: itemDescription.trim() || null,
        price: itemPrice ? Number(itemPrice) : null,
        currency: itemCurrency || "ETB",
        is_available: true,
      });
      if (error) throw error;
      onOpenChange(false);
      onSaved?.();
    } catch (e) {
      console.error("Failed to add menu item", e);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange} size="md">
      <div className="p-6">
        <div className="mb-2 text-lg font-semibold">Add a menu item</div>
        <div className="mt-4 space-y-4">
          <div>
            <label className="mb-2 block text-sm font-semibold">Section</label>
            {loadingSections ? (
              <div className="text-muted-foreground text-sm">Loading…</div>
            ) : sectionOptions.length > 0 ? (
              <select
                className="border-input bg-background w-full border p-3 focus:outline-none"
                value={selectedSectionId}
                onChange={(e) => setSelectedSectionId(e.target.value)}
              >
                {sectionOptions.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            ) : (
              <div className="text-muted-foreground text-sm">
                No sections yet for this branch. Ask the owner to add sections
                first.
              </div>
            )}
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold">Name</label>
            <input
              className="border-input bg-background w-full border p-3 focus:outline-none"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              placeholder="e.g., Doro Wat"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold">
              Description (optional)
            </label>
            <textarea
              className="border-input bg-background w-full border p-3 focus:outline-none"
              rows={3}
              value={itemDescription}
              onChange={(e) => setItemDescription(e.target.value)}
              placeholder="Short description"
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="mb-2 block text-sm font-semibold">
                Price (optional)
              </label>
              <input
                type="number"
                step="any"
                className="border-input bg-background w-full border p-3 focus:outline-none"
                value={itemPrice}
                onChange={(e) => setItemPrice(e.target.value)}
                placeholder="e.g., 150"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold">
                Currency
              </label>
              <select
                className="border-input bg-background w-full border p-3 focus:outline-none"
                value={itemCurrency}
                onChange={(e) => setItemCurrency(e.target.value)}
              >
                <option value="ETB">ETB</option>
                <option value="USD">USD</option>
              </select>
            </div>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            className="border px-4 py-2 text-sm"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Cancel
          </button>
          <button
            type="button"
            className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 text-sm"
            disabled={!canSave}
            onClick={handleSave}
          >
            {saving ? "Saving…" : "Save item"}
          </button>
        </div>
      </div>
    </Dialog>
  );
}

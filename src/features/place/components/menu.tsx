"use client";

import Image from "next/image";
import { normalizeImageSrc } from "@/lib/utils/images";
import { MenuItemWithPhotos, MenuSection } from "@/lib/types/database";
import { PlusIcon, ImageOff } from "lucide-react";
import { useMemo, useState, useCallback } from "react";
import { Dialog } from "@/components/ui/dialog";
import MenuGallery from "./menu-gallery.client";

export default function Menu({
  menu,
}: {
  menu?: {
    sections?: MenuSection[];
    items?: MenuItemWithPhotos[];
    itemsBySection?: Map<string, MenuItemWithPhotos[]>;
    ungrouped?: MenuItemWithPhotos[];
  };
}) {
  const m = menu ?? {
    sections: [],
    items: [],
    itemsBySection: new Map(),
    ungrouped: [],
  };

  const sections = useMemo(() => m.sections ?? [], [m.sections]);
  let itemsBySection: Map<string, MenuItemWithPhotos[]>;

  // Handle RPC data format (sections + items arrays) vs old format (itemsBySection Map)
  if (m.itemsBySection instanceof Map) {
    // Old format with itemsBySection Map
    itemsBySection = m.itemsBySection as Map<string, MenuItemWithPhotos[]>;
  } else if (m.items && Array.isArray(m.items)) {
    // RPC format with sections and items arrays - organize items by section
    itemsBySection = new Map();
    const items = m.items as MenuItemWithPhotos[];

    // Group items by section_id
    items.forEach((item) => {
      const sectionId = (item as MenuItemWithPhotos & { section_id?: string })
        .section_id;
      if (sectionId) {
        if (!itemsBySection.has(sectionId)) {
          itemsBySection.set(sectionId, []);
        }
        itemsBySection.get(sectionId)!.push(item);
      }
    });
  } else {
    itemsBySection = new Map();
  }

  const ungrouped = useMemo(() => m.ungrouped ?? [], [m.ungrouped]);

  const allItems = useMemo(() => {
    const list: MenuItemWithPhotos[] = [];
    for (const s of sections) {
      const items = itemsBySection.get(s.id) || [];
      for (const it of items) list.push(it);
    }
    for (const it of ungrouped) list.push(it);
    return list;
  }, [sections, itemsBySection, ungrouped]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  const openItem = useCallback((index: number, photoIndex = 0) => {
    setCurrentItemIndex(index);
    setCurrentPhotoIndex(photoIndex);
    setDialogOpen(true);
  }, []);

  const hasContent = sections.length > 0 || ungrouped.length > 0;
  if (!hasContent) return null;

  return (
    <div>
      {sections?.map((section) => {
        const items = itemsBySection.get(section.id) || [];
        if (!items.length) return null;
        return (
          <div key={section.id} className="mt-8">
            <div className="text-foreground mb-1 text-lg font-semibold">
              {section.name}
            </div>

            <div className="mt-3 grid gap-2 md:grid-cols-2">
              {items.map((item) => {
                const globalIndex = allItems.findIndex((i) => i.id === item.id);
                return (
                  <div
                    key={item.id}
                    className="border-border flex items-center gap-3.5 border p-4"
                  >
                    <div className="bg-muted size-24 overflow-hidden">
                      {item.menu_item_photos?.[0]?.file_path ? (
                        <button
                          type="button"
                          onClick={() => openItem(globalIndex, 0)}
                          className="relative size-full"
                          aria-label="View menu photos"
                        >
                          <Image
                            src={normalizeImageSrc(
                              item.menu_item_photos[0].file_path,
                            )}
                            alt={item.menu_item_photos[0].alt_text || item.name}
                            fill
                            sizes="96px"
                            className="object-cover"
                          />
                        </button>
                      ) : (
                        <div className="relative size-full">
                          <div className="text-muted-foreground flex h-full items-center justify-center p-2 text-center text-sm leading-none">
                            <ImageOff
                              size={24}
                              className="text-muted-foreground"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex h-fit flex-1 flex-col overflow-hidden">
                      <div className="text-foreground font-semibold">
                        {item.name}
                      </div>
                      <div className="text-foreground mt-1 text-sm">
                        {item.price != null
                          ? `${item.price.toFixed(0)} ${item.currency || "ETB"}`
                          : ""}
                      </div>

                      {item.description ? (
                        <div className="mt-1 line-clamp-2 leading-6">
                          {item.description}
                        </div>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {ungrouped?.length ? (
        <div className="mt-6">
          <div className="text-foreground mb-1 text-lg font-semibold">
            Other
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {ungrouped.map((item) => (
              <div key={item.id} className="border-border border p-3">
                <div className="flex items-start gap-3">
                  {item.menu_item_photos?.[0]?.file_path ? (
                    <div className="relative h-16 w-16 overflow-hidden">
                      <Image
                        src={normalizeImageSrc(
                          item.menu_item_photos[0].file_path,
                        )}
                        alt={item.menu_item_photos[0].alt_text || item.name}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    </div>
                  ) : null}
                  <div className="flex-1">
                    <div className="text-foreground font-medium">
                      {item.name}
                    </div>
                    {item.description ? (
                      <div className="text-muted-foreground text-sm">
                        {item.description}
                      </div>
                    ) : null}
                  </div>
                  <div className="text-foreground text-sm font-medium">
                    {item.price != null
                      ? `${item.price.toFixed(0)} ${item.currency || "ETB"}`
                      : ""}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen} size="6xl">
        <MenuGallery
          items={allItems}
          currentItemIndex={currentItemIndex}
          setCurrentItemIndex={setCurrentItemIndex}
          currentPhotoIndex={currentPhotoIndex}
          setCurrentPhotoIndex={setCurrentPhotoIndex}
        />
      </Dialog>
    </div>
  );
}

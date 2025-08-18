import Image from "next/image";
import { getPlaceMenu } from "@/lib/supabase/queries";
import { MenuItemWithPhotos, MenuSection } from "@/lib/types/database";

export default async function Menu({
  placeId,
  menu,
}: {
  placeId?: string;
  menu?: {
    sections?: MenuSection[];
    items?: MenuItemWithPhotos[];
    itemsBySection?: Map<string, MenuItemWithPhotos[]>;
    ungrouped?: MenuItemWithPhotos[];
  };
}) {
  // If menu is provided, use it; otherwise fetch from placeId
  let m: {
    sections?: MenuSection[];
    items?: MenuItemWithPhotos[];
    itemsBySection?: Map<string, MenuItemWithPhotos[]>;
    ungrouped?: MenuItemWithPhotos[];
  };

  if (menu) {
    m = menu;
  } else if (placeId) {
    m = (await getPlaceMenu(placeId).catch(() => ({}))) as unknown as {
      sections?: MenuSection[];
      itemsBySection?: Map<string, MenuItemWithPhotos[]>;
      ungrouped?: MenuItemWithPhotos[];
    };
  } else {
    m = {
      sections: [],
      itemsBySection: new Map(),
      ungrouped: [],
    };
  }

  const sections = m.sections ?? [];
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

  const ungrouped = m.ungrouped ?? [];

  const hasContent = sections.length > 0 || ungrouped.length > 0;
  if (!hasContent) return null;

  return (
    <div>
      {sections?.map((section) => {
        const items = itemsBySection.get(section.id) || [];
        if (!items.length) return null;
        return (
          <div key={section.id} className="mt-4">
            <div className="text-foreground mb-1 text-lg font-medium">
              {section.name}
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="border-border rounded-2xl border p-3"
                >
                  <div className="flex items-start gap-3">
                    {item.menu_item_photos?.[0]?.file_path ? (
                      <div className="relative h-16 w-16 overflow-hidden rounded-xl">
                        <Image
                          src={`https://res.cloudinary.com/demo/image/fetch/q_auto,f_auto,w_200/${encodeURIComponent(item.menu_item_photos[0].file_path)}`}
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
        );
      })}

      {ungrouped?.length ? (
        <div className="mt-6">
          <div className="text-foreground mb-1 text-lg font-medium">Other</div>
          <div className="grid gap-3 md:grid-cols-2">
            {ungrouped.map((item) => (
              <div
                key={item.id}
                className="border-border rounded-2xl border p-3"
              >
                <div className="flex items-start gap-3">
                  {item.menu_item_photos?.[0]?.file_path ? (
                    <div className="relative h-16 w-16 overflow-hidden rounded-xl">
                      <Image
                        src={`https://res.cloudinary.com/demo/image/fetch/q_auto,f_auto,w_200/${encodeURIComponent(item.menu_item_photos[0].file_path)}`}
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
    </div>
  );
}

import Image from "next/image";

interface MenuItem {
  id: string;
  name: string;
  description?: string | null;
  price?: number | null;
  currency?: string | null;
  is_available: boolean;
  menu_item_photos?: {
    id: string;
    file_path: string;
    alt_text?: string | null;
  }[];
}

export default function Menu({
  sections,
  itemsBySection,
  ungrouped,
}: {
  sections: { id: string; name: string; position?: number | null }[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  itemsBySection: Map<string, any[]>;
  items?: never;
  ungrouped: MenuItem[];
}) {
  const hasContent =
    (sections?.length || 0) > 0 || (ungrouped?.length || 0) > 0;
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

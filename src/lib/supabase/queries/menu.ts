import { supabase } from "../client";

// Get place menu
export async function getPlaceMenu(placeId: string) {
  const { data, error } = await supabase
    .from("branch_menu_sections")
    .select(
      `
      id,
      position,
      is_active,
      menu_sections(
        id,
        name,
        description,
        icon_name
      ),
      menu_items(
        id,
        name,
        description,
        price,
        currency,
        is_available,
        created_at
      )
    `,
    )
    .eq("branch_id", placeId)
    .eq("is_active", true)
    .order("position");

  if (error) throw error;

  // Transform the data to a more usable format
  return (data || []).map((section) => ({
    id: section.id,
    position: section.position,
    name: section.menu_sections?.[0]?.name,
    description: section.menu_sections?.[0]?.description,
    icon_name: section.menu_sections?.[0]?.icon_name,
    items: (section.menu_items || []).map(
      (item: {
        id: string;
        name: string;
        description: string | null;
        price: number | null;
        currency: string;
        is_available: boolean;
        created_at: string;
      }) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        price: item.price,
        currency: item.currency,
        is_available: item.is_available,
        created_at: item.created_at,
      }),
    ),
  }));
}

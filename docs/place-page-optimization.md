# Place Page Data Optimization

## Overview

The place page was optimized to fetch all required data in a single RPC call instead of multiple separate database queries. This significantly improves performance and reduces network overhead.

## Performance Optimizations

### 1. Single RPC Function

**Before**: 6+ separate database calls

- `getPlaceWithFullDetails()` (main data)
- `getPlacePhotoCategories()` (photo categories)
- `getPlacePhotos()` (photos)
- `getPlaceHours()` (hours)
- `getPlaceAmenities()` (amenities)
- `getPlaceMenu()` (menu)
- Reviews component (separate calls)
- Similar places component (separate calls)

**After**: 1 RPC call

- `getPlacePageData()` (everything in one optimized query)

### 2. Database Indexes

Added critical indexes for RPC function performance:

```sql
-- Core indexes
CREATE INDEX IF NOT EXISTS branches_place_id_idx ON public.branches (place_id);
CREATE INDEX IF NOT EXISTS branches_slug_idx ON public.branches (slug);
CREATE INDEX IF NOT EXISTS branches_is_active_idx ON public.branches (is_active);

-- Review indexes
CREATE INDEX IF NOT EXISTS reviews_branch_id_idx ON public.reviews (branch_id);
CREATE INDEX IF NOT EXISTS reviews_is_active_idx ON public.reviews (is_active);

-- Photo indexes
CREATE INDEX IF NOT EXISTS branch_photos_branch_id_idx ON public.branch_photos (branch_id);
CREATE INDEX IF NOT EXISTS branch_photos_category_id_idx ON public.branch_photos (photo_category_id);

-- Related data indexes
CREATE INDEX IF NOT EXISTS branch_amenities_branch_id_idx ON public.branch_amenities (branch_id);
CREATE INDEX IF NOT EXISTS branch_menu_sections_branch_id_idx ON public.branch_menu_sections (branch_id);
CREATE INDEX IF NOT EXISTS places_category_id_idx ON public.places (category_id);
CREATE INDEX IF NOT EXISTS places_is_active_idx ON public.places (is_active);
```

### 3. Avoided Heavy View

**Problem**: The `branches_with_details` view contains multiple `json_agg` subqueries that execute on every call, making it expensive for large datasets.

**Solution**: The RPC function directly queries the base tables instead of using the heavy view, with targeted subqueries only where needed.

### 4. Proper LIMIT Usage

The RPC function now properly respects all limit parameters:

- `in_photo_limit`: Limits photos returned
- `in_review_limit`: Limits reviews returned
- `in_similar_limit`: Limits similar places returned
- `in_photo_category_id`: Filters photos by category

## Materialized View Option

For even better performance, consider creating a materialized view if data doesn't need to be 100% live:

```sql
CREATE MATERIALIZED VIEW public.place_page_data AS
SELECT
  p.id as place_id,
  p.slug as place_slug,
  -- ... all the data
FROM public.places p
-- ... joins
GROUP BY p.id;

-- Refresh periodically
REFRESH MATERIALIZED VIEW public.place_page_data;
```

## Usage

```typescript
// Get all place page data with custom limits
const pageData = await getPlacePageData(slug, {
  photoLimit: 12,
  photoCategoryId: activeCategoryId,
  reviewLimit: 10,
  similarLimit: 6,
});

// Access the data
const place = pageData.place;
const photos = pageData.photos;
const reviews = pageData.reviews;
const similarPlaces = pageData.similar_places;
```

## Performance Benefits

1. **Reduced Network Calls**: From 6+ to 1
2. **Better Caching**: All data fetched together
3. **Optimized Queries**: Direct table access with proper indexes
4. **Configurable Limits**: Control data size based on needs
5. **Type Safety**: Full TypeScript support

## Monitoring

Monitor the following for performance:

- Query execution time for `get_place_page_data`
- Index usage on the new indexes
- Memory usage for large JSON responses
- Consider pagination for very large datasets

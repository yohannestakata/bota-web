"use client";

import { usePostHog } from "posthog-js/react";

export function useAnalytics() {
  const posthog = usePostHog();

  const trackPlaceView = (
    place: {
      id: string;
      name: string;
      slug: string;
      category_name?: string | null;
      city?: string | null;
      average_rating?: number | null;
      review_count?: number | null;
    },
    branch?: { id: string; name: string; slug: string },
  ) => {
    posthog.capture("place_viewed", {
      place_id: place.id,
      place_name: place.name,
      place_slug: place.slug,
      category: place.category_name,
      city: place.city,
      average_rating: place.average_rating,
      review_count: place.review_count,
      branch_id: branch?.id,
      branch_name: branch?.name,
      branch_slug: branch?.slug,
      is_branch_view: !!branch,
    });
  };

  const trackReviewSubmitted = (
    place: {
      id: string;
      name: string;
      slug: string;
    },
    review: {
      rating: number;
      has_photos: boolean;
      text_length: number;
    },
  ) => {
    posthog.capture("review_submitted", {
      place_id: place.id,
      place_name: place.name,
      place_slug: place.slug,
      rating: review.rating,
      has_photos: review.has_photos,
      text_length: review.text_length,
    });
  };

  const trackPhotoUploaded = (
    place: {
      id: string;
      name: string;
      slug: string;
    },
    photo: {
      category_id?: number;
      category_name?: string;
    },
  ) => {
    posthog.capture("photo_uploaded", {
      place_id: place.id,
      place_name: place.name,
      place_slug: place.slug,
      photo_category_id: photo.category_id,
      photo_category_name: photo.category_name,
    });
  };

  const trackSearchPerformed = (query: string, results_count: number) => {
    posthog.capture("search_performed", {
      query,
      results_count,
      query_length: query.length,
    });
  };

  const trackFavoriteAdded = (place: {
    id: string;
    name: string;
    slug: string;
  }) => {
    posthog.capture("favorite_added", {
      place_id: place.id,
      place_name: place.name,
      place_slug: place.slug,
    });
  };

  const trackFavoriteRemoved = (place: {
    id: string;
    name: string;
    slug: string;
  }) => {
    posthog.capture("favorite_removed", {
      place_id: place.id,
      place_name: place.name,
      place_slug: place.slug,
    });
  };

  const trackCategoryViewed = (category: {
    id: number;
    name: string;
    slug: string;
  }) => {
    posthog.capture("category_viewed", {
      category_id: category.id,
      category_name: category.name,
      category_slug: category.slug,
    });
  };

  const trackPlaceAdded = (place: {
    name: string;
    category_id: number;
    category_name: string;
    city?: string;
  }) => {
    posthog.capture("place_added", {
      place_name: place.name,
      category_id: place.category_id,
      category_name: place.category_name,
      city: place.city,
    });
  };

  return {
    trackPlaceView,
    trackReviewSubmitted,
    trackPhotoUploaded,
    trackSearchPerformed,
    trackFavoriteAdded,
    trackFavoriteRemoved,
    trackCategoryViewed,
    trackPlaceAdded,
  };
}

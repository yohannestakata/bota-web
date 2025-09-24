// Re-export all queries from the modular structure
export * from "./queries/index";

// Legacy exports for backward compatibility
// These functions are now imported from their respective modules
// but kept here to avoid breaking existing imports
export { getCategories, getAllCategories } from "./queries/categories";

export { getCuisineTypes } from "./queries/cuisines";

export {
  getPhotoCategories,
  getPlacePhotoCategories,
  getPlacePhotos,
  uploadPlacePhoto,
  uploadReviewPhoto,
  getFirstPhotosForReviewIds,
  getLatestCoverForPlaceIds,
  getPhotosByAuthor,
} from "./queries/photos";

export {
  getPlaceWithDetails,
  getPlaceBySlugWithDetails,
  getPlaceWithFullDetails,
  getPlacePageData,
  getBranchBySlug,
  getPlaces,
  getPlacesByCategory,
  getPlacesByCategoryPaged,
  getSimilarPlaces,
  getNearbyPlaces,
  searchPlaces,
  getAllActivePlaceSlugs,
  getAllActiveBranchSlugs,
  getMenuItemsForPlace,
  type PlaceWithFullDetails,
  type BranchWithDetails,
} from "./queries/places";

export { getFeaturedPlaces } from "./queries/featured";

export {
  createReview,
  getReviewsForPlace,
  getRecentReviews,
  getRecentReviewsPopular,
  getRecentReviewsNearby,
  getRecentReviewsFood,
  getReviewsByAuthor,
  getRepliesForReviewIds,
  getReviewWithDetails,
  setReviewReaction,
  getUserReviewStats,
  type ReactionType,
} from "./queries/reviews";

export {
  getProfileByHandle,
  getSearchHistory,
  saveSearchQuery,
} from "./queries/profiles";

export { getPlaceAmenities } from "./queries/amenities";

export { getPlaceHours } from "./queries/hours";

export { getPlaceMenu } from "./queries/menu";

export {
  createPlaceEditRequest,
  getMyPlaceEditRequests,
} from "./queries/edit-requests";

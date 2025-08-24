"use client";

import ReviewsClient, { type ReviewItemProps } from "./reviews.client";

export default function Reviews({
  placeId,
  reviews,
}: {
  placeId?: string;
  reviews?: ReviewItemProps["review"][];
}) {
  if (!reviews || !reviews.length) {
    return <div className="text-muted-foreground">No reviews available.</div>;
  }
  return <ReviewsClient reviews={reviews} />;
}

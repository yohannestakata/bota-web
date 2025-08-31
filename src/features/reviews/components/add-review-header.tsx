import Link from "next/link";

export default function AddReviewHeader({
  placeSlug,
  placeName,
}: {
  placeSlug: string;
  placeName: string;
}) {
  return (
    <h1 className="font-heading text-4xl">
      <span className="font-normal"> Write a review for </span>{" "}
      <Link
        href={`/place/${placeSlug}`}
        className="font-bold decoration-2 underline-offset-4 hover:underline"
      >
        {placeName}
      </Link>
    </h1>
  );
}

import Link from "next/link";

export default function AddReviewHeader({
  placeSlug,
  placeName,
  branchName,
  branchSlug,
  isMainBranch,
}: {
  placeSlug: string;
  placeName: string;
  branchName?: string;
  branchSlug?: string;
  isMainBranch?: boolean;
}) {
  return (
    <h1 className="font-heading text-4xl">
      <span className="font-normal"> Write a review for </span>{" "}
      {isMainBranch ? (
        <Link
          href={`/place/${placeSlug}`}
          className="font-bold decoration-2 underline-offset-4 hover:underline"
        >
          {placeName}
          {branchName ? (
            <span className="font-bold"> ({branchName})</span>
          ) : null}
        </Link>
      ) : (
        <Link
          href={`/place/${placeSlug}/${branchSlug ?? ""}`}
          className="font-bold decoration-2 underline-offset-4 hover:underline"
        >
          {placeName}
          {branchName ? (
            <span className="font-bold"> ({branchName})</span>
          ) : null}
        </Link>
      )}
    </h1>
  );
}

import { Star, ThumbsUp, User, Heart, Meh, ThumbsDown } from "lucide-react";
import Image from "next/image";

interface ReviewCardProps {
  review: {
    id: number;
    place: string;
    category: string;
    rating: number;
    review: string;
    user: string;
    date: string;
    likes: number;
    loves: number;
    mehs: number;
    dislikes: number;
    comments: number;
    image: string;
  };
}

export default function ReviewCard({ review }: ReviewCardProps) {
  return (
    <div className="border-border overflow-hidden rounded-3xl border">
      <div className="bg-muted relative flex aspect-video items-center justify-center rounded-t-2xl">
        <Image
          className="object-cover"
          fill
          src={review.image}
          alt={review.place}
        />
      </div>
      <div>
        <div className="mt-2 flex items-center justify-between px-3">
          <div>
            <h3 className="text-foreground font-medium">{review.place}</h3>
            <p className="text-muted-foreground text-sm">{review.category}</p>
          </div>

          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="font-medium">{review.rating}</span>
          </div>
        </div>

        <p className="text-foreground mt-1 line-clamp-3 px-3">
          {review.review}
        </p>

        <div className="text-muted-foreground mt-2 flex items-center justify-between px-3 text-sm">
          <div className="flex items-center gap-2">
            <div className="bg-muted rounded-full p-1">
              <User className="h-4 w-4" />
            </div>
            <span>{review.user}</span>
          </div>
          <span>{review.date}</span>
        </div>

        <div className="mt-3 mb-3 px-3">
          <div className="border-border flex items-center justify-around border-t pt-2">
            <div className="flex items-center gap-2" title="Like">
              <ThumbsUp className="text-muted-foreground h-4 w-4" />
              <span className="text-muted-foreground">{review.likes}</span>
            </div>
            <div className="flex items-center gap-2" title="Love">
              <Heart className="text-muted-foreground h-4 w-4" />
              <span className="text-muted-foreground">{review.loves}</span>
            </div>
            <div className="flex items-center gap-2" title="Meh">
              <Meh className="text-muted-foreground h-4 w-4" />
              <span className="text-muted-foreground">{review.mehs}</span>
            </div>
            <div className="flex items-center gap-2" title="Dislike">
              <ThumbsDown className="text-muted-foreground h-4 w-4" />
              <span className="text-muted-foreground">{review.dislikes}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

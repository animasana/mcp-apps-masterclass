import type { Review } from '../types';
import { StarRating } from './StarRating';

function timeAgo(timestamp: number): string {
	const days = Math.round((timestamp * 1000 - Date.now()) / 86400000);
	return new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(days, 'day');
}

type Props = {
	reviews: Review[];
};

export function ReviewList({ reviews }: Props) {
	if (reviews.length === 0) {
		return <p className="text-white/40 text-sm">No reviews yet. Be the first!</p>;
	}

	return (
		<div className="flex flex-col gap-3">
			{reviews.map((review, i) => (
				<div key={i} className="p-3 rounded-2xl border border-white/10 bg-neutral-900">
					<div className="flex items-center justify-between mb-1">
						<StarRating rating={review.rating} size={14} />
						<span className="text-xs text-white/30">{timeAgo(review.createdAt)}</span>
					</div>
					{review.text && <p className="text-sm text-white/70 leading-relaxed">{review.text}</p>}
				</div>
			))}
		</div>
	);
}

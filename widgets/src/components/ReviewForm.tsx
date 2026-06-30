import { useState } from 'react';
import type { App } from '@modelcontextprotocol/ext-apps';
import type { Review } from '../types';
import { StarRating } from './StarRating';

type Props = {
	app: App | null;
	productId: string;
	onSubmitted: (reviews: Review[]) => void;
};

export function ReviewForm({ app, productId, onSubmitted }: Props) {
	const [rating, setRating] = useState(0);
	const [text, setText] = useState('');
	const [isPending, setIsPending] = useState(false);

	const handleSubmit = async () => {
		if (!app || rating === 0) return;
		setIsPending(true);
		try {
			// TODO: Submit review
			void productId; void onSubmitted;
		} finally {
			setIsPending(false);
		}
	};

	return (
		<div className="flex flex-col gap-3">
			<h4 className="text-sm font-medium text-neutral-100">Write a review</h4>
			<StarRating rating={rating} onRate={setRating} />
			<textarea
				value={text}
				onChange={(e) => setText(e.target.value)}
				placeholder="Share your experience..."
				rows={3}
				className="bg-neutral-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-neutral-100 placeholder:text-white/30 resize-none outline-none focus:border-white/20"
			/>
			<div className="flex gap-2">
				<button
					onClick={handleSubmit}
					disabled={isPending || rating === 0}
					className="flex-1 py-2 rounded-xl bg-white text-black text-sm font-semibold cursor-pointer hover:bg-neutral-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{isPending ? 'Submitting...' : 'Submit Review'}
				</button>
			</div>
		</div>
	);
}

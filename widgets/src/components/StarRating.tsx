type Props = {
	rating: number;
	onRate?: (rating: number) => void;
	size?: number;
};

export function StarRating({ rating, onRate, size = 20 }: Props) {
	return (
		<div className="flex gap-0.5">
			{[1, 2, 3, 4, 5].map((star) => (
				<button
					key={star}
					type="button"
					onClick={() => onRate?.(star)}
					disabled={!onRate}
					className="bg-transparent border-none p-0 cursor-pointer disabled:cursor-default"
				>
					<svg
						width={size}
						height={size}
						viewBox="0 0 24 24"
						fill={star <= rating ? '#facc15' : 'none'}
						stroke={star <= rating ? '#facc15' : 'rgba(255,255,255,0.2)'}
						strokeWidth={2}
					>
						<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
					</svg>
				</button>
			))}
		</div>
	);
}

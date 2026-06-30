import { useState } from 'react';
import type { App } from '@modelcontextprotocol/ext-apps';
import type { CartItem } from '../types';

const MinusIcon = () => (
	<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
		<line x1="5" y1="12" x2="19" y2="12" />
	</svg>
);

const PlusIcon = () => (
	<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
		<line x1="12" y1="5" x2="12" y2="19" />
		<line x1="5" y1="12" x2="19" y2="12" />
	</svg>
);

type QuantityStepperProps = {
	app: App | null;
	productId: string;
	quantity: number;
	setCart: (items: CartItem[]) => void;
};

export function QuantityStepper({ app, productId, quantity, setCart }: QuantityStepperProps) {
	const [isPending, setIsPending] = useState(false);

	const handleAdjust = async (delta: number) => {
		if (!app || isPending) return;
		setIsPending(true);
		// TODO: Modify cart quantity
		void productId; void delta; void setCart;
		setIsPending(false);
	};

	return (
		<div className={`flex items-center rounded-full border border-white/10 transition-opacity bg-black px-1.5 py-1 ${isPending ? 'opacity-50' : ''}`}>
			<button
				onClick={(event) => {
					event.stopPropagation();
					handleAdjust(-1);
				}}
				disabled={isPending}
				className="bg-transparent border-none cursor-pointer p-1 flex disabled:cursor-not-allowed text-white/60"
			>
				<MinusIcon />
			</button>
			<span className="mx-2 text-center font-medium text-neutral-100 min-w-5 text-sm">{quantity}</span>
			<button
				onClick={(event) => {
					event.stopPropagation();
					handleAdjust(1);
				}}
				disabled={isPending}
				className="bg-transparent border-none cursor-pointer p-1 flex disabled:cursor-not-allowed text-white/60"
			>
				<PlusIcon />
			</button>
		</div>
	);
}

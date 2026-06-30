import { useState } from 'react';
import type { App } from '@modelcontextprotocol/ext-apps';
import type { CartItem } from '../types';

export function useAddToCart(app: App | null, productId: string, setCart: (items: CartItem[]) => void) {
	const [isPending, setIsPending] = useState(false);

	const addToCart = async () => {
		if (!app || isPending) return;
		setIsPending(true);
		// TODO: Add to cart
		void productId; void setCart;
		setIsPending(false);
	};

	return { addToCart, isPending };
}

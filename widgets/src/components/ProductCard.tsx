import type { Product, CartItem } from '../types';
import type { App } from '@modelcontextprotocol/ext-apps';
import { QuantityStepper } from './QuantityStepper';
import { useAddToCart } from '../hooks/useAddToCart';
import { useFormatPrice } from '../hooks/useFormatPrice';

type ProductCardProps = {
	app: App | null;
	item: Product;
	cart: CartItem[];
	setCart: (items: CartItem[]) => void;
	onSelect: () => void;
};

export function ProductCard({ app, item, cart, setCart, onSelect }: ProductCardProps) {
	const { addToCart, isPending } = useAddToCart(app, item.id, setCart);
	const formatPrice = useFormatPrice(app);
	const cartItem = cart.find((c) => c.id === item.id);

	return (
		<article
			onClick={() => onSelect()}
			className="cursor-pointer border border-white/10 hover:border-emerald-500 rounded-3xl overflow-hidden transition-colors duration-200 bg-neutral-900"
		>
			<div className="overflow-hidden">
				<img src={item.image} alt={item.name} className="w-full h-60 object-cover" />
			</div>
			<div className="px-4 pt-3 pb-4">
				<p className="text-base font-semibold text-neutral-100">{item.name}</p>
				<p className="text-sm text-white/60 my-1">{formatPrice(item.price)}</p>
				<p className="text-sm text-white/40 my-2">{item.shortDescription}</p>
				<div className="flex items-center gap-2">
					{cartItem ? (
						<QuantityStepper app={app} productId={item.id} quantity={cartItem.quantity} setCart={setCart} />
					) : (
						<button
							onClick={(event) => {
								event.stopPropagation();
								addToCart();
							}}
							disabled={isPending}
							className="py-2 px-5 rounded-full bg-white text-black text-sm font-medium cursor-pointer hover:bg-neutral-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{isPending ? 'Adding...' : 'Add to Cart'}
						</button>
					)}
				</div>
			</div>
		</article>
	);
}

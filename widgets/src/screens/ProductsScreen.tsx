import { LoadingIndicator } from '@openai/apps-sdk-ui/components/Indicator';
import type { Product, CartItem } from '../types';
import type { App } from '@modelcontextprotocol/ext-apps';
import type { View } from '../App';
import { ProductCard } from '../components/ProductCard';

type Props = {
	app: App | null;
	products: Product[];
	cart: CartItem[];
	setCart: (items: CartItem[]) => void;
	onSelectProduct: (product: Product) => void;
	onNavigate: (view: View) => void;
};

const ShoppingCartIcon = () => (
	<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
		<circle cx="9" cy="21" r="1" />
		<circle cx="20" cy="21" r="1" />
		<path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
	</svg>
);

export function ProductsScreen({ app, products, cart, setCart, onSelectProduct, onNavigate }: Props) {
	const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

	return (
		<div className="min-h-screen bg-black text-neutral-100">
			<div className="max-w-7xl mx-auto p-5">
				<header className="flex items-center border-b border-white/10 pb-3 mb-4 gap-3">
					<button
						onClick={() => onNavigate('cart')}
						className="flex items-center gap-2 px-4 py-2 border border-white/10 rounded-lg bg-neutral-900 text-neutral-100 cursor-pointer"
					>
						<ShoppingCartIcon />
						<span>Cart ({cartCount})</span>
					</button>
				</header>

				{products.length === 0 ? (
					<div className="flex items-center justify-center min-h-50">
						<LoadingIndicator size={32} />
					</div>
				) : (
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
						{products.map((product) => (
							<ProductCard
								key={product.id}
								app={app}
								item={product}
								cart={cart}
								setCart={setCart}
								onSelect={() => onSelectProduct(product)}
							/>
						))}
					</div>
				)}
			</div>
		</div>
	);
}

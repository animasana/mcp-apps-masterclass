import type { CartItem, Product, Review } from '../types';
import type { App } from '@modelcontextprotocol/ext-apps';
import type { View } from '../App';
import { QuantityStepper } from '../components/QuantityStepper';
import { BackToProducts } from '../components/BackToProducts';
import { useAddToCart } from '../hooks/useAddToCart';
import { useFormatPrice } from '../hooks/useFormatPrice';
import { ReviewList } from '../components/ReviewList';
import { ReviewForm } from '../components/ReviewForm';

type Props = {
	app: App | null;
	hasProducts: boolean;
	selectedProduct: Product;
	cart: CartItem[];
	setCart: (items: CartItem[]) => void;
	reviews: Review[];
	setReviews: (reviews: Review[]) => void;
	onNavigate: (view: View) => void;
};

export function ProductDetailScreen({ app, hasProducts, selectedProduct, cart, setCart, reviews, setReviews, onNavigate }: Props) {
	const { addToCart, isPending } = useAddToCart(app, selectedProduct.id, setCart);
	const formatPrice = useFormatPrice(app);

	const cartItem = cart.find((c) => c.id === selectedProduct.id);
	const quantity = cartItem?.quantity ?? 0;
	const { nutritionFacts, higlights } = selectedProduct;

	return (
		<div className="min-h-screen bg-black text-neutral-100">
			<div className="max-w-7xl mx-auto p-5">
				{hasProducts && <BackToProducts onClick={() => onNavigate('products')} />}
				<div className="flex flex-col gap-4">
					<div className="overflow-hidden rounded-2xl">
						<img src={selectedProduct.image} alt={selectedProduct.name} className="w-full h-72 object-cover" />
					</div>
					<div className="flex flex-col gap-3">
						<div className="flex justify-between items-start gap-4">
							<div>
								<h2 className="text-lg font-semibold text-neutral-100">{selectedProduct.name}</h2>
								<p className="text-lg text-white/80">{formatPrice(selectedProduct.price)}</p>
							</div>
							{quantity > 0 && (
								<QuantityStepper app={app} productId={selectedProduct.id} quantity={quantity} setCart={setCart} />
							)}
						</div>
						<p className="text-sm text-white/60 leading-relaxed">{selectedProduct.description}</p>
						<p className="text-sm font-medium text-neutral-100">{selectedProduct.detailSummary}</p>
						<div className="grid grid-cols-4 gap-3 bg-neutral-900 border border-white/10 rounded-2xl px-4 py-3 text-center">
							{nutritionFacts.map((fact) => (
								<div key={fact.label}>
									<p className="text-base font-semibold text-neutral-100">{fact.value}</p>
									<p className="text-xs text-white/50">{fact.label}</p>
								</div>
							))}
						</div>
						<div className="text-sm text-white/50 leading-relaxed">
							{higlights.map((item, index) => (
								<p key={index} className="my-1">
									• {item}
								</p>
							))}
						</div>
						<div className="mt-4 border-t border-white/10 pt-4">
							<h3 className="text-base font-semibold text-neutral-100 mb-3">Reviews ({reviews.length})</h3>
							<ReviewList reviews={reviews} />
							<div className="mt-4">
								<ReviewForm app={app} productId={selectedProduct.id} onSubmitted={setReviews} />
							</div>
						</div>
					</div>
				</div>
				{!cartItem && (
					<div className="mt-4">
						<button
							onClick={addToCart}
							disabled={isPending}
							className="w-full py-3.5 rounded-full bg-white text-black text-base font-semibold cursor-pointer hover:bg-neutral-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{isPending ? 'Adding...' : `Add to Cart — ${formatPrice(selectedProduct.price)}`}
						</button>
					</div>
				)}
			</div>
		</div>
	);
}

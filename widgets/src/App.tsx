import { useState, useCallback, useEffect } from 'react';
import { applyDocumentTheme, applyHostStyleVariables, useApp } from '@modelcontextprotocol/ext-apps/react';
import { LoadingIndicator } from '@openai/apps-sdk-ui/components/Indicator';
import type { Product, CartItem, Order, Review } from './types';
import { ProductsScreen } from './screens/ProductsScreen';
import { ProductDetailScreen } from './screens/ProductDetailScreen';
import { CartScreen } from './screens/CartScreen';
import { CheckoutCompleteScreen } from './screens/CheckoutCompleteScreen';

export type View = 'loading' | 'products' | 'product' | 'cart' | 'checkout-complete';

export default function App() {
	const [view, setView] = useState<View>('loading');
	const [products, setProducts] = useState<Product[]>([]);
	const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
	const [cart, setCart] = useState<CartItem[]>([]);
	const [lastOrder, setLastOrder] = useState<Order | null>(null);
	const [reviews, setReviews] = useState<Review[]>([]);

	const handleToolResult = useCallback(
		({
			structuredContent,
		}: {
			structuredContent?: {
				product?: Product;
				products?: Product[];
				cartItems?: CartItem[];
				reviews?: Review[];
			};
		}) => {
			if (!structuredContent) return;
			if ('product' in structuredContent) {
				setSelectedProduct(structuredContent.product!);
				if (structuredContent.reviews) {
					setReviews(structuredContent.reviews);
				}
				setView('product');
			} else if ('products' in structuredContent) {
				setProducts(structuredContent.products!);
				setView('products');
			} else if ('cartItems' in structuredContent) {
				setCart(structuredContent.cartItems!);
				setView('cart');
			}
		},
		[],
	);

	const { app, isConnected } = useApp({
		appInfo: { name: 'ecommerce-widget', version: '1.0.0' },
		capabilities: {},
		onAppCreated: (app) => {
			app.ontoolresult = handleToolResult;
		},
	});

	useEffect(() => {
		if (!app) return;
		const ctx = app.getHostContext();
		if (ctx?.theme) {
			applyDocumentTheme(ctx.theme);
		}
		if (ctx?.styles?.variables) {
			applyHostStyleVariables(ctx.styles.variables);
		}
	}, [app]);

	if (!isConnected) {
		return (
			<div className="min-h-24 bg-black text-white/60 flex items-center justify-center">
				Connecting...
			</div>
		);
	}

	if (view === 'product' && selectedProduct) {
		return (
			<ProductDetailScreen
				app={app}
				hasProducts={products.length > 0}
				selectedProduct={selectedProduct}
				cart={cart}
				setCart={setCart}
				reviews={reviews}
				setReviews={setReviews}
				onNavigate={setView}
			/>
		);
	}

	if (view === 'cart') {
		return (
			<CartScreen
				app={app}
				cart={cart}
				setCart={setCart}
				setLastOrder={setLastOrder}
				hasProducts={products.length > 0}
				onNavigate={setView}
			/>
		);
	}

	if (view === 'checkout-complete') {
		return <CheckoutCompleteScreen app={app} lastOrder={lastOrder} onNavigate={setView} />;
	}

	if (view === 'products') {
		return (
			<ProductsScreen
				app={app}
				products={products}
				cart={cart}
				setCart={setCart}
				onSelectProduct={(product) => {
					setSelectedProduct(product);
					setView('product');
				}}
				onNavigate={setView}
			/>
		);
	}

	return (
		<div className="min-h-24 bg-black text-white/60 flex items-center justify-center">
			<LoadingIndicator size={24} />
		</div>
	);
}

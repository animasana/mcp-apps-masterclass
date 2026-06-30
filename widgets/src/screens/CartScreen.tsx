import { useMemo, useState } from "react";
import type { CartItem, Order } from "../types";
import type { App } from "@modelcontextprotocol/ext-apps";
import type { View } from "../App";
import { QuantityStepper } from "../components/QuantityStepper";
import { BackToProducts } from "../components/BackToProducts";
import { useFormatPrice } from "../hooks/useFormatPrice";

type Props = {
    app: App | null;
    cart: CartItem[];
    setCart: (items: CartItem[]) => void;
    setLastOrder: (order: Order) => void;
    hasProducts: boolean;
    onNavigate: (view: View) => void;
};

export function CartScreen({
    app,
    cart,
    setCart,
    setLastOrder,
    hasProducts,
    onNavigate,
}: Props) {
    const formatPrice = useFormatPrice(app);
    const [isCheckingOut, setIsCheckingOut] = useState(false);

    const handleCheckout = async () => {
        if (!app) return;
        setIsCheckingOut(true);
        try {
            // TODO: Checkout
            const result = await app.callServerTool({
                name: "checkout",
                arguments: {},
            });
            if (!result.isError) {
				setLastOrder(result.structuredContent as Order);
				setCart([]);
                onNavigate("checkout-complete");
            }
        } finally {
            setIsCheckingOut(false);
        }
    };

    const subtotal = useMemo(
        () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
        [cart],
    );

    return (
        <div className="min-h-screen bg-black text-white">
            <div className="max-w-7xl mx-auto p-5">
                {hasProducts && (
                    <BackToProducts onClick={() => onNavigate("products")} />
                )}

                <h2 className="text-lg mb-4">
                    Your Cart ({cart.length} items)
                </h2>

                {cart.length === 0 ? (
                    <p className="text-white/60">Your cart is empty.</p>
                ) : (
                    <div className="flex flex-col gap-3">
                        {cart.map((item) => (
                            <div
                                key={item.id}
                                className="flex gap-3 p-3 rounded-2xl border border-white/10 bg-neutral-900"
                            >
                                <img
                                    src={item.image}
                                    alt={item.name}
                                    className="w-16 h-16 object-cover rounded-xl"
                                />
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-neutral-100">
                                        {item.name}
                                    </p>
                                    <p className="text-sm text-white/60 my-0.5">
                                        {formatPrice(item.price)}
                                    </p>
                                </div>
                                <QuantityStepper
                                    app={app}
                                    productId={item.id}
                                    quantity={item.quantity}
                                    setCart={setCart}
                                />
                            </div>
                        ))}

                        <section className="border-t border-white/10 pt-4 mt-2">
                            <div className="flex justify-between mb-1">
                                <span className="text-sm text-white/60">
                                    Subtotal
                                </span>
                                <span className="text-neutral-100">
                                    {formatPrice(subtotal)}
                                </span>
                            </div>
                            <div className="flex justify-between mb-4">
                                <span className="text-sm text-white/60">
                                    Total
                                </span>
                                <span className="font-semibold text-neutral-100">
                                    {formatPrice(subtotal)}
                                </span>
                            </div>
                            <button
                                onClick={handleCheckout}
                                disabled={isCheckingOut}
                                className="w-full py-3.5 rounded-full bg-white text-black text-base font-semibold cursor-pointer hover:bg-neutral-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isCheckingOut
                                    ? "Processing..."
                                    : "Continue to payment"}
                            </button>
                        </section>
                    </div>
                )}
            </div>
        </div>
    );
}

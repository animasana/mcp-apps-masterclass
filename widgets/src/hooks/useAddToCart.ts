import { useState } from "react";
import type { App } from "@modelcontextprotocol/ext-apps";
import type { CartItem } from "../types";

export function useAddToCart(
    app: App | null,
    productId: string,
    setCart: (items: CartItem[]) => void,
) {
    const [isPending, setIsPending] = useState(false);

    const addToCart = async () => {
        if (!app || isPending) return;
        setIsPending(true);
        // TODO: Add to cart
        const result = await app.callServerTool({
            name: "modify-cart",
            arguments: { productId, quantity: 1 },
        });
        if (!result.isError) {
            setCart(result.structuredContent?.cartItems as CartItem[]);
        }

        setIsPending(false);
    };

    return { addToCart, isPending };
}

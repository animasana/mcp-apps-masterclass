import type { App } from "@modelcontextprotocol/ext-apps";
import type { View } from "../App";
import type { Order } from "../types";
import { useFormatPrice } from "../hooks/useFormatPrice";

type Props = {
    app: App | null;
    lastOrder: Order | null;
    onNavigate: (view: View) => void;
};

export function CheckoutCompleteScreen({ app, lastOrder, onNavigate }: Props) {
    const formatPrice = useFormatPrice(app);

    const capabilities = app?.getHostCapabilities();

    const supportsFileDownload = "downloadFile" in (capabilities ?? {});

    const handleDownloadReceipt = async () => {
        if (!app || !lastOrder) return;
        // TODO: Download receipt
        await app.downloadFile({
            contents: [
                {
                    type: "resource",
                    resource: {
                        mimeType: "text/plain",
                        uri: `file:///receipt-${lastOrder.orderId}`,
                        text: `Order ${lastOrder.orderId}\n\nTotal: ${lastOrder.total}\n\nItems: ${JSON.stringify(lastOrder.cartItems)}`,
                    },
                },
            ],
        });
    };

    return (
        <div className="min-h-screen bg-black text-white">
            <div className="max-w-lg mx-auto px-5 py-10 text-center">
                <div className="text-5xl mb-4">&#10003;</div>
                <h2 className="text-xl mb-2">Order Confirmed</h2>
                {lastOrder && (
                    <p className="text-white/60 mb-6">
                        Order #{lastOrder.orderId.slice(0, 8)} —{" "}
                        {formatPrice(lastOrder.total)}
                    </p>
                )}
                <div className="flex flex-col gap-3">
                    {supportsFileDownload && (
                        <button
                            onClick={handleDownloadReceipt}
                            className="px-6 py-3 rounded-full border border-white/10 bg-neutral-900 text-white text-sm font-medium cursor-pointer hover:bg-neutral-800 transition-colors"
                        >
                            Download Receipt
                        </button>
                    )}
                    <button
                        onClick={() => onNavigate("products")}
                        className="px-6 py-3 rounded-full border-none bg-neutral-100 text-neutral-950 text-sm font-medium cursor-pointer"
                    >
                        Continue Shopping
                    </button>
                </div>
            </div>
        </div>
    );
}

import { useState } from "react";
import type { App } from "@modelcontextprotocol/ext-apps";
import type { Review } from "../types";
import { StarRating } from "./StarRating";

type Props = {
    app: App | null;
    productId: string;
    onSubmitted: (reviews: Review[]) => void;
};

export function ReviewForm({ app, productId, onSubmitted }: Props) {
    const canUpload = app?.getHostContext()?.userAgent === "chatgpt";
    const [rating, setRating] = useState(0);
    const [text, setText] = useState("");
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [isPending, setIsPending] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setIsUploading(true);
        try {
            if (!window.openai) return;
            const { fileId } = await window.openai.uploadFile(file);
            console.log(fileId);
            const { downloadUrl } = await window.openai.getFileDownloadUrl({
                fileId,
            });
            console.log(downloadUrl);
            setImageUrl(downloadUrl);
        } finally {
            setIsUploading(false);
        }
    };

    const handleSubmit = async () => {
        if (!app || rating === 0) return;
        setIsPending(true);
        try {
            const result = await app.callServerTool({
                name: "submit-review",
                arguments: {
                    productId,
                    rating,
                    text,
                    imageUrl,
                },
            });
            if (result.structuredContent) {
                onSubmitted(result.structuredContent.reviews as Review[]);
                setImageUrl(null);
                setText('');
                setRating(0);
            }
        } finally {
            setIsPending(false);
        }
    };

    return (
        <div className="flex flex-col gap-3">
            <h4 className="text-sm font-medium text-white">Write a review</h4>
            <StarRating rating={rating} onRate={setRating} />
            <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Share your experience..."
                rows={3}
                className="bg-neutral-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder:text-white/30 resize-none outline-none focus:border-white/20"
            />
            {imageUrl && (
                <div className="relative w-20 h-20">
                    <img
                        src={imageUrl}
                        alt="Review attachment"
                        className="w-20 h-20 object-cover rounded-xl"
                    />
                    <button
                        type="button"
                        onClick={() => setImageUrl(null)}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-neutral-800 border border-white/10 text-white/60 text-xs flex items-center justify-center cursor-pointer hover:bg-neutral-700"
                    >
                        &times;
                    </button>
                </div>
            )}
            <div className="flex gap-2">
                {!imageUrl && canUpload && (
                    <label className="px-3 py-2 rounded-xl border border-white/10 bg-neutral-900 text-white/60 text-xs font-medium cursor-pointer hover:bg-neutral-800 transition-colors">
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileSelect}
                            className="hidden"
                        />
                        {isUploading ? "Uploading..." : "Attach Photo"}
                    </label>
                )}
                <button
                    onClick={handleSubmit}
                    disabled={isPending || rating === 0}
                    className="flex-1 py-2 rounded-xl bg-white text-black text-sm font-semibold cursor-pointer hover:bg-neutral-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isPending ? "Submitting..." : "Submit Review"}
                </button>
            </div>
        </div>
    );
}

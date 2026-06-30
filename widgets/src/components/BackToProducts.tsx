type Props = {
    onClick: () => void;
};

export function BackToProducts({ onClick }: Props) {
    return (
        <button
            onClick={onClick}
            className="inline-block mb-4 px-4 py-2 border border-neutral-700 rounded-lg bg-black text-white font-medium cursor-pointer hover:bg-neutral-800 transition-colors"
        >
            ← Back to products
        </button>
    );
}

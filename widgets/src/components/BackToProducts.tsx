type Props = {
    onClick: () => void;
};

export function BackToProducts({ onClick }: Props) {
    return (
        <button
            onClick={onClick}
            className="inline-block mb-4 px-4 py-2 border border-white/10 rounded-lg bg-neutral-900 text-neutral-100 cursor-pointer hover:bg-neutral-800 transition-colors text-white-500"
        >
            ← Back to products
        </button>
    );
}

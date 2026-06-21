import type { Card } from "../types";

interface FlashcardCardProps {
    card: Card;
    isFlipped: boolean;
    status: "new" | "learning" | "mastered";
    onFlip: () => void;
}

export function FlashcardCard({
    card,
    isFlipped,
    status,
    onFlip,
}: FlashcardCardProps) {
    const statusStyles = {
        new: "bg-tertiary text-secondary",
        learning: "bg-yellow-400/20 text-yellow-600",
        mastered: "bg-green-400/20 text-green-600",
    };

    const statusLabels = {
        new: "New",
        learning: "Learning",
        mastered: "Mastered",
    };

    return (
        <div
            className="flashcard-container cursor-pointer"
            onClick={onFlip}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onFlip();
                }
            }}
        >
            <div className={`flashcard ${isFlipped ? "flipped" : ""}`}>
                {/* Front */}
                <div
                    className="flashcard-face flashcard-front rounded-2xl p-6 shadow-lg"
                    style={{
                        backgroundColor:
                            "var(--color-background-secondary-soft)",
                    }}
                >
                    <div className="flex flex-col h-full">
                        <div className="flex justify-between items-start mb-4">
                            <span className="text-xs text-tertiary uppercase tracking-wide">
                                Question
                            </span>
                            <span
                                className={`text-xs px-2 py-1 rounded-full ${statusStyles[status]}`}
                            >
                                {statusLabels[status]}
                            </span>
                        </div>
                        <div className="flex-1 flex items-center justify-center">
                            <p className="text-2xl text-center font-medium">
                                {card.front}
                            </p>
                        </div>
                        {card.hint && (
                            <div className="mt-4 pt-4 border-t border-primary">
                                <p className="text-sm text-tertiary text-center">
                                    Hint: {card.hint}
                                </p>
                            </div>
                        )}
                        <p className="text-xs text-tertiary text-center mt-4">
                            Tap to reveal answer
                        </p>
                    </div>
                </div>

                {/* Back */}
                <div
                    className="flashcard-face flashcard-back rounded-2xl p-6 shadow-lg"
                    style={{
                        backgroundColor:
                            "var(--color-background-secondary-soft)",
                    }}
                >
                    <div className="flex flex-col h-full">
                        <div className="flex justify-between items-start mb-4">
                            <span className="text-xs text-tertiary uppercase tracking-wide">
                                Answer
                            </span>
                            <span
                                className={`text-xs px-2 py-1 rounded-full ${statusStyles[status]}`}
                            >
                                {statusLabels[status]}
                            </span>
                        </div>
                        <div className="flex-1 flex items-center justify-center">
                            <p className="text-2xl text-center font-medium">
                                {card.back}
                            </p>
                        </div>
                        <p className="text-xs text-tertiary text-center mt-4">
                            Tap to see question
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

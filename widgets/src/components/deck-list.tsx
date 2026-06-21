import type { DeckSummary } from "../types";

interface DeckListProps {
    decks: DeckSummary[];
}

export function DeckList({ decks }: DeckListProps) {
    if (decks.length === 0) {
        return (
            <div className="p-6 text-center bg-surface">
                <p className="text-secondary mb-2">No flashcard decks yet</p>
                <p className="text-sm text-tertiary">
                    Ask the AI to create a flashcard deck on any topic!
                </p>
            </div>
        );
    }

    return (
        <div className="p-4 bg-surface">
            <div className="grid gap-3">
                {decks.map((deck) => (
                    <div
                        key={deck.id}
                        className="rounded-xl p-4"
                        style={{
                            backgroundColor:
                                "var(--color-background-secondary-soft)",
                        }}
                    >
                        <h3 className="font-medium">{deck.title}</h3>
                        <p className="text-sm text-secondary mt-1 line-clamp-2">
                            {deck.description}
                        </p>
                        <div className="flex items-center gap-3 mt-2 text-sm text-tertiary">
                            <span>{deck.cards.length} cards</span>
                            <span>{deck.masteredCount} mastered</span>
                        </div>
                        <div
                            className="mt-2 h-2 rounded-full overflow-hidden"
                            style={{
                                backgroundColor:
                                    "var(--color-surface-tertiary)",
                            }}
                        >
                            <div
                                className="h-full rounded-full transition-all duration-300 bg-green-400"
                                style={{
                                    width: `${deck.cards.length > 0 ? (deck.masteredCount / deck.cards.length) * 100 : 0}%`,
                                }}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

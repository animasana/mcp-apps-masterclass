import { useState } from "react";
import type { App } from "@modelcontextprotocol/ext-apps/react";
import type { Card, Deck } from "../types";

export function useStudySession({
    deck,
    app,
    username,
}: {
    deck: Deck;
    app: App | null;
    username: string;
}) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [cards, setCards] = useState<Card[]>(deck.cards);
    const [loading, setLoading] = useState<string | null>(null);

    const currentCard = cards[currentIndex];
    const masteredCount = cards.filter((c) => c.status === "mastered").length;

    function goNext() {
        if (currentIndex >= cards.length - 1) return;
        setCurrentIndex(currentIndex + 1);
        setIsFlipped(false);
    }

    function goPrev() {
        if (currentIndex <= 0) return;
        setCurrentIndex(currentIndex - 1);
        setIsFlipped(false);
    }

    function toggleFlip() {
        setIsFlipped((flipped) => !flipped);
    }

    const markCard = async (status: "learning" | "mastered") => {
        if (!currentCard || loading) return;

        setLoading(status);
        try {
            if (app) {
                await app.callServerTool({
                    name: "mark-card",
                    arguments: {
                        username,
                        deckId: deck.id,
                        status,
                        cardId: currentCard.id,
                    },
                });
            }

            const updated = [...cards];
            updated[currentIndex] = { ...currentCard, status };
            setCards(updated);

            if (currentIndex < cards.length - 1) {
                setCurrentIndex(currentIndex + 1);
                setIsFlipped(false);
            }
        } finally {
            setLoading(null);
        }
    };

    const explainCard = async () => {
        if (!currentCard || loading) return;

        setLoading("explaining");
        try {
            if (app) {
                await app.sendMessage({
                    role: "user",
                    content: [
                        {
                            type: "text",
                            text: `Please explain this flashcard in more detail. Question ${currentCard.front}\nAnswer ${currentCard.back}`,
                        },
                    ],
                });
            }
        } finally {
            setLoading(null);
        }
    };

    const resetProgress = async () => {
        if (loading) return;

        setLoading("resetting");
        try {
            if (app) {
                await app.callServerTool({
                    name: "reset-deck",
                    arguments: {
                        username,
                        deckId: deck.id,
                    },
                });
            }
            const resetCards = cards.map((c) => ({
                ...c,
                status: "new" as const,
            }));
            setCards(resetCards);
            setCurrentIndex(0);
            setIsFlipped(false);
        } finally {
            setLoading(null);
        }
    };

    return {
        cards,
        currentCard,
        currentIndex,
        masteredCount,
        isFlipped,
        loading,
        goNext,
        goPrev,
        toggleFlip,
        markCard,
        explainCard,
        resetProgress,
    };
}

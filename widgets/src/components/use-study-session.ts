import { useState } from "react";
import type { App } from "@modelcontextprotocol/ext-apps/react";
import type { Card, Deck } from "../types";

function saveState(viewUUID: string | null, state: object) {
    if (!viewUUID) return;
    localStorage.setItem(viewUUID, JSON.stringify(state));
}

function loadState(viewUUID: string | null) {
    if (!viewUUID) return null;
    const state = localStorage.getItem(viewUUID);
    if (!state) {
        return null;
    }
    return JSON.parse(state);
}

export function useStudySession({
    deck,
    app,
    username,
    viewUUID,
}: {
    deck: Deck;
    app: App | null;
    username: string;
    viewUUID: string | null;
}) {
    const savedState = loadState(viewUUID);
    const [currentIndex, setCurrentIndex] = useState(
        savedState ? savedState.currentIndex : 0,
    );
    const [cards, setCards] = useState<Card[]>(
        savedState ? savedState.cards : deck.cards,
    );
    const [isFlipped, setIsFlipped] = useState(false);
    const [loading, setLoading] = useState<string | null>(null);

    const currentCard = cards[currentIndex];
    const masteredCount = cards.filter((c) => c.status === "mastered").length;

    function goNext() {
        if (currentIndex >= cards.length - 1) return;
        const nextIndex = currentIndex + 1;
        setCurrentIndex(nextIndex);
        setIsFlipped(false);
        saveState(viewUUID, { cards, currentIndex: nextIndex });
    }

    function goPrev() {
        if (currentIndex <= 0) return;
        const nextIndex = currentIndex - 1;
        setCurrentIndex(nextIndex);
        setIsFlipped(false);
        saveState(viewUUID, { cards, currentIndex: nextIndex });
    }

    function toggleFlip() {
        setIsFlipped((flipped) => !flipped);
        saveState(viewUUID, {});
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
            saveState(viewUUID, { currentIndex, cards: updated });
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
            saveState(viewUUID, { currentIndex: 0, cards: resetCards });
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

import type { App } from "@modelcontextprotocol/ext-apps/react";
import { Button } from "@openai/apps-sdk-ui/components/Button";
import { ArrowLeft, ArrowRight } from "@openai/apps-sdk-ui/components/Icon";
import { FlashcardCard } from "./flashcard-card";
import { useStudySession } from "./use-study-session";
import type { Deck } from "../types";

interface FlashcardStudyProps {
    deck: Deck;
    app: App | null;
    username: string;
}

export function FlashcardStudy({ deck, app, username }: FlashcardStudyProps) {
    const {
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
    } = useStudySession({ deck, app, username });

    if (!currentCard) {
        return (
            <div className="p-6 text-center">
                <p className="text-secondary">No cards in this deck</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4 bg-surface min-h-100 p-4">
            {/* Header */}
            <div>
                <h2 className="text-lg font-semibold truncate">{deck.title}</h2>
                <p className="text-sm text-secondary line-clamp-2">
                    {deck.description}
                </p>
            </div>

            {/* Progress */}
            <div className="flex flex-col gap-2">
                <div className="flex justify-between text-sm text-secondary">
                    <span>
                        Card {currentIndex + 1} of {cards.length}
                    </span>
                    <span>{masteredCount} mastered</span>
                </div>
                <div
                    className="h-2 rounded-full overflow-hidden"
                    style={{ backgroundColor: "var(--color-surface-tertiary)" }}
                >
                    <div
                        className="h-full rounded-full transition-all duration-300 bg-green-400"
                        style={{
                            width: `${cards.length > 0 ? (masteredCount / cards.length) * 100 : 0}%`,
                        }}
                    />
                </div>
            </div>

            {/* Flashcard */}
            <div className="flex items-center justify-center py-4 flex-1">
                <FlashcardCard
                    card={currentCard}
                    isFlipped={isFlipped}
                    status={currentCard.status}
                    onFlip={toggleFlip}
                />
            </div>

            {/* Controls */}
            <div className="flex justify-center items-center gap-3">
                <Button
                    size="sm"
                    color="secondary"
                    variant="ghost"
                    onClick={goPrev}
                    disabled={currentIndex === 0}
                    aria-label="Previous card"
                >
                    <ArrowLeft className="h-4 w-4" />
                </Button>

                {isFlipped ? (
                    <>
                        <Button
                            size="sm"
                            color="secondary"
                            variant="solid"
                            onClick={() => markCard("learning")}
                            loading={loading === "learning"}
                            disabled={loading === "mastered"}
                        >
                            Still Learning
                        </Button>
                        <Button
                            size="sm"
                            color="primary"
                            variant="solid"
                            onClick={() => markCard("mastered")}
                            loading={loading === "mastered"}
                            disabled={loading === "learning"}
                        >
                            Got It!
                        </Button>
                    </>
                ) : (
                    <Button
                        size="sm"
                        color="primary"
                        variant="solid"
                        onClick={toggleFlip}
                    >
                        Reveal Answer
                    </Button>
                )}

                <Button
                    size="sm"
                    color="secondary"
                    variant="ghost"
                    onClick={goNext}
                    disabled={currentIndex === cards.length - 1}
                    aria-label="Next card"
                >
                    <ArrowRight className="h-4 w-4" />
                </Button>
            </div>

            <div className="flex justify-center gap-2 pt-2 border-t border-primary">
                <Button
                    size="sm"
                    color="secondary"
                    variant="ghost"
                    onClick={explainCard}
                    loading={loading === "explaining"}
                >
                    Explain This
                </Button>
                <Button
                    size="sm"
                    color="secondary"
                    variant="ghost"
                    onClick={resetProgress}
                    loading={loading === "resetting"}
                >
                    Reset Progress
                </Button>
            </div>
        </div>
    );
}

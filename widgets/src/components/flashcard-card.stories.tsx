import type { Story } from "@ladle/react";
import { FlashcardCard } from "./flashcard-card";
import { mockCards } from "./mocks";

const noop = () => {};

export const NewCard: Story = () => (
    <div className="flex justify-center p-8">
        <FlashcardCard
            card={mockCards[0]}
            isFlipped={false}
            status="new"
            onFlip={noop}
        />
    </div>
);

export const FlippedCard: Story = () => (
    <div className="flex justify-center p-8">
        <FlashcardCard
            card={mockCards[0]}
            isFlipped={true}
            status="new"
            onFlip={noop}
        />
    </div>
);

export const LearningStatus: Story = () => (
    <div className="flex justify-center p-8">
        <FlashcardCard
            card={mockCards[1]}
            isFlipped={false}
            status="learning"
            onFlip={noop}
        />
    </div>
);

export const MasteredStatus: Story = () => (
    <div className="flex justify-center p-8">
        <FlashcardCard
            card={mockCards[2]}
            isFlipped={false}
            status="mastered"
            onFlip={noop}
        />
    </div>
);

export const WithHint: Story = () => (
    <div className="flex justify-center p-8">
        <FlashcardCard
            card={mockCards[0]}
            isFlipped={false}
            status="new"
            onFlip={noop}
        />
    </div>
);
WithHint.meta = { description: "Card with a hint displayed at the bottom" };

export const WithoutHint: Story = () => (
    <div className="flex justify-center p-8">
        <FlashcardCard
            card={mockCards[3]}
            isFlipped={false}
            status="new"
            onFlip={noop}
        />
    </div>
);
WithoutHint.meta = { description: "Card without a hint" };

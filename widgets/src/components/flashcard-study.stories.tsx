import type { Story } from "@ladle/react";
import { FlashcardStudy } from "./flashcard-study";
import { mockDeck, mockFreshDeck, mockMasteredDeck } from "./mocks";

export const Default: Story = () => (
    <FlashcardStudy
        deck={mockDeck}
        app={null}
        username="demo-user"
        viewUUID={null}
    />
);
Default.meta = {
    description: "Mixed card statuses (new, learning, mastered)",
};

export const FreshDeck: Story = () => (
    <FlashcardStudy
        deck={mockFreshDeck}
        app={null}
        username="demo-user"
        viewUUID={null}
    />
);
FreshDeck.meta = { description: "All cards are new, no progress yet" };

export const FullyMastered: Story = () => (
    <FlashcardStudy
        deck={mockMasteredDeck}
        app={null}
        username="demo-user"
        viewUUID={null}
    />
);
FullyMastered.meta = { description: "All cards mastered, 100% progress" };

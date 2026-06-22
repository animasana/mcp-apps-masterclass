import type { Story } from "@ladle/react";
import { DeckList } from "./deck-list";
import { mockDeckSummaries } from "./mocks";

export const MultipleDecks: Story = () => (
    <DeckList decks={mockDeckSummaries} />
);

export const EmptyState: Story = () => <DeckList decks={[]} />;

export const SingleDeck: Story = () => (
    <DeckList decks={[mockDeckSummaries[0]]} />
);

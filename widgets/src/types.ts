export interface Card {
    id: string;
    front: string;
    back: string;
    hint: string;
    status: "new" | "learning" | "mastered";
}

export interface Deck {
    id: string;
    title: string;
    description: string;
    cards: Card[];
    createdAt: string;
}

export interface DeckSummary extends Deck {
    masteredCount: number;
}

// structuredContent from create-deck
export interface CreateDeckOutput {
    deck: Deck;
    username: string;
}

// structuredContent from list-decks
export interface ListDecksOutput {
    decks: DeckSummary[];
    username: string;
}

// structuredContent from open-deck
export interface OpenDeckOutput {
    deck: Deck;
    username: string;
    deckId: string;
}

// structuredContent from mark-card
export interface MarkCardOutput {
    deck: Deck;
}

// structuredContent from reset-deck
export interface ResetDeckOutput {
    deck: Deck;
}

export type ToolOutput =
    | CreateDeckOutput
    | ListDecksOutput
    | OpenDeckOutput
    | MarkCardOutput
    | ResetDeckOutput;

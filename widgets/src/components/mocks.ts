import type { Card, Deck, DeckSummary } from "../types";

export const mockCards: Card[] = [
    {
        id: "card-1",
        front: "What is a closure in JavaScript?",
        back: "A closure is a function that has access to variables from its outer (enclosing) scope, even after the outer function has returned.",
        hint: "Think about scope and memory",
        status: "new",
    },
    {
        id: "card-2",
        front: "What does the `this` keyword refer to?",
        back: "In JavaScript, `this` refers to the object that is executing the current function. Its value depends on how the function is called.",
        hint: "It depends on the call site",
        status: "learning",
    },
    {
        id: "card-3",
        front: "What is the difference between `let` and `var`?",
        back: "`let` is block-scoped while `var` is function-scoped. `let` does not hoist to the top of the block and cannot be re-declared in the same scope.",
        hint: "Think about scoping rules",
        status: "mastered",
    },
    {
        id: "card-4",
        front: "What is the event loop?",
        back: "The event loop is a mechanism that allows JavaScript to perform non-blocking operations by offloading tasks to the browser/Node.js and processing callbacks when the call stack is empty.",
        hint: "Think about the call stack and task queue",
        status: "new",
    },
    {
        id: "card-5",
        front: "What is a Promise?",
        back: "A Promise is an object representing the eventual completion or failure of an asynchronous operation. It can be pending, fulfilled, or rejected.",
        hint: "Three possible states",
        status: "new",
    },
];

export const mockDeck: Deck = {
    id: "deck-1",
    title: "JavaScript Fundamentals",
    description: "Core JavaScript concepts every developer should know",
    cards: mockCards,
    createdAt: "2026-03-10T10:00:00Z",
};

export const mockFreshDeck: Deck = {
    id: "deck-fresh",
    title: "React Hooks",
    description: "Essential React hooks and their use cases",
    cards: mockCards.map((c) => ({ ...c, status: "new" as const })),
    createdAt: "2026-03-16T10:00:00Z",
};

export const mockMasteredDeck: Deck = {
    id: "deck-mastered",
    title: "CSS Flexbox",
    description: "Master CSS Flexbox layout",
    cards: mockCards.map((c) => ({ ...c, status: "mastered" as const })),
    createdAt: "2026-03-01T10:00:00Z",
};

export const mockDeckSummaries: DeckSummary[] = [
    {
        id: "deck-1",
        title: "JavaScript Fundamentals",
        description: "Core JavaScript concepts every developer should know",
        cards: mockCards,
        createdAt: "2026-03-10T10:00:00Z",
        masteredCount: 12,
    },
    {
        id: "deck-2",
        title: "React Hooks",
        description: "Essential React hooks and their use cases",
        cards: mockCards.map((c) => ({ ...c, status: "new" as const })),
        createdAt: "2026-03-12T10:00:00Z",
        masteredCount: 0,
    },
    {
        id: "deck-3",
        title: "CSS Flexbox",
        description: "Master CSS Flexbox layout properties and techniques",
        cards: mockCards.map((c) => ({ ...c, status: "mastered" as const })),
        createdAt: "2026-03-01T10:00:00Z",
        masteredCount: 10,
    },
    {
        id: "deck-4",
        title: "TypeScript Generics",
        description:
            "Understanding generics, constraints, and utility types in TypeScript",
        cards: mockCards.slice(0, 3),
        createdAt: "2026-03-05T10:00:00Z",
        masteredCount: 3,
    },
];

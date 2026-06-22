import { useApp, useHostStyles } from "@modelcontextprotocol/ext-apps/react";
import { LoadingIndicator } from "@openai/apps-sdk-ui/components/Indicator";
import { useState } from "react";
import type { ToolOutput } from "./types";
import { DeckList } from "./components/deck-list";
import { FlashcardStudy } from "./components/flashcard-study";

type ToolResultLike = {
    structuredContent?: unknown;
    content?: Array<{ type?: string; text?: string }>;
    _meta?: Record<string, unknown>;
    params?: ToolResultLike;
};

function normalizeToolResult(result: ToolResultLike): ToolResultLike {
    return result.params ?? result;
}

function parseToolOutputFromText(result: ToolResultLike): ToolOutput | null {
    const text = result.content?.find((item) => item.type === "text")?.text;
    if (!text) return null;

    if (text === "You have no decks" || text === "Deck not found") {
        return { decks: [], username: "anonymous" };
    }

    const jsonStart = Math.min(
        ...["{", "["]
            .map((token) => text.indexOf(token))
            .filter((index) => index >= 0),
    );

    if (!Number.isFinite(jsonStart)) return null;

    try {
        const parsed = JSON.parse(text.slice(jsonStart));
        if (Array.isArray(parsed)) {
            return { decks: parsed, username: "anonymous" };
        }
        if (parsed && typeof parsed === "object") {
            if ("cards" in parsed) {
                return { deck: parsed, username: "anonymous" } as ToolOutput;
            }
            if ("deck" in parsed || "decks" in parsed) {
                return parsed as ToolOutput;
            }
        }
    } catch {
        return null;
    }

    return null;
}

function App() {
    const [toolOutput, setToolOutput] = useState<ToolOutput | null>(null);
    const [viewUUID, setViewUUID] = useState<string | null>(null);

    const { app, error } = useApp({
        appInfo: { name: "Flashcards2 Client", version: "1.0" },
        capabilities: {},
        onAppCreated: (app) => {
            app.ontoolresult = (result) => {
                const toolResult = normalizeToolResult(
                    result as unknown as ToolResultLike,
                );
                const output =
                    toolResult.structuredContent ??
                    parseToolOutputFromText(toolResult);

                if (output) {
                    setToolOutput(output as ToolOutput);
                }
                if (toolResult._meta) {
                    setViewUUID(toolResult._meta.viewUUID as string);
                }
            };
        },
    });

    useHostStyles(app, app?.getHostContext());

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-50 text-red-500">
                Error: {error.message}
            </div>
        );
    }

    if (toolOutput && "decks" in toolOutput) {
        return <DeckList decks={toolOutput.decks} />;
    }

    if (toolOutput && "deck" in toolOutput) {
        return (
            <FlashcardStudy
                deck={toolOutput.deck}
                app={app}
                viewUUID={viewUUID}
                username={
                    "username" in toolOutput ? toolOutput.username : "anonymous"
                }
            />
        );
    }

    return (
        <div className="items-center justify-center flex min-h-50">
            <LoadingIndicator size={32} />
        </div>
    );
}

export default App;

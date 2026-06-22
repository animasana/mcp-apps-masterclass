import { useApp, useHostStyles } from "@modelcontextprotocol/ext-apps/react";
import { LoadingIndicator } from "@openai/apps-sdk-ui/components/Indicator";
import { useState } from "react";
import type { ToolOutput } from "./types";
import { DeckList } from "./components/deck-list";
import { FlashcardStudy } from "./components/flashcard-study";

function App() {
    const [toolOutput, setToolOutput] = useState<ToolOutput | null>(null);
    const [viewUUID, setViewUUID] = useState<string | null>(null);

    const { app, error } = useApp({
        appInfo: { name: "Flashcards2 Client", version: "1.0" },
        capabilities: {},
        onAppCreated: (app) => {
            app.ontoolresult = (result) => {
                if (result.structuredContent) {
                    setToolOutput(
                        result.structuredContent as unknown as ToolOutput,
                    );
                }
                if (result._meta) {
                    setViewUUID(result._meta.viewUUID as unknown as string);
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

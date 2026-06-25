import { useApp, useHostStyles } from "@modelcontextprotocol/ext-apps/react";
import { LoadingIndicator } from "@openai/apps-sdk-ui/components/Indicator";
import { useState } from "react";
import { WorkoutList } from "./components/workout/workout-list";
import { WorkoutDetail } from "./components/workout/workout-detail";
import { WorkoutSession } from "./components/workout/workout-session";
import type { ToolOutput } from "./types";

function App() {
    const [toolOutput, setToolOutput] = useState<ToolOutput | null>(null);
    const [showSession, setShowSession] = useState(false);

    const { app } = useApp({
        appInfo: { name: "EMOM Workout App", version: "1.0" },
        capabilities: {},
        onAppCreated: (app) => {
            // TODO: safeAreaInsets and displayMode

            app.ontoolresult = (params) => {
                if (params.structuredContent) {
                    setToolOutput(params.structuredContent as ToolOutput);
                }
            };
        },
    });

    useHostStyles(app, app?.getHostContext());

    if (toolOutput && "workout" in toolOutput) {
        if (showSession) {
            return (
                <WorkoutSession
                    workout={toolOutput.workout}
                    onClose={() => setShowSession(false)}
                    app={app}
                />
            );
        }
        return (
            <WorkoutDetail
                workout={toolOutput.workout}
                onStart={() => setShowSession(true)}
                app={app}
            />
        );
    }

    if (toolOutput && "workouts" in toolOutput) {
        return <WorkoutList workouts={toolOutput.workouts} />;
    }

    return (
        <div className="flex items-center justify-center min-h-50">
            <LoadingIndicator size={32} />
        </div>
    );
}

export default App;

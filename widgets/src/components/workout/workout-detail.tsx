import { Button } from "@openai/apps-sdk-ui/components/Button";
import { Badge } from "@openai/apps-sdk-ui/components/Badge";
import { Play, ExternalLink } from "@openai/apps-sdk-ui/components/Icon";
import type { Workout } from "../../types";
import type { App } from "@modelcontextprotocol/ext-apps";

export function WorkoutDetail({
    workout,
    onStart,
    app,
}: {
    workout: Workout;
    onStart: () => void;
    app: App | null;
}) {
    const openLink = async (keyword: string) => {
        if (!app) return;
        const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(keyword)}`;
        const result = await app.openLink({
            url,
        });
        if (result.isError) {
            alert("can't open link");
        }
    };

    return (
        <div className="flex flex-col gap-4 bg-surface p-4">
            {/* Header */}
            <div className="flex flex-col gap-2">
                <div
                    className="w-full h-32 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: "var(--color-surface-tertiary)" }}
                >
                    <span className="text-6xl">💪</span>
                </div>

                <h2 className="text-xl font-semibold">{workout.title}</h2>
                <p className="text-sm text-secondary">{workout.description}</p>

                {/* Stats */}
                <div className="flex items-center gap-2 flex-wrap">
                    <Badge color="secondary">
                        {workout.durationMinutes} min
                    </Badge>
                    <Badge color="secondary">
                        {workout.exercises.length} exercises
                    </Badge>
                    <Badge color="secondary">
                        {workout.intervalSeconds}s intervals
                    </Badge>
                </div>
            </div>

            {/* Start button */}
            <Button
                size="md"
                color="primary"
                variant="solid"
                className="w-full"
                onClick={onStart}
            >
                <Play className="w-4 h-4" />
                <span className="ml-2">Start Workout</span>
            </Button>

            {/* Exercise list */}
            <div className="flex flex-col gap-3">
                <h3 className="font-medium text-sm text-secondary uppercase tracking-wide">
                    Exercises
                </h3>
                {workout.exercises.map((exercise, index) => (
                    <div
                        key={index}
                        className="rounded-xl p-4"
                        style={{
                            backgroundColor:
                                "var(--color-background-secondary-soft)",
                        }}
                    >
                        <div className="flex gap-3">
                            <div
                                className="w-12 h-12 rounded-lg flex-shrink-0 flex items-center justify-center text-xl font-bold text-secondary"
                                style={{
                                    backgroundColor:
                                        "var(--color-surface-tertiary)",
                                }}
                            >
                                {index + 1}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                    <h4 className="font-medium">
                                        {exercise.name}
                                    </h4>
                                    <Badge color="info">
                                        {exercise.reps} reps
                                    </Badge>
                                </div>
                                <p className="text-sm text-secondary mt-1 line-clamp-2">
                                    {exercise.instructions}
                                </p>
                                {exercise.searchKeyword && (
                                    <button
                                        className="flex items-center gap-1 text-sm text-blue-500 mt-2 hover:underline"
                                        onClick={() =>
                                            openLink(exercise.searchKeyword)
                                        }
                                    >
                                        <ExternalLink className="w-3 h-3" />
                                        Watch Form
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

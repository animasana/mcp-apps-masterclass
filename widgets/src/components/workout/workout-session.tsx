import { useState, useEffect, useRef } from "react";
import { Button } from "@openai/apps-sdk-ui/components/Button";
import { Badge } from "@openai/apps-sdk-ui/components/Badge";
import { LoadingIndicator } from "@openai/apps-sdk-ui/components/Indicator";
import {
    Pause,
    Play,
    Forward,
    X,
    Check,
    Expand,
} from "@openai/apps-sdk-ui/components/Icon";
import type { Workout } from "../../types";
import type { App } from "@modelcontextprotocol/ext-apps";

export function WorkoutSession({
    workout,
    onClose,
    app,
}: {
    workout: Workout;
    onClose: () => void;
    app: App | null;
}) {
    const totalRounds = Math.floor(
        (workout.durationMinutes * 60) / workout.intervalSeconds,
    );

    const [currentRound, setCurrentRound] = useState(1);
    const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
    const [timeRemaining, setTimeRemaining] = useState(workout.intervalSeconds);
    const [isRunning, setIsRunning] = useState(true);
    const [isComplete, setIsComplete] = useState(false);
    const [caloriesBurned, setCaloriesBurned] = useState<number | null>(null);

    const intervalRef = useRef<number | null>(null);
    const currentExercise = workout.exercises[currentExerciseIndex];

    // Finish workout: stop timer, update context, estimate calories
    async function finishWorkout(roundsDone: number) {
        setTimeRemaining(0);
        setIsRunning(false);
        setIsComplete(true);

        if (!app) return;

        await app.updateModelContext({
            content: [
                {
                    type: "text",
                    text: `The user has completed ${roundsDone} rounds of the workout ${JSON.stringify(workout)}`,
                },
            ],
        });

        const result = await app.callServerTool({
            name: "complete-workout",
            arguments: {
                workoutId: workout.id,
                roundsCompleted: roundsDone,
            },
        });
        if (result.isError) return;
        if (result.structuredContent) {
            const calories = result.structuredContent.calories;
            setCaloriesBurned(calories as number);
        }

        // TODO: Get calories burned
    }

    // Advance to next round or finish workout
    async function nextRound() {
        if (currentRound + 1 > totalRounds) {
            finishWorkout(totalRounds);
            return;
        }
        setCurrentRound((r) => r + 1);
        setCurrentExerciseIndex((i) => (i + 1) % workout.exercises.length);
        setTimeRemaining(workout.intervalSeconds);
        
        if (!app) return;    
        
        await app.updateModelContext({
            content: [
                {
                    type: "text",
                    text: `The user has completed ${currentRound} rounds of ${totalRounds} of the workout ${JSON.stringify(workout)}`,
                },
            ],
        });
    }

    // Timer tick — runs every second
    useEffect(() => {
        if (!isRunning || isComplete) return;

        intervalRef.current = window.setInterval(() => {
            setTimeRemaining((prev) => {
                if (prev - 1 <= 0) {
                    setTimeout(nextRound, 0);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [isRunning, isComplete, currentRound]);

    // Format time as MM:SS
    function formatTime(seconds: number) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }

    // Completed screen
    if (isComplete) {
        const roundsDone =
            currentRound >= totalRounds ? totalRounds : currentRound - 1;
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-surface gap-6 p-6">
                <div className="w-20 h-20 rounded-full bg-green-500 flex items-center justify-center">
                    <Check className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-2xl font-bold">Workout Complete!</h2>
                <p className="text-secondary text-center">
                    Great job! You completed {roundsDone} of {totalRounds}{" "}
                    rounds.
                </p>
                {caloriesBurned != null ? (
                    <div className="flex flex-col items-center gap-1">
                        <span className="text-4xl font-bold text-orange-500">
                            {caloriesBurned}
                        </span>
                        <span className="text-sm text-secondary">
                            estimated calories burned
                        </span>
                    </div>
                ) : (
                    <div className="flex items-center gap-2 text-secondary">
                        <LoadingIndicator size={16} />
                        <span className="text-sm">Estimating calories...</span>
                    </div>
                )}
                <Button
                    size="md"
                    color="primary"
                    variant="solid"
                    onClick={onClose}
                >
                    Done
                </Button>
            </div>
        );
    }

    const progressPercent = ((currentRound - 1) / totalRounds) * 100;

    return (
        <div className="flex flex-col h-screen bg-surface p-6">
            {/* Progress bar */}
            <div
                className="h-2 rounded-full overflow-hidden mb-6"
                style={{ backgroundColor: "var(--color-surface-tertiary)" }}
            >
                <div
                    className="h-full rounded-full transition-all duration-300 bg-green-500"
                    style={{ width: `${progressPercent}%` }}
                />
            </div>

            {/* Round counter */}
            <div className="text-center mb-4">
                <Badge color="secondary" size="lg">
                    Round {currentRound} of {totalRounds}
                </Badge>
            </div>

            {/* Timer */}
            <div className="text-center mb-8">
                <div
                    className={`text-7xl font-mono font-bold transition-colors ${timeRemaining <= 5 ? "text-red-500" : ""}`}
                >
                    {formatTime(timeRemaining)}
                </div>
            </div>

            {/* Current exercise */}
            <div
                className="flex-1 rounded-2xl p-6 mb-6"
                style={{
                    backgroundColor: "var(--color-background-secondary-soft)",
                }}
            >
                <div className="flex flex-col items-center gap-4 h-full">
                    <div
                        className="w-24 h-24 rounded-xl flex items-center justify-center text-5xl"
                        style={{
                            backgroundColor: "var(--color-surface-tertiary)",
                        }}
                    >
                        💪
                    </div>

                    <h2 className="text-2xl font-bold text-center">
                        {currentExercise.name}
                    </h2>
                    <Badge color="info" size="lg">
                        {currentExercise.reps} reps
                    </Badge>

                    <p className="text-sm text-secondary text-center max-w-xs">
                        {currentExercise.instructions}
                    </p>
                </div>
            </div>

            {/* TODO: Add fullscreen button using app.requestDisplayMode */}
            <div className="flex justify-center gap-3 mb-3">
                <Button size="md" color="secondary" variant="ghost">
                    <Expand className="w-4 h-4" />
                    <span className="ml-1">Fullscreen</span>
                </Button>
            </div>

            {/* Controls */}
            <div className="flex justify-center gap-3">
                <Button
                    size="md"
                    color="secondary"
                    variant="ghost"
                    onClick={() => finishWorkout(currentRound - 1)}
                >
                    <X className="w-4 h-4" />
                    <span className="ml-1">End</span>
                </Button>
                <Button
                    size="md"
                    color={isRunning ? "secondary" : "primary"}
                    variant="solid"
                    onClick={() => setIsRunning(!isRunning)}
                >
                    {isRunning ? (
                        <>
                            <Pause className="w-4 h-4" />
                            <span className="ml-1">Pause</span>
                        </>
                    ) : (
                        <>
                            <Play className="w-4 h-4" />
                            <span className="ml-1">Resume</span>
                        </>
                    )}
                </Button>
                <Button
                    size="md"
                    color="secondary"
                    variant="ghost"
                    onClick={nextRound}
                >
                    <Forward className="w-4 h-4" />
                    <span className="ml-1">Skip</span>
                </Button>
            </div>
        </div>
    );
}

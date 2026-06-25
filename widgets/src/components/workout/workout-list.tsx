import { EmptyMessage } from "@openai/apps-sdk-ui/components/EmptyMessage";
import type { WorkoutListItem } from "../../types";
import { WorkoutCard } from "./workout-card";

export function WorkoutList({ workouts }: { workouts: WorkoutListItem[] }) {
    if (workouts.length === 0) {
        return (
            <div className="p-6 bg-surface">
                <EmptyMessage>
                    <EmptyMessage.Title>No workouts yet</EmptyMessage.Title>
                    <EmptyMessage.Description>
                        Ask ChatGPT to create an EMOM workout for you!
                    </EmptyMessage.Description>
                </EmptyMessage>
            </div>
        );
    }

    return (
        <div className="p-4 bg-surface">
            <div className="grid gap-3">
                {workouts.map((workout) => (
                    <WorkoutCard key={workout.id} workout={workout} />
                ))}
            </div>
        </div>
    );
}

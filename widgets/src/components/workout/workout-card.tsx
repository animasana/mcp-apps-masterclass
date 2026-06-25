import { Badge } from "@openai/apps-sdk-ui/components/Badge";
import type { WorkoutListItem } from "../../types";

export function WorkoutCard({ workout }: { workout: WorkoutListItem }) {
  return (
    <div
      className="rounded-xl p-4 overflow-hidden"
      style={{ backgroundColor: "var(--color-background-secondary-soft)" }}
    >
      <div
        className="w-full h-24 rounded-lg mb-3 flex items-center justify-center"
        style={{ backgroundColor: "var(--color-surface-tertiary)" }}
      >
        <span className="text-4xl">💪</span>
      </div>

      <h3 className="font-medium">{workout.title}</h3>
      <p className="text-sm text-secondary mt-1 line-clamp-2">
        {workout.description}
      </p>

      <div className="flex items-center gap-2 mt-3">
        <Badge color="secondary">{workout.durationMinutes} min</Badge>
        <Badge color="secondary">{workout.exerciseCount} exercises</Badge>
      </div>
    </div>
  );
}

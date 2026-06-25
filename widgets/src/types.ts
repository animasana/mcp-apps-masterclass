export interface Exercise {
  name: string;
  reps: number;
  instructions: string;
  searchKeyword: string;
}

export interface Workout {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  durationMinutes: number;
  intervalSeconds: number;
  exercises: Exercise[];
  exerciseCount: number;
  createdAt: string | null;
}

export interface WorkoutListItem {
  id: string;
  title: string;
  description: string | null;
  durationMinutes: number;
  exerciseCount: number;
}

export type ToolOutput = { workout: Workout } | { workouts: WorkoutListItem[] };

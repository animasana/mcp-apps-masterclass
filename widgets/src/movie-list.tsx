import { Image } from "@openai/apps-sdk-ui/components/Image";
import { StarFilled } from "@openai/apps-sdk-ui/components/Icon";
import type { MoviesResponse } from "./types";

interface MoviesListProps {
  movies: MoviesResponse;
}

export function MoviesList({ movies }: MoviesListProps) {
  return (
    <div className="w-full py-5 bg-surface overflow-x-auto">
      <div className="flex gap-4 px-5">
        {movies.results.map((movie) => (
          <div key={movie.id} className="min-w-55 max-w-55 flex flex-col">
            <div className="w-full">
              <Image
                src={`https://image.tmdb.org/t/p/w400${movie.poster_path}`}
                alt={movie.title}
                className="w-full aspect-2/3 rounded-2xl object-cover shadow-sm"
              />
            </div>
            <div className="mt-3 flex flex-col flex-1">
              <div className="text-base font-medium truncate line-clamp-1">
                {movie.title}
              </div>
              <div className="text-xs mt-1 text-secondary flex items-center gap-1">
                <StarFilled
                  className="h-3 w-3 text-yellow-400"
                  aria-hidden="true"
                />
                {movie.vote_average.toFixed(1)}
                <span>· {new Date(movie.release_date).getFullYear()}</span>
              </div>
              {movie.overview ? (
                <div className="text-sm mt-2 text-tertiary line-clamp-3 flex-auto">
                  {movie.overview}
                </div>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

import { Image } from "@openai/apps-sdk-ui/components/Image";
import { Badge } from "@openai/apps-sdk-ui/components/Badge";
import {
  Calendar,
  Clock,
  StarFilled,
} from "@openai/apps-sdk-ui/components/Icon";
import type { MovieDetail } from "./types";

interface MovieDetailProps {
  movie: MovieDetail;
}

export function MovieDetails({ movie }: MovieDetailProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatRuntime = (minutes: number | null) => {
    if (!minutes) return "N/A";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="w-full bg-surface">
      {/* Backdrop Header */}
      {movie.backdrop_path && (
        <div className="relative w-full h-64 md:h-96 overflow-hidden">
          <div className="absolute inset-0 z-10 bg-linear-to-t from-black to-transparent" />
          <Image
            src={`https://image.tmdb.org/t/p/original${movie.backdrop_path}`}
            alt={movie.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 -mt-32 relative z-10">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Poster */}
          {movie.poster_path && (
            <div className="shrink-0">
              <Image
                src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                alt={movie.title}
                className="w-full md:w-64 aspect-2/3 rounded-2xl object-cover shadow-2xl ring-1 ring-border-default"
              />
            </div>
          )}

          {/* Details */}
          <div className="flex-1 pt-0 md:pt-20">
            {/* Title & Tagline */}
            <div className="mb-6">
              <h1 className="text-4xl font-bold mb-2">{movie.title}</h1>
              {movie.tagline && (
                <p className="text-lg text-secondary italic">
                  "{movie.tagline}"
                </p>
              )}
            </div>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-4 mb-6">
              <div className="flex items-center gap-1.5">
                <StarFilled
                  className="h-5 w-5 text-yellow-400"
                  aria-hidden="true"
                />
                <span className="text-lg font-semibold">
                  {movie.vote_average.toFixed(1)}
                </span>
                <span className="text-sm text-tertiary">
                  ({movie.vote_count.toLocaleString()} votes)
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-secondary">
                <Calendar className="h-4 w-4" aria-hidden="true" />
                <span>
                  {new Date(movie.release_date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>

              {movie.runtime && (
                <div className="flex items-center gap-1.5 text-secondary">
                  <Clock className="h-4 w-4" aria-hidden="true" />
                  <span>{formatRuntime(movie.runtime)}</span>
                </div>
              )}
            </div>

            {/* Genres */}
            {movie.genres.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {movie.genres.map((genre) => (
                  <Badge key={genre.id} color="secondary" variant="soft">
                    {genre.name}
                  </Badge>
                ))}
              </div>
            )}

            {/* Overview */}
            {movie.overview && (
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-3">Overview</h2>
                <p className="text-secondary leading-relaxed">
                  {movie.overview}
                </p>
              </div>
            )}

            {/* Additional Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {movie.status && (
                <div>
                  <h3 className="text-sm font-semibold text-tertiary mb-1">
                    Status
                  </h3>
                  <p className="text-base">{movie.status}</p>
                </div>
              )}

              {movie.original_language && (
                <div>
                  <h3 className="text-sm font-semibold text-tertiary mb-1">
                    Original Language
                  </h3>
                  <p className="text-base">
                    {movie.original_language.toUpperCase()}
                  </p>
                </div>
              )}

              {movie.budget > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-tertiary mb-1">
                    Budget
                  </h3>
                  <p className="text-base">{formatCurrency(movie.budget)}</p>
                </div>
              )}

              {movie.revenue > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-tertiary mb-1">
                    Revenue
                  </h3>
                  <p className="text-base">{formatCurrency(movie.revenue)}</p>
                </div>
              )}
            </div>

            {/* Production Companies */}
            {movie.production_companies.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">
                  Production Companies
                </h3>
                <div className="flex flex-wrap gap-4">
                  {movie.production_companies.map((company) => (
                    <div
                      key={company.id}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary-soft"
                    >
                      {company.logo_path ? (
                        <Image
                          src={`https://image.tmdb.org/t/p/w92${company.logo_path}`}
                          alt={company.name}
                          className="h-6 object-contain"
                        />
                      ) : (
                        <span className="text-sm">{company.name}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

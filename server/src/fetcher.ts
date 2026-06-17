async function fetchFromTMDB(endpoint: string, apiKey: string, params: Record<string, string> = {}) {
    const searchParams = new URLSearchParams({
        page: "1",
        include_adult: "true",
        language: "en-US",
        ...params
    });

    const response = await fetch(`https://api.themoviedb.org/3${endpoint}?${searchParams}`, {
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        }
    });

    if (!response.ok) {
        throw new Error(`TMDB API request failed: ${response.status} ${response.statusText}`);
    }
    
    return response.json();
}

export async function fetchUpcomingMovies(apiKey: string) {
    return fetchFromTMDB('/movie/upcoming', apiKey);
}

export async function fetchNowPlayingMovies(apiKey: string) {
    return fetchFromTMDB('/movie/now_playing', apiKey);
}

export async function fetchSimilarMovies(movieId: number, apiKey: string) {
    return fetchFromTMDB(`/movie/${movieId}/similar`, apiKey);
}

export async function fetchMovieReviews(movieId: number, apiKey: string) {
	return fetchFromTMDB(`/movie/${movieId}/reviews`, apiKey);
}

export async function fetchMovieGenres(apiKey: string) {
	return fetchFromTMDB(`/genre/movie/list`, apiKey);
}

export async function fetchMovieByGenre(genreId: number, apiKey: string) {
	return fetchFromTMDB(`/discover/movie`, apiKey, {
		with_genres: String(genreId),
		sort_by: 'popularity.desc',
	});
}

export async function fetchMovieDetails(movieId: number, apiKey: string) {
	return fetchFromTMDB(`/movie/${movieId}`, apiKey);
}
import { useApp, useHostStyles } from "@modelcontextprotocol/ext-apps/react";
import { LoadingIndicator } from "@openai/apps-sdk-ui/components/Indicator";
import { useState } from "react";
import { MoviesList } from "./movie-list";
import { MovieDetails } from "./movie-details";
import type { MovieDetail, MoviesResponse } from "./types";

interface ToolOutput {
    movies?: MoviesResponse;    
    movie?: MovieDetail;
}

function App() {
    const [toolOutput, setToolOutput] = useState<ToolOutput | null>(null);
    
    const { app } = useApp({        
        appInfo: { name: "Movies Client", version: "1.0" },
        capabilities: {},
        onAppCreated: (app) => {
            app.ontoolresult = (result) => {
                if (result.structuredContent) {
                    setToolOutput(result.structuredContent);
                }
            }                
        },
    });

    useHostStyles(app, app?.getHostContext())

    if (toolOutput?.movies) {
        return <MoviesList movies={toolOutput.movies} />
    }

    if (toolOutput?.movie) {
        return <MovieDetails movie={toolOutput.movie} />
    }

    return (
        <div className="items-center justify-center flex min-h-50">
            <LoadingIndicator size={32} />
        </div>
    );
}

export default App;

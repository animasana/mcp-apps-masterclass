import { useApp, useHostStyles } from "@modelcontextprotocol/ext-apps/react";
import { LoadingIndicator } from "@openai/apps-sdk-ui/components/Indicator";
import { useState } from "react";


function App() {
    const [toolOutput, setToolOutput] = useState<object | null>(null);
    
    const { app } = useApp({        
        appInfo: { name: "Flashcards Client", version: "1.0" },
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

    console.log(toolOutput);

    return (
        <div className="items-center justify-center flex min-h-50">
            <LoadingIndicator size={32} />
        </div>
    );
}

export default App;

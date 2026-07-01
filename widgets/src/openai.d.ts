interface Window {
    openai?: {
        uploadFile: (file: File) => Promise<{ fileId: string }>;
        getFileDownloadUrl: ({
            fileId: string,
        }) => Promise<{ downloadUrl: string }>;
    };
}

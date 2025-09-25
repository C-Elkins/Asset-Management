// Ambient type declarations for Vite environment variables
// Ensures `(import.meta as any).env` or `import.meta.env` access is properly typed
// Extend as needed when adding new Vite env vars (prefix with VITE_)

export {};

declare global {
  interface ImportMetaEnv {
    readonly VITE_API_BASE_URL?: string;
    readonly VITE_OPENAI_API_KEY?: string;
    // Add additional env vars here
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}

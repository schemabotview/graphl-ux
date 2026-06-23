/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL of the content repo (manifest, notebooks, audio). See content/client.ts. */
  readonly VITE_CONTENT_BASE_URL?: string
}

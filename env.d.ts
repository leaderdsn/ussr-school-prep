/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_TITLE?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

/** Application version from package.json, injected by Vite `define`. */
declare const __APP_VERSION__: string

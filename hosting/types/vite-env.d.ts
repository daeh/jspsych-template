/// <reference types="vite/client" />

declare const __COMMIT_HASH__: string

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

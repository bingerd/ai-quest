/**
 * Local Monaco setup. The default `@monaco-editor/react` loader fetches Monaco
 * from a CDN; we bundle it instead so the app never touches the network.
 * Only the core editor API is imported (plain text editing), not every language.
 */
import { loader } from '@monaco-editor/react'
import * as monaco from 'monaco-editor/editor/editor.api'
import EditorWorker from 'monaco-editor/editor/editor.worker?worker'

self.MonacoEnvironment = {
  getWorker: () => new EditorWorker(),
}

loader.config({ monaco })

export { monaco }

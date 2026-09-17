/**
 * Local Monaco setup. The default `@monaco-editor/react` loader fetches Monaco
 * from a CDN; we bundle it instead so the app never touches the network.
 * Only the core editor API plus lightweight highlighting is imported.
 */
import { loader } from '@monaco-editor/react'
import * as monaco from 'monaco-editor/editor/editor.api'
import EditorWorker from 'monaco-editor/editor/editor.worker?worker'
// Markdown tokenizer registers lazily (its grammar loads on first use).
import 'monaco-editor/languages/definitions/markdown/register'

self.MonacoEnvironment = {
  getWorker: () => new EditorWorker(),
}

// Minimal JSON highlighting without the JSON language service (which needs its own worker).
// Validation is done by the exercises themselves with JSON.parse.
if (!monaco.languages.getLanguages().some((l) => l.id === 'json')) {
  monaco.languages.register({ id: 'json', extensions: ['.json'] })
  monaco.languages.setMonarchTokensProvider('json', {
    tokenizer: {
      root: [
        [/"(?:[^"\\]|\\.)*"(?=\s*:)/, 'type'],
        [/"(?:[^"\\]|\\.)*"/, 'string'],
        [/-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/, 'number'],
        [/\b(?:true|false|null)\b/, 'keyword'],
        [/[{}[\],:]/, 'delimiter'],
      ],
    },
  })
  monaco.languages.setLanguageConfiguration('json', {
    brackets: [
      ['{', '}'],
      ['[', ']'],
    ],
    autoClosingPairs: [
      { open: '{', close: '}' },
      { open: '[', close: ']' },
      { open: '"', close: '"' },
    ],
  })
}

loader.config({ monaco })

export { monaco }

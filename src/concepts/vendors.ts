/**
 * Vendor-neutral concept vocabulary with a mapping to vendor-specific terms.
 * The training content uses the neutral concept; the UI can show how a given
 * vendor names it. Claude is listed first because it is the initial audience.
 */

export type Vendor = 'claude' | 'openai' | 'gemini' | 'copilot'

export const VENDOR_LABEL: Record<Vendor, string> = {
  claude: 'Claude',
  openai: 'OpenAI',
  gemini: 'Gemini',
  copilot: 'Microsoft Copilot',
}

export type ConceptId =
  | 'context'
  | 'conversation'
  | 'projectContext'
  | 'systemInstructions'
  | 'retrieval'
  | 'tools'
  | 'agents'
  | 'model'
  | 'caching'
  | 'contextWindow'

export interface VendorMapping {
  vendor: Vendor
  concept: ConceptId
  vendorTerm: string
  explanation: string
}

export const CONCEPT_LABEL: Record<ConceptId, string> = {
  context: 'Context',
  conversation: 'Conversation',
  projectContext: 'Project context',
  systemInstructions: 'System instructions',
  retrieval: 'Retrieval',
  tools: 'Tools',
  agents: 'Agents',
  model: 'Model',
  caching: 'Caching',
  contextWindow: 'Context window',
}

export const VENDOR_MAPPINGS: VendorMapping[] = [
  { vendor: 'claude', concept: 'projectContext', vendorTerm: 'Project knowledge', explanation: 'Files and instructions attached to a Claude Project are added to context for every chat in that project.' },
  { vendor: 'openai', concept: 'projectContext', vendorTerm: 'Project files / Custom GPT knowledge', explanation: 'Uploaded files that a GPT or Project can draw on.' },
  { vendor: 'gemini', concept: 'projectContext', vendorTerm: 'Gem instructions / files', explanation: 'Reusable instructions and files in a Gem.' },
  { vendor: 'copilot', concept: 'projectContext', vendorTerm: 'Notebook / grounding data', explanation: 'Microsoft 365 data that Copilot is grounded on.' },

  { vendor: 'claude', concept: 'systemInstructions', vendorTerm: 'System prompt / Project instructions', explanation: 'Standing instructions that shape every response.' },
  { vendor: 'openai', concept: 'systemInstructions', vendorTerm: 'Custom instructions / system message', explanation: 'Standing instructions applied to every conversation.' },
  { vendor: 'gemini', concept: 'systemInstructions', vendorTerm: 'System instructions', explanation: 'Standing instructions for a Gem or API call.' },
  { vendor: 'copilot', concept: 'systemInstructions', vendorTerm: 'Agent instructions', explanation: 'Instructions configured for a Copilot agent.' },

  { vendor: 'claude', concept: 'conversation', vendorTerm: 'Chat', explanation: 'Every message in the chat is re-sent as context on each turn.' },
  { vendor: 'openai', concept: 'conversation', vendorTerm: 'Chat / thread', explanation: 'Prior turns in the thread are part of the input.' },
  { vendor: 'gemini', concept: 'conversation', vendorTerm: 'Chat', explanation: 'Prior turns in the chat are part of the input.' },
  { vendor: 'copilot', concept: 'conversation', vendorTerm: 'Chat', explanation: 'Prior turns in the chat are part of the input.' },

  { vendor: 'claude', concept: 'retrieval', vendorTerm: 'Project search / file search', explanation: 'Only relevant chunks of large project files are pulled into context.' },
  { vendor: 'openai', concept: 'retrieval', vendorTerm: 'File search', explanation: 'Vector search over uploaded files.' },
  { vendor: 'gemini', concept: 'retrieval', vendorTerm: 'Grounding', explanation: 'Grounding responses in search or your data.' },
  { vendor: 'copilot', concept: 'retrieval', vendorTerm: 'Microsoft Graph grounding', explanation: 'Retrieving relevant emails, files and chats through the Graph.' },

  { vendor: 'claude', concept: 'tools', vendorTerm: 'Tools / connectors (MCP)', explanation: 'External capabilities the model can call; results land in context.' },
  { vendor: 'openai', concept: 'tools', vendorTerm: 'Tools / actions / connectors', explanation: 'External capabilities the model can call.' },
  { vendor: 'gemini', concept: 'tools', vendorTerm: 'Extensions / function calling', explanation: 'External capabilities the model can call.' },
  { vendor: 'copilot', concept: 'tools', vendorTerm: 'Plugins / actions', explanation: 'External capabilities the agent can call.' },

  { vendor: 'claude', concept: 'agents', vendorTerm: 'Claude Code / agentic workflows', explanation: 'The model plans and executes multi-step tasks using tools.' },
  { vendor: 'openai', concept: 'agents', vendorTerm: 'Agents / Operator', explanation: 'The model plans and executes multi-step tasks using tools.' },
  { vendor: 'gemini', concept: 'agents', vendorTerm: 'Agents', explanation: 'The model plans and executes multi-step tasks using tools.' },
  { vendor: 'copilot', concept: 'agents', vendorTerm: 'Copilot agents', explanation: 'Agents built in Copilot Studio.' },

  { vendor: 'claude', concept: 'caching', vendorTerm: 'Prompt caching', explanation: 'Re-using a stable prefix of context so it is not fully reprocessed each call.' },
  { vendor: 'openai', concept: 'caching', vendorTerm: 'Prompt caching', explanation: 'Re-using a stable prefix of context so it is not fully reprocessed each call.' },
  { vendor: 'gemini', concept: 'caching', vendorTerm: 'Context caching', explanation: 'Caching large context for reuse across calls.' },
  { vendor: 'copilot', concept: 'caching', vendorTerm: '(managed by the platform)', explanation: 'Not exposed as a user-facing setting.' },

  { vendor: 'claude', concept: 'model', vendorTerm: 'Haiku / Sonnet / Opus tiers', explanation: 'Model families offering different speed, cost and capability trade-offs.' },
  { vendor: 'openai', concept: 'model', vendorTerm: 'GPT / o-series tiers', explanation: 'Model families offering different speed, cost and capability trade-offs.' },
  { vendor: 'gemini', concept: 'model', vendorTerm: 'Flash / Pro tiers', explanation: 'Model families offering different speed, cost and capability trade-offs.' },
  { vendor: 'copilot', concept: 'model', vendorTerm: '(selected by the platform)', explanation: 'Model choice is mostly managed for you.' },

  { vendor: 'claude', concept: 'contextWindow', vendorTerm: 'Context window', explanation: 'Maximum tokens the model can consider at once.' },
  { vendor: 'openai', concept: 'contextWindow', vendorTerm: 'Context window', explanation: 'Maximum tokens the model can consider at once.' },
  { vendor: 'gemini', concept: 'contextWindow', vendorTerm: 'Context window', explanation: 'Maximum tokens the model can consider at once.' },
  { vendor: 'copilot', concept: 'contextWindow', vendorTerm: 'Context window', explanation: 'Maximum tokens the model can consider at once.' },
]

export function mappingsFor(concept: ConceptId): VendorMapping[] {
  return VENDOR_MAPPINGS.filter((m) => m.concept === concept)
}

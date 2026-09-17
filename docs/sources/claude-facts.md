# Claude fact sheet for training content

Verified against official Anthropic documentation on **2026-09-17**. Training content that names a Claude
feature must trace back to a line here. Anything not listed is left out of the trainings. Re-verify before
changing content: these products change quickly.

Simulated numbers in the app (tokens, costs, latency, quality) are teaching models, not measurements.

---

## Claude for Everyday Work (claude.ai / Claude desktop)

**Projects** — https://support.claude.com/en/articles/9517075-what-are-projects
- Available on every plan. A project has uploaded knowledge files and project instructions.
- On paid plans, when project knowledge nears the context limit, Claude switches to retrieval to expand capacity.
- Team and Enterprise can share projects with view or edit access.

**Artifacts** — https://support.claude.com/en/articles/9487310
- Artifacts are things Claude makes for you to put in front of someone (designs, decks, documents, dashboards, small tools). They open beside the chat, can be edited and shared by link. All plans.

**File creation** — https://support.claude.com/en/articles/12111783
- Claude can create .xlsx, .pptx, .docx, PDF files and PNG charts, downloadable or saved to Google Drive. 30 MB file limit.
- Enabled under Settings › Capabilities › "Code execution and file creation" (on by default for Free, Pro, Max).
- Counts against usage limits and uses more tokens than typical chats.

**Claude for PowerPoint** — https://claude.com/docs/office-agents/powerpoint
- Add-in for Pro, Max, Team, Enterprise. Reads the slide master, layouts, fonts and colours; can edit individual slides; turns bullets into native editable charts and diagrams; has an Instructions field for persistent brand rules.
- Best practices: apply your template first, be specific about which slide or element to change, review every change and check brand compliance, keep a human review before client deliverables. Beware prompt injection from untrusted files.

**Skills** — https://support.claude.com/en/articles/12512180
- Available on all plans, requires code execution. Upload a custom skill as a ZIP; private until shared; org owners can provision skills.

**Connectors** — https://support.claude.com/en/articles/11175166 · https://support.claude.com/en/articles/11176164
- Connectors reach apps like Google Drive, Slack, Linear. Custom connectors are remote MCP servers. Desktop extensions (desktop app only) reach local apps and files.

**Memory** — https://support.claude.com/en/articles/11817273
- On by default for Free, Pro, Max; off by default for Team and Enterprise until enabled. Each project has its own memory. Incognito chats are excluded. Settings › Memory to view, edit, pause, reset.

**Model picker** — https://support.claude.com/en/articles/8664678
- The menu next to send chooses model, effort level and whether thinking is on.

**Research** — https://support.claude.com/en/articles/11088861
- Paid plans. Needs web search on. Gives cited answers. Can use up limits faster.

**Usage limits** — https://support.claude.com/en/articles/9797557 · https://support.claude.com/en/articles/11647753
- A five-hour session limit plus weekly caps. Exact numbers are not published.
- Uses more: long messages, large attachments, long conversations, tools (Research, web search, code execution), file creation, model and effort choice.
- Project content is cached, so reusing it does not count against limits the way re-uploading does.
- Tips: combine questions into one message, keep reference documents in a Project, turn off tools you do not need, lower effort or thinking for routine work, check Settings › Usage.

**Not verified, excluded:** Styles (may be moving into skills), exact usage-limit numbers.

---

## Claude Code Power User

**Settings** — https://code.claude.com/docs/en/settings
- Precedence, highest first: managed settings › command line (`--settings`) › `.claude/settings.local.json` › `.claude/settings.json` › `~/.claude/settings.json`.
- Array settings such as `permissions.allow` merge across levels.
- `permissions.defaultMode` values `auto` and `bypassPermissions` are ignored in project and local settings.
- Settings files hot-reload. Keys include `permissions` (allow / ask / deny / defaultMode), `env`, `model`, `availableModels`, `fallbackModel`, `hooks`, `statusLine`, `outputStyle`, `apiKeyHelper`, `cleanupPeriodDays`.

**Permission rules** — https://code.claude.com/docs/en/settings
- Rules are `Tool` or `Tool(specifier)`, e.g. `Bash(npm run test:*)`, `Read(./.env)`, `Edit(src/**)`, `WebFetch(domain:example.com)`. Deny rules take precedence over ask and allow.

**Models** — https://code.claude.com/docs/en/model-config
- Aliases: `default`, `best`, `fable`, `opus`, `sonnet`, `haiku`, `sonnet[1m]`, `opus[1m]`, `opusplan` (Opus while planning, Sonnet while executing).
- Selection precedence: `/model` in session › `--model` › `ANTHROPIC_MODEL` › `model` setting.
- `ANTHROPIC_DEFAULT_{OPUS,SONNET,HAIKU,FABLE}_MODEL` pin what aliases resolve to. `CLAUDE_CODE_SUBAGENT_MODEL` sets the subagent default.
- `/effort` levels: low, medium, high, xhigh, max. `/fast` toggles fast mode (research preview, priced higher).
- `fallbackModel` chains models used when one is overloaded or unavailable.
- There is **no official automatic task-based routing**. Routing is done by you: `opusplan`, subagent models, effort, fallback.

**CLAUDE.md** — https://code.claude.com/docs/en/memory
- Locations: managed, user `~/.claude/CLAUDE.md`, project `./CLAUDE.md` or `./.claude/CLAUDE.md`, local `./CLAUDE.local.md`. Files are concatenated, not overridden. Subdirectory files load when Claude reads files there.
- `@path` imports, nesting up to 4 hops. `.claude/rules/*.md` can be scoped with `paths:` frontmatter.
- `/init` generates a starter; `/memory` edits files. Keep each file under ~200 lines: it loads into every session.

**Hooks** — https://code.claude.com/docs/en/hooks
- Events include SessionStart, UserPromptSubmit, PreToolUse, PostToolUse, PermissionRequest, Stop, SubagentStop, PreCompact, Notification.
- Matchers: `*` or empty matches all; plain names and `|` lists match exactly; other patterns are regex. MCP tools are `mcp__<server>__<tool>`.
- Exit code 0: success. Exit code 2: blocks the action and sends stderr back to Claude. Other codes: non-blocking error.

**Skills** — https://code.claude.com/docs/en/skills
- `~/.claude/skills/<name>/SKILL.md` or `.claude/skills/<name>/SKILL.md`. Only the description loads up front; the body loads when used. `.claude/commands/*.md` still works but is legacy; both create `/name` commands.

**Subagents** — https://code.claude.com/docs/en/sub-agents
- `.claude/agents/*.md` or `~/.claude/agents/*.md` with frontmatter `name`, `description` (required), `tools`, `model`, `permissionMode`, and more. A subagent works in its own context and returns a summary.

**Output styles** — https://code.claude.com/docs/en/output-styles
- Built-in styles include Default, Explanatory and Learning. Custom styles live in `.claude/output-styles`. Chosen via `/config`.

**Status line** — https://code.claude.com/docs/en/statusline
- `statusLine` runs a command that receives session JSON (model, context usage) on stdin.

**MCP** — https://code.claude.com/docs/en/mcp
- Scopes: local (default, private to you in this project), project (`.mcp.json`, shared in the repo, requires approval), user (all your projects).

**Context** — https://code.claude.com/docs/en/context-window
- `/context` shows what fills the window. `/compact [focus]` summarizes. `/clear` starts fresh. Auto-compact runs as the window fills. The project CLAUDE.md is re-read after compaction.

**Not verified, excluded:** hook JSON output fields in detail.

---

## Building on Claude

**Prompt caching** — https://platform.claude.com/docs/en/build-with-claude/prompt-caching
- `cache_control` on up to 4 blocks (or automatic top-level). TTL 5 minutes or 1 hour.
- Relative pricing: 5-minute cache write 1.25× base input, 1-hour write 2×, cache read 0.1×.
- Each model has a minimum cacheable prompt length; shorter prefixes silently do not cache.
- The cache is a prefix: any change before a breakpoint invalidates it. Changing thinking settings invalidates it too.

**Batches** — https://platform.claude.com/docs/en/build-with-claude/batch-processing
- 50% discount. Most batches finish within an hour; they expire after 24 hours. Stacks with caching.

**Token counting** — https://platform.claude.com/docs/en/build-with-claude/token-counting
- `POST /v1/messages/count_tokens` is free and returns an estimate.

**Thinking** — https://platform.claude.com/docs/en/build-with-claude/extended-thinking
- Newer models use adaptive thinking with an effort setting instead of a fixed `budget_tokens`.

**Rate limits** — https://platform.claude.com/docs/en/api/rate-limits
- Limits on requests, input tokens and output tokens per minute. 429 responses include `retry-after`.

**Cloud providers and gateways** — https://code.claude.com/docs/en/third-party-integrations · https://code.claude.com/docs/en/llm-gateway
- Claude is available via Amazon Bedrock, Google Cloud's Agent Platform (formerly Vertex AI) and Microsoft Foundry.
- Claude Code can route through an LLM gateway with `ANTHROPIC_BASE_URL`; credentials via `ANTHROPIC_AUTH_TOKEN`, `ANTHROPIC_API_KEY` or `apiKeyHelper`. Pin model versions with `ANTHROPIC_DEFAULT_*_MODEL`.

**Managed settings** — https://code.claude.com/docs/en/settings
- Delivered by file, MDM or the admin console. Useful keys: `availableModels`, `permissions.deny`, `allowManagedPermissionRulesOnly`. Managed settings cannot be overridden by users.

**Monitoring** — https://code.claude.com/docs/en/monitoring-usage
- OpenTelemetry via `CLAUDE_CODE_ENABLE_TELEMETRY=1` and OTLP exporter settings. Metrics include token usage, cost usage and session count. Prompt text is only logged when explicitly enabled.

**Headless and CI** — https://code.claude.com/docs/en/headless · https://code.claude.com/docs/en/github-actions
- `claude -p` runs non-interactively with `--output-format json`, `--allowedTools`, `--permission-mode`. `--bare` skips hooks, CLAUDE.md and MCP loading, recommended for CI.
- GitHub Actions: `anthropics/claude-code-action@v1`.
- The Agent SDK (Python, TypeScript) is the programmatic way to build agents on the same harness.

**Evals** — https://platform.claude.com/docs/en/test-and-evaluate/develop-tests
- Define specific, measurable success criteria. Mirror real traffic including edge cases. Prefer many automatically graded cases. Grading preference: code-based, then LLM-based (validated), then human.

**Not verified, excluded:** LiteLLM specifics, Bedrock/Vertex env var names, Agent SDK package names.

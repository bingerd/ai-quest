# Claude onboarding workshop: facilitator guide

A one-day, hands-on workshop, 10:00–16:00, with lunch from 12:00 to 13:00. That leaves five working hours.

The day is built on exercises, not slides. Each block below has a few **key points** you can say out loud or put
on a single screen. Everything else is people doing things in Claude Desktop or Claude Code, with short app
exercises in between.

- **App, part 1 (morning, everyone):** `https://ai-quest.bngrd.com/training/workshop-at-work`
- **App, part 2 (afternoon, technical):** `https://ai-quest.bngrd.com/training/workshop-builders`
- **Materials:** [`materials/`](materials/)
  - the [Meridian handout](materials/meridian-handout.md)
  - two ready-to-upload skills: [status-update](materials/skills/status-update/SKILL.md) and [prompt-review](materials/skills/prompt-review/SKILL.md)
  - the [skills breakout task and rubric](materials/breakout-task.md)
- **Facts:** every claim about a Claude feature in this guide is backed by a dated, sourced line in
  [`../sources/claude-facts.md`](../sources/claude-facts.md). These products change week to week, so re-check the
  sheet before each run.

App lessons unlock in order. Participants should work through part 1 as the day goes on, not jump ahead.
Technical groups can start part 2 directly.

---

## Before the day

- [ ] Everyone has Claude Desktop installed and signs in with a **firm-provided** account, not a personal one.
- [ ] Code execution and file creation is on (Settings › Capabilities). Skills need it.
- [ ] Ask the admin whether Claude Design is enabled. It is off by default on Enterprise until an owner turns it on.
- [ ] Zip each folder under `materials/skills/` (the folder, with `SKILL.md` inside) ready for upload. Optionally,
      ask an org owner to provision them for the group.
- [ ] Print or share the Meridian handout. It is fictional and safe to upload.
- [ ] Have the firm's design system or a brand sheet ready for the design block.
- [ ] Technical groups: prepare the breakout repository and task (see [`materials/breakout-task.md`](materials/breakout-task.md)),
      with Claude Code installed.
- [ ] Have the Xebia AI policy page open:
      [Guidelines for the use of generative AI](https://xebiagroup.sharepoint.com/sites/XebiaBeNeLux/SitePages/Guidelines-for-the-use-of-generative-AI.aspx#general-terms).
- [ ] Optional: pre-run the five breakout approaches yourself and keep the diffs. You need them for the
      20-minute version of the skills block.

---

## The agenda

| Time | Session | Duration | App |
| --- | --- | ---: | --- |
| 10:00–10:20 | [Audience gauging + expectations](#1000-audience-gauging--expectations) | 20 min | Part 1 · Who is in the room |
| 10:20–10:45 | [Xebia AI policy: internal and client use](#1020-xebia-ai-policy-internal-and-client-use) | 25 min | Part 1 · AI policy |
| 10:45–11:10 | [LLMs: the "next-token predictor" mental model](#1045-llms-the-next-token-predictor-mental-model) | 25 min | Part 1 · How a model writes |
| 11:10–11:20 | ☕ Break | 10 min | |
| 11:20–12:00 | [Claude Desktop: setup, projects and context](#1120-claude-desktop-setup-projects-and-context) | 40 min | Part 1 · Claude Desktop and projects |
| 12:00–13:00 | 🍴 Lunch | 60 min | |
| 13:00–13:45 | [Context-management exercises: four rounds](#1300-context-management-four-rounds-one-requirement) | 45 min | Part 1 · Context management |
| 13:45–14:25 | [Design systems + hands-on](#1345-design-systems) | 40 min | Part 1 · Design systems |
| 14:25–14:45 | [Workflow discussion](#1425-workflow-discussion) | 20 min | Part 1 · Workflows |
| 14:45–14:55 | ☕ Break | 10 min | |
| 14:55–15:20 | [AI assistants vs production agents + harnesses](#1455-ai-assistants-vs-production-agents--harnesses) | 25 min | Part 2 · Assistants, agents and harnesses |
| 15:20–15:40 | [AI-assisted software development lifecycle](#1520-ai-assisted-software-development-lifecycle) | 20 min | Part 2 · Development lifecycle |
| 15:40–16:00 | [Skills + choose a deep dive](#1540-skills--choose-a-deep-dive) | 20 min | Part 2 · Skills |

13:00–14:45 is the longest stretch without a break. Make it the centerpiece: **one requirement**, improved over
four rounds, then turned into a design. Its last line leads into the technical afternoon:

> "We've been building Claude's environment by hand. What if we made that environment systematic, repeatable,
> and eventually autonomous?"

That question is what harnesses, agents, the SDLC and skills answer.

### Three versions of the day

Decide at 10:20 using the audience check. If you know the group in advance, decide before the day.

**Mixed group:** run the agenda above.

**Mostly non-technical: the shorter, Desktop-only day.** No part 2, and the day ends at 15:00.

| Time | Session |
| --- | --- |
| 10:00–10:15 | Audience gauging |
| 10:15–10:40 | AI policy |
| 10:40–11:05 | LLM mental model (full version) |
| 11:05–11:15 | ☕ Break |
| 11:15–12:00 | Claude Desktop: setup, projects, context (45 min, more time for the live checklist) |
| 12:00–13:00 | 🍴 Lunch |
| 13:00–13:45 | Four rounds, one requirement |
| 13:45–14:25 | Design systems |
| 14:25–14:55 | Workflow gallery, hands-on: each person picks one workflow from the gallery and runs it on their own work |
| 14:55–15:00 | Wrap-up: one thing each person will do on Monday |

**Mostly technical: the workshop-style day.** These people already know most of Claude. Do not teach a method.
Show the key points, then let them compare and argue about workflows. Cut the LLM block to 10 minutes and move
harnesses before lunch so the afternoon is all hands-on.

| Time | Session |
| --- | --- |
| 10:00–10:15 | Audience gauging |
| 10:15–10:35 | AI policy, with the focus on client codebases, client tooling and personal subscriptions |
| 10:35–10:45 | LLM mental model, short version: context is the only lever you have |
| 10:45–11:15 | Claude Desktop and Cowork for client-facing work (the live checklist, at speed) |
| 11:15–11:25 | ☕ Break |
| 11:25–12:00 | AI assistants vs production agents + harnesses |
| 12:00–13:00 | 🍴 Lunch |
| 13:00–13:45 | Four rounds in **Claude Code** instead of Desktop: bare prompt → CLAUDE.md → conventions → a skill |
| 13:45–14:45 | Skills breakout: five approaches, one task (full version) |
| 14:45–14:55 | ☕ Break |
| 14:55–15:25 | AI-assisted SDLC, plus speed vs many people working at once |
| 15:25–16:00 | Deep dive the group chooses: build a subagent workflow or a team skill |

---

## 10:00 Audience gauging + expectations

**Goal:** know who is in the room before you spend a single minute on content.

**Key points**
- Today is mostly doing. Laptops open, Claude Desktop signed in.
- We will adapt the day to the room. Tell us what you want to leave with.

**Do**
1. Everyone opens app part 1 and completes **Where are you starting from?** (2 minutes). It asks about role,
   how often they use AI, projects, and agents or skills, and suggests a track.
2. Show of hands per suggested track: *Claude at work*, *both parts*, *builders*.
3. Go round the room: name, role, and one task you'd love Claude to take off your plate. Write the tasks on a
   board. Return to them in the workflow block and in the deep-dive choice.

**Decide:** pick one of the three versions of the day above and say so out loud.

---

## 10:20 Xebia AI policy: internal and client use

**Goal:** everyone knows which account to use for what, and what to say when a client asks.

**Key points**
- Firm work goes on the **firm-provided** account. A personal subscription falls under consumer terms, not the
  firm's contract.
- **Consumer plans** (Free, Pro, Max): you choose whether your chats are used to train models (Settings › Privacy,
  "Help improve our AI models"). With it on, data is kept for up to five years; with it off, 30 days. Turning it
  off later is not retroactive.
- **Commercial plans** (Team, Enterprise, API): inputs and outputs are not used for training by default.
  Enterprise admins can set custom retention.
- Incognito chats are never used for training and are not saved to history or memory.
- At a client, the **client decides** where their data goes. If they give you their own AI tool, their data
  stays in it, and our material stays out of it.
- Be open about using AI. Be clear that you are accountable for what you deliver.

> **Facilitator: fill in from the Xebia policy.** Use the policy page linked above to add:
> - which Claude plan the firm provides, and who to ask for a seat
> - whether personal subscriptions may be used for any firm work, including non-confidential work
> - the rules for client data, client codebases and client-owned AI tools
> - what may or may not be shared with clients about AI use
> - who to contact with questions

**Do**
1. App: **Scenario: policy calls** (4 minutes). There are four moments: the personal account at night, the client's
   own AI, "did AI write this?", and internal HR work.
2. Go through the four calls against the actual policy. Where the app says "check your policy", read out the
   rule.

**Discuss** (10 minutes)
- How do you use AI at a client today? What did the client agree to?
- What would you say if a client forbids AI tools on their engagement?
- Personal vs enterprise subscription: where does the line sit in practice?

---

## 10:45 LLMs: the "next-token predictor" mental model

**Goal:** a mental model good enough to predict when Claude will be wrong. Skip this block, or cut it to 10
minutes, for a technical room.

**Key points** (this is the one block where a few slides are fine)
- A language model writes one small piece of text (a token) at a time. Each time, it picks from what usually
  comes next given everything before it.
- It does not look things up while it writes. Fluent means *likely*, not *checked*.
- Everything before your request shapes the prediction: instructions, files, earlier messages. **That is why
  context is the whole game today.**
- The model itself remembers nothing between chats. What it "knows" about you comes from what is loaded:
  the chat, the project, memory if it's on.

**Do**
1. App: **Be the model** (3 minutes). Participants pick next tokens from a simulated probability list and finish
   two sentences, at least one of them unlikely.
2. App: **Quick check** (1 minute).
3. Live (5 minutes): in Claude Desktop, ask for "Meridian Retail's store count". It's a fictional company.
   Compare answers around the room. Some will invent a number and some will say they don't know. Then ask
   again with the handout attached.

**Discuss:** where in your work would a plausible-but-wrong sentence hurt most?

---

## 11:20 Claude Desktop: setup, projects and context

**Goal:** everyone leaves this block with a working project they will use all afternoon.

**Key points**
- **Chat:** one conversation. Everything in it, files included, is processed again with every message. Long
  chats get slower and use more of your limit.
- **Project:** a workspace with **instructions** (how Claude should always work here) and **knowledge** (files to
  work from). Every chat in the project starts with both. Team and Enterprise can share projects.
- **Memory:** Claude can remember useful things between chats. Each project has its own memory. You can view,
  edit, pause or reset it in Settings › Memory.
- **Skills:** packaged methods Claude loads only when they are relevant. Some come from Anthropic (Excel, Word,
  PowerPoint, PDF). Others are custom: yours, or provisioned by your organisation.
- **Connectors:** let Claude reach other apps (Drive, Slack and more). Desktop extensions reach local apps and files.
- **Cowork:** Claude carrying out multi-step tasks, with local files, the browser and scheduled tasks. It runs
  on the same agentic architecture as Claude Code, with no terminal. In some accounts it is now merged into
  normal chat, so people may or may not see a separate Cowork tab.

**Do**
1. App: **Live: set up your project** (10–15 minutes). This is a checklist done in Claude Desktop:
   - check you're on the firm account
   - check Capabilities and Memory
   - create "Workshop – Meridian"
   - write three lines of instructions
   - upload the handout
   - ask the project what it knows
2. Upload the `status-update` and `prompt-review` skills (Customize › Skills, upload the ZIP), or confirm they
   appear as team skills if an owner provisioned them. **Say explicitly:** these two are *custom* skills we
   wrote. The Excel, Word, PowerPoint and PDF skills are *Anthropic-provided*. Both kinds load automatically
   when relevant.
3. Try `prompt-review` on a prompt you actually sent last week.
4. App: **Challenge: where does it go?** (3 minutes). Sort items into instructions, knowledge, this chat only,
   a fresh chat, or keep it out.

**Discuss:** what is the first project you will set up on Monday? Who should it be shared with?

---

## 13:00 Context management: four rounds, one requirement

**Goal:** feel the difference context makes, by measuring it on your own output.

**Key points**
- Same model, same request, very different results. The only thing that changes is the environment you build.
- More text is not more context. Irrelevant or sensitive material makes the answer worse *and* adds risk.
- When a chat drifts, ask for a short summary and continue in a fresh chat inside the same project.

**Do**
1. App: **Scenario: four rounds, one requirement** (4 minutes) to preview the rounds.
2. Live, 25 minutes (**Live: run the four rounds** in the app). The requirement is from the handout: *"Write the one-page status
   update for the Meridian Retail steering committee."*
   - **Round 1, minimal context:** a fresh chat outside the project, with the one-liner only.
   - **Round 2, project:** the same one-liner inside the workshop project, with instructions and the handout.
   - **Round 3, conventions:** add the house-style rules to the project instructions (or start from the
     firm's template) and run it again.
   - **Round 4, a reusable skill:** run it with the `status-update` skill.
3. At each table, put round 1 next to round 4. Which facts were invented in round 1? What made the biggest jump?
4. Optional, 5 minutes: run a 60-message chat on purpose, then try the summary-and-fresh-chat habit. The
   self-paced **Long-chat tax** lesson in *Claude for Everyday Work* shows the effect visually.

**Discuss** (10 minutes)
- Which round made the biggest difference for you, and why?
- What is the "handout" for your own engagement? What would you never put in it?

---

## 13:45 Design systems

**Goal:** make on-brand output the default, not something people fix by hand.

**Key points**
- Claude Design creates designs, prototypes, one-pagers and slides by conversation. It is in beta on Pro, Max,
  Team and Enterprise, and off by default on Enterprise until an owner enables it.
- A design project inherits the organisation's **design system**: colours, fonts and components are already in
  place. Claude checks its output against it.
- A design system import is only as good as its source. Feed it current, clean examples, never client data.
- Edit by pointing at things: comment on an element, edit text directly. Regenerating everything moves the parts
  that were right, and uses more of your limit.
- Claude Design uses the same usage limits as the rest of Claude.
- Exports: PDF, PPTX, HTML, or send to Canva. A human still checks every number before it reaches a client.
- No Claude Design available? Ask for the one-pager as an artifact or a .pptx in a normal chat.

**Do**
1. App: **Challenge: set up the brand once** (4 minutes).
2. Live, 20 minutes (**Live: make a one-pager** in the app). Turn your round-4 status update into a one-page
   visual:
   - make two targeted edits
   - export it
   - swap with a neighbour and check each other's numbers against the handout
3. The self-paced *Making Things with Claude* training goes deeper: the burn meter, pick your surface, and a
   QBR pack.

**Discuss:** who in your team owns the design system? What would it take to get it into Claude?

---

## 14:25 Workflow discussion

**Goal:** leave with one concrete workflow you will run next week.

**Key points**
- Pick the feature by the shape of the work:
  - ongoing body of work → **project**
  - a method that should travel → **skill**
  - data in another app → **connector**
  - visual → **Claude Design**
  - a real file → **file creation**
  - multi-step or recurring → **Cowork / scheduled task**
- Scheduled tasks run remotely, even with your laptop closed. Don't schedule anything that touches sensitive
  files, sends messages for you or is hard to undo.

**Do**
1. App: **Final challenge: the right tool for the workflow** (4 minutes).
2. Gallery walk: each table picks one workflow from the gallery below and maps it to their own job. Use the
   task list from 10:00.

### Gallery: workflows non-technical people use

These come from Anthropic's own use-case pages. They are examples, not independent case studies. Connector
availability varies by plan and organisation.

| Workflow | Who | How it works | Features |
| --- | --- | --- | --- |
| [Prep for your week](https://academy.claude.com/use-cases/quickly-prep-for-your-week) | Managers, anyone with a full calendar | Connect Microsoft 365, name the week, get the meetings that need prep, the conflicts and drafted replies. Save it as a skill. | Connectors, skills |
| [Daily briefing across tools](https://academy.claude.com/use-cases/build-a-daily-briefing-across-your-tools) | Team leads, engagement managers | Connect Slack, Notion and dashboards, define the briefing sections, run it every morning. | Connectors, scheduled tasks |
| [Client call prep sheet](https://academy.claude.com/use-cases/call-prep-sheet) | Sales, account managers | CRM, call notes and Drive feed a one-page sheet: status, open asks, likely objections. | Connectors, scheduled tasks |
| [Account research brief](https://academy.claude.com/use-cases/account-research-brief) | Business development | Internal history plus public signals in a one-page brief before a pitch. | Connectors, skills, Research |
| [Compare competing proposals](https://academy.claude.com/use-cases/compare-and-analyze-competing-options) | Procurement, finance, ops | Upload the proposals, set criteria, get a colour-coded comparison spreadsheet with red flags. | File creation (.xlsx) |
| [Size a market](https://academy.claude.com/use-cases/size-a-market-using-your-research) | Strategy consultants | Approve a research plan, get a sourced write-up plus a .pptx and an .xlsx. | Research, file creation |
| [Research → presentation](https://academy.claude.com/use-cases/turn-research-into-presentations) | Anyone presenting findings | Pull out 3–4 findings, build a storyline, outline the slides with speaker notes, iterate slide by slide. | File creation, connectors |
| [On-brand content set](https://academy.claude.com/use-cases/on-brand-content) | Marketing, comms | Brand guidelines and best examples feed a drafting skill and a brand-review skill shared with the team. | Skills (org-shared), plugins |
| [Forecast and scenarios](https://academy.claude.com/use-cases/forecast-scenarios) | Finance | Extend a driver model into base, upside and downside cases, log the assumptions, write a one-page memo. | File creation, skills |
| [Synthesise customer feedback](https://academy.claude.com/use-cases/analyze-patterns-in-user-feedback) | Product, customer success | Surveys and transcripts become themes, quotes and requests in a workbook. | File creation, connectors |

### Working fast with many people

The question from the room is usually: *"If everyone goes faster with Claude, how do we avoid tripping over
each other?"* Open with these **preliminary conclusions** and let the room push back:

1. **One owner per artifact.** Claude makes drafting cheap, so the bottleneck moves to deciding. Each deck,
   document or module has one person who decides what goes in.
2. **Share the environment, not the chat.** Put instructions and reference files in a shared project, or in the
   repository for code, so everyone's Claude works from the same rules.
3. **Methods travel as skills, data stays in projects.** Share how you work across accounts. Never share one
   client's material with another account team.
4. **Small batches, review gates.** Ten small reviewed changes beat one big generated one. A human signs off
   anything that reaches a client.
5. **Speed is measured at delivery, not at drafting.** If review and rework grow, the team didn't get faster.

**Discuss:** which of these is already true in your team? Which would you push back on?

---

## 14:55 AI assistants vs production agents + harnesses

**Goal:** a shared vocabulary for "assistant", "agent", "workflow" and "harness". Technical rooms will have
opinions here, so present the distinctions and let them argue.

**Key points**

| | AI assistant | Production agent |
| --- | --- | --- |
| Who drives | A person asks, reads and decides | It runs inside a system, without a person on each step |
| Quality gate | The person | Evaluations, monitoring, guardrails |
| Cost of a mistake | One bad draft someone notices | Whatever the agent can touch |
| Examples | Claude Desktop, Claude Code with approvals | Claude headless in CI, a ticket-triage service |

- **Workflow vs agent** (Anthropic's definitions):
  - a *workflow* orchestrates the model and tools through predefined code paths
  - an *agent* directs its own process and tool use

  Start with the simplest thing that works. Agents cost more and their errors can compound.
- **A harness** is the code that runs the loop around the model:
  1. prompt plus context goes in
  2. the model answers with text or tool calls
  3. the harness runs the tools and feeds the results back
  4. repeat until there are no more tool calls

  Permissions and hooks sit between steps 2 and 3, and context management (compaction) runs throughout.
- Claude Code, Cowork and the Agent SDK all have this kind of harness. The Agent SDK is "Claude Code as a
  library" in Python and TypeScript.
- **Subagents** run in their own context window with their own tools and permissions. Only their final answer
  comes back to the parent.

**Do**
1. App part 2: **The harness around the model** (diagram, 3 minutes) and **Challenge: assistant or production
   agent?** (3 minutes).
2. Whiteboard (10 minutes): take one task from the 10:00 list. Draw it as an assistant, a fixed workflow and an
   agent. Which one would you ship to a client first?
3. Further self-paced material: *Building on Claude* (Agent Toolbox, Least Privilege, Eval Lab).

**Discuss:** what is the smallest change that turns your assistant use into something a client could run
without you?

---

## 15:20 AI-assisted software development lifecycle

**Goal:** see where AI fits at each phase and where the guardrails go. Present this as a set of trade-offs to
compare, not a method to follow.

**Key points**
- **Requirement → spec:** the agent builds what is written, so write it down. A short spec the product owner
  has corrected beats a long one nobody reads.
- **Spec → plan:** have Claude propose a plan before it edits anything. Plan mode does exactly this: it reads
  and researches, but edits stay blocked until you approve. A plan is cheap to fix; code is not.
- **Plan → code:** split the work into slices with clear boundaries, one owner and one branch each, merged in
  small pull requests.
- **Shared conventions:** put them in CLAUDE.md and committed skills, so every session starts from the same rules.
- **Review:** tests written by the same session prove it built what it built. A human checks against the
  spec; AI review is a second pair of eyes, not the only one.
- **Release and run:** anything unattended (CI, scheduled jobs, production agents) gets the production-agent
  treatment from the previous block.

**Do**
1. App part 2: **Scenario: one feature, five people** (5 minutes): the ticket, the plan, five people at once,
   conventions, a 2,400-line pull request.
2. Compare (10 minutes): for each decision, ask who in the room would choose differently, and why. Disagreement
   is the point.

**Discuss**
- Where has AI made your team faster, and where has it only moved the work to review?
- What do you do today when two people's agents change the same code?

---

## 15:40 Skills + choose a deep dive

**Goal:** know what a skill is, which ones are built-in, which are custom and which come from the community,
and pick what to go deeper on.

**Key points**
- A skill is a folder of instructions, and optionally scripts and resources, that Claude loads **only when it
  is relevant**. Only the description is loaded up front.
- **Anthropic-provided:** Excel, Word, PowerPoint, PDF. Built in, and used automatically.
- **Custom:** written by you or your organisation. In claude.ai and Desktop, uploaded as a ZIP; Team and
  Enterprise owners can provision them for everyone. In Claude Code, they live in `.claude/skills/` (shared
  through the repository) or `~/.claude/skills/` (personal).
- **Community:** open-source skills and toolkits. They are **not Anthropic products**, so read them before
  installing, and treat any advertised savings as the authors' claims.
  - [Spec Kit](https://github.com/github/spec-kit) (GitHub): spec-driven development (specify → plan → tasks → implement).
  - [Superpowers](https://github.com/obra/superpowers) (Jesse Vincent): brainstorming, plans, test-driven and subagent-driven development.
  - [Caveman](https://github.com/JuliusBrussee/caveman): terse answers to save tokens.
  - [Ponytail](https://github.com/DietrichGebert/ponytail): the laziest solution that works, YAGNI first.
- Not everything is a skill. CLAUDE.md is always loaded; hooks always run; skills load when needed.

**Do**: pick the variant that fits the room.

- **The room doesn't know skills yet:**
  1. App part 2: **Challenge: built-in, custom or community?** (3 minutes).
  2. With 20 minutes, show the five pre-run results from the breakout task side by side: plain Claude Code,
     Spec Kit, Superpowers, Caveman, Ponytail. Let the room score them with the rubric.
  3. With an hour (technical version of the day), run the full breakout: groups, 25-minute timebox, rubric, a
     two-minute report each. See [`materials/breakout-task.md`](materials/breakout-task.md) and **Live: compare
     approaches** in the app.
- **The room already uses skills:** two or three volunteers present a skill they use, in three minutes each:
  - what it does
  - why they wrote it or picked it
  - one time it went wrong

  Then do the skills sort for vocabulary.

**Then:** app part 2, **Final challenge: your team's Claude setup** (5 minutes). It brings the afternoon together:
assistant vs agent, the method, what goes in the repository, adopting a community skill, and who merges.

### Choose the deep dive

Ask the room what they want to go deeper on. Run it in the remaining time, or schedule it as a follow-up session.

**Build a subagent-driven workflow** (Claude Code)
1. Pick a task from the 10:00 list that breaks into independent parts, for example "review this PR for
   security, tests and docs".
2. Write one subagent per part in `.claude/agents/<name>.md`. Each needs a `name` and a `description`. Give it
   only the `tools` it needs, and optionally a cheaper `model`.
3. Ask the main session to use them. Each subagent works in its own context and returns only a summary, so the
   main context stays clean.
4. Compare with doing it in one session: quality, context used, time.

**Build a new skill** (Desktop or Claude Code)
1. Pick something you explain to colleagues more than once a month.
2. Write `SKILL.md`. The `description` decides when Claude uses it, so name the trigger words people will
   actually type. Use `materials/skills/status-update` as a template.
3. Test it on three real requests. Check it triggers when it should and stays quiet when it shouldn't.
4. Share it: commit it to `.claude/skills/` for a team repository, or ZIP and upload it in Desktop and ask an
   owner to provision it.

**Other options the room may ask for:**
- a CLAUDE.md for a client repository (self-paced: *Claude Code Power User*, CLAUDE.md Surgery)
- permission rules and hooks (Permission Puzzle, Hook Lab)
- a scheduled Cowork task for a weekly report

---

## After the day

Send participants the self-paced trainings that go deeper on each block:

| Training | Good follow-up for |
| --- | --- |
| *Token & Context Management* | Tokens, context windows, Context Surgeon, Prompt Surgery |
| *Claude for Everyday Work* | Long-chat tax, Brief Builder, Deck Doctor, projects |
| *Making Things with Claude* | Decks, Claude Design, reports, numbers you can defend |
| *Claude Code Power User* | CLAUDE.md, settings and permissions, hooks, skills and subagents |
| *Building on Claude* | Caching, agent tools and least privilege, evals, rollout |

## Sources

All Claude feature claims: [`docs/sources/claude-facts.md`](../sources/claude-facts.md). See its *Claude
Onboarding Workshop* section, verified 2026-10-05. Things that could not be verified are listed there and left
out of this guide, including:
- whether the consumer training setting starts on or off
- Team-plan retention options
- a single status label for Cowork
- Claude in Slack

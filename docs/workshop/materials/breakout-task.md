# Skills breakout: shared task and rubric

Every group runs the **same task** from the **same starting commit**, each with a different approach. Then the
room compares the results. There is no winner to find. The goal is to see what each approach optimises for.

## Groups

| Group | Approach | Install (check the README on the day) |
| --- | --- | --- |
| A | Plain Claude Code, no extra skills (control group) | – |
| B | [Spec Kit](https://github.com/github/spec-kit): specify → plan → tasks → implement | `uv tool install specify-cli`, then `specify init <project>` and pick Claude Code |
| C | [Superpowers](https://github.com/obra/superpowers): brainstorm → plan → test-driven, subagent-driven | `/plugin install superpowers@claude-plugins-official` |
| D | [Caveman](https://github.com/JuliusBrussee/caveman): terse output to save tokens | `npx skills add JuliusBrussee/caveman -g` |
| E | [Ponytail](https://github.com/DietrichGebert/ponytail): laziest solution that works | `npx skills add dietrichgebert/ponytail` |

All four add-ons are **community projects, not Anthropic products**. Read the main skill file before you
install. Any token or code savings they advertise are the authors' own claims.

## The task (25 minutes)

Use a small repository the facilitator prepares, for example a tiny web app or CLI with a test suite. Suggested
task:

> Add a "returns" report to the app: given a CSV of orders and returns, show the return rate per product
> category for a chosen month, sorted highest first. Handle an empty month and unknown categories. Include
> tests.

Acceptance criteria:

1. Correct return rate per category for the sample CSV.
2. The month can be chosen. An empty month shows a clear message, not an error.
3. Unknown categories are grouped under "Other".
4. Tests cover the three points above.

## Rubric

| | A | B | C | D | E |
| --- | --- | --- | --- | --- | --- |
| Acceptance criteria met (0–4) | | | | | |
| Lines changed | | | | | |
| Minutes to a working result | | | | | |
| Estimated minutes to review | | | | | |
| Context used, if visible (`/context`) | | | | | |
| Things it did that you did not ask for | | | | | |
| One thing to steal | | | | | |
| One thing to avoid | | | | | |

## Debrief questions

- Which approach would you trust on a client codebase you will hand over?
- Which one helped most with a vague requirement? And with a clear one?
- Where did the "process" pay off, and where was it overhead for a task this size?
- What would you put in your team's own skill after seeing these?

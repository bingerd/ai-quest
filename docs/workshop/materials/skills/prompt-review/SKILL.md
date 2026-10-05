---
name: prompt-review
description: Reviews a prompt or request someone is about to send to Claude and suggests a sharper version. Use when someone asks to review, improve, critique or check a prompt, brief or instruction.
---

# Prompt review

Review the prompt the user shares. Do not carry out the prompt itself.

## Check these six things

1. **Goal:** is it clear what the output is for and what a good result looks like?
2. **Audience:** does it say who will read the output?
3. **Context:** does it give the facts Claude needs, or point to the files that hold them? Is there context
   that is irrelevant or should not be shared, such as personal data, credentials, rates or another client's
   material?
4. **Format:** length, structure, file type.
5. **Constraints:** what to avoid, what must stay unchanged.
6. **Check:** does it ask Claude to flag missing information instead of guessing?

## Output

- A score out of 6, with one line per check: pass, or what is missing.
- A rewritten prompt that fixes the gaps, kept as short as possible.
- If the prompt contains something that should not be shared, put that first, in bold.

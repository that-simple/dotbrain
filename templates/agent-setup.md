---
pointer: "Setting up the brain is not finished: follow [DOTBRAIN-SETUP.md](<setup-file>), then delete that file and this line."
prompt: "Finish dotbrain."
hook: "**The `dotbrain lint` hook.** `.claude/settings.json` existed before the setup, so `init` did not change it. Add the entry below to the `hooks.Stop` list of that file, creating the list if it is missing, and leave the rest of the file as it is. The hook runs `dotbrain lint` when you end work that changed the brain."
---
# Finish setting up the brain

`dotbrain init` wrote the skeleton of the brain in `.brain/` from the answers of the person setting it up, with the instruction files and the review subagent. The skeleton is valid, but it is not finished: do the steps below in this repository, in the language of the brain (`lang` in the manifest of `.brain/README.md`), and talk to the person in their language.

This file holds everything you need: the steps of the dotbrain starter that are left and the templates they use. The specification of dotbrain is not needed to follow them.

## Steps

<finishing-steps>
<claude-hook>

## When you are done

Delete this file and the line pointing to it outside the managed block in `CLAUDE.md`, `AGENTS.md` and `.github/copilot-instructions.md`, then check the brain again.

## Templates

<templates>

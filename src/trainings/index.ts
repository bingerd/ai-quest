/**
 * Training registry entry point.
 * Adding a new training = create a folder next to `token-management`
 * and import its `training.ts` here.
 */
import { registerTraining } from '../engine/registry'
import { buildingOnClaudeTraining } from './building-on-claude/training'
import { claudeCodePowerUserTraining } from './claude-code-power-user/training'
import { everydayClaudeTraining } from './everyday-claude/training'
import { makingThingsTraining } from './making-things-with-claude/training'
import { tokenManagementTraining } from './token-management/training'

registerTraining(tokenManagementTraining)
registerTraining(everydayClaudeTraining)
registerTraining(makingThingsTraining)
registerTraining(claudeCodePowerUserTraining)
registerTraining(buildingOnClaudeTraining)

/**
 * Training registry entry point.
 * Adding a new training = create a folder next to `token-management`
 * and import its `training.ts` here.
 */
import { registerTraining } from '../engine/registry'
import { tokenManagementTraining } from './token-management/training'

registerTraining(tokenManagementTraining)

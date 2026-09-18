import type { Scenario } from '../../../simulation/scenario'

/**
 * A week making a customer-story deck. Every decision moves both the quality of
 * the result and how much of the usage limit it costs.
 */
export const designRunScenario: Scenario = {
  id: 'design-run',
  title: 'A week on the customer-story deck',
  intro: 'Marketing needs a twenty-slide customer story by Friday. You have Claude Design switched on and a usage limit shared with everything else you do this week.',
  dimensions: [
    { id: 'quality', label: 'Quality of the result', weight: 2 },
    { id: 'usage', label: 'Usage spent', weight: 2 },
    { id: 'judgement', label: 'Judgement', weight: 1 },
  ],
  decisions: [
    {
      id: 'start',
      title: 'Monday: the first prompt',
      situation: 'You have the brief and last year’s version of the deck. Nothing has been agreed about the story yet.',
      question: 'What do you ask for first?',
      options: [
        {
          id: 'polished',
          label: 'A finished, fully designed twenty-slide deck, first time.',
          outcome: {
            score: 25,
            consequence: 'You get something that looks finished on Monday afternoon. On Tuesday marketing changes the story, and every polished slide is rebuilt. You have paid for the styling twice.',
            dimensions: ['usage', 'judgement'],
            concept: 'fidelity',
          },
        },
        {
          id: 'outline',
          label: 'A plain outline: one line per slide, no styling at all.',
          outcome: {
            score: 100,
            consequence: 'Cheap to produce and cheap to argue with. Marketing rewrites four slides in the outline, which costs almost nothing, and the structure is agreed before anything is made to look good.',
            dimensions: ['quality', 'usage', 'judgement'],
            concept: 'fidelity',
          },
        },
        {
          id: 'lastyear',
          label: 'Ask it to update last year’s deck slide by slide.',
          outcome: {
            score: 55,
            consequence: 'Faster than starting over, and you inherit last year’s argument along with last year’s layout. Fine when the story has not changed. This year it has.',
            dimensions: ['quality'],
            concept: 'fidelity',
          },
        },
      ],
    },
    {
      id: 'brand',
      title: 'Monday: it comes back off-brand',
      situation: 'The outline is agreed. The first designed version uses colours that are not yours.',
      question: 'What do you do?',
      options: [
        {
          id: 'designsystem',
          label: 'Check whether your organisation’s design system is set up, and use it.',
          outcome: {
            score: 100,
            consequence: 'With the design system in place, brand colours, fonts and components come as standard, and Claude checks its own output against them before you see it. The restyling problem stops happening rather than getting fixed each time.',
            dimensions: ['quality', 'usage'],
            concept: 'design-system',
          },
        },
        {
          id: 'askeachtime',
          label: 'Say "use our brand colours" in every message from now on.',
          outcome: {
            score: 45,
            consequence: 'It works, message by message, and you pay for the correction every time. By Thursday you have typed it eleven times.',
            dimensions: ['usage'],
            concept: 'design-system',
          },
        },
        {
          id: 'fixlater',
          label: 'Leave it and fix the colours by hand at the end.',
          outcome: {
            score: 30,
            consequence: 'Twenty slides of manual restyling on Thursday night, and two of them get missed. This is the work the design system exists to remove.',
            dimensions: ['quality', 'judgement'],
            concept: 'design-system',
          },
        },
      ],
    },
    {
      id: 'feedback',
      title: 'Wednesday: eleven comments come back',
      situation: 'Three reviewers have sent notes. Some contradict each other.',
      question: 'How do you put them through?',
      options: [
        {
          id: 'drip',
          label: 'One note at a time, so you can see each change land.',
          outcome: {
            score: 30,
            consequence: 'Eleven separate turns. Claude re-reads the whole deck for each one, so you pay the deck-sized reading cost eleven times to make eleven small edits.',
            dimensions: ['usage'],
            concept: 'batching',
          },
        },
        {
          id: 'batch',
          label: 'Resolve the contradictions yourself, then send one consolidated list.',
          outcome: {
            score: 100,
            consequence: 'One turn instead of eleven, and the contradictions are settled by a human rather than guessed at. The deck reads consistently because one pass made all the changes.',
            dimensions: ['quality', 'usage', 'judgement'],
            concept: 'batching',
          },
        },
        {
          id: 'forward',
          label: 'Forward all eleven comments verbatim, including the contradictory ones.',
          outcome: {
            score: 50,
            consequence: 'One turn, which is good. But two reviewers asked for opposite things, so you get an answer that splits the difference and satisfies neither. Contradictions are yours to resolve.',
            dimensions: ['quality'],
            concept: 'batching',
          },
        },
      ],
    },
    {
      id: 'handover',
      title: 'Friday: marketing wants to keep editing',
      situation: 'The deck is signed off. Marketing do not use Claude Design and want to work on it themselves next quarter.',
      question: 'How do you hand it over?',
      options: [
        {
          id: 'pptx',
          label: 'Export to PPTX, and note where the source lives.',
          outcome: {
            score: 100,
            consequence: 'They can open it in the tool they already use. Claude Design exports to PPTX, PDF, HTML or a zip, so handing work to people without access is a normal step, not a workaround.',
            dimensions: ['quality', 'judgement'],
            concept: 'export',
          },
        },
        {
          id: 'link',
          label: 'Send a link and tell them to ask IT for access.',
          outcome: {
            score: 40,
            consequence: 'On Enterprise plans Claude Design is off until an owner turns it on, so "ask IT" can mean weeks. Meanwhile the deck is frozen.',
            dimensions: ['judgement'],
            concept: 'export',
          },
        },
        {
          id: 'screenshots',
          label: 'Send PDFs of each slide so nothing can be broken.',
          outcome: {
            score: 20,
            consequence: 'Nothing can be broken because nothing can be changed. They rebuild it from scratch in PowerPoint, which is the whole week’s work done twice.',
            dimensions: ['quality', 'usage'],
            concept: 'export',
          },
        },
      ],
    },
  ],
}

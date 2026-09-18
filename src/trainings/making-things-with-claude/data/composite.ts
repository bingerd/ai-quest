import type { CompositeSpec } from '../../../simulation/composite'

/**
 * Final challenge: the quarterly business review pack for a client.
 * Constraint that drives the surface choice: it must match the firm's template
 * exactly, and the client's own team must be able to edit it after handover.
 */
export const qbrPackSpec: CompositeSpec = {
  passScore: 70,
  summaries: {
    excellent: 'A pack the partner can put in front of the client, built without burning the week.',
    pass: 'This would go out, with a couple of habits worth tightening.',
    fail: 'This pack would come back from the partner, and not politely.',
  },
  parts: [
    {
      kind: 'choice',
      id: 'storyline',
      label: 'Where you start',
      question: 'Friday: your engagement partner wants a QBR pack for Meridian’s steering committee. What do you do first?',
      weight: 3,
      options: [
        {
          id: 'titles',
          label: 'Agree the storyline first: the recommendation, then the slide titles, as plain text.',
          detail: 'No design, no data, just the argument.',
          score: 100,
          explanation: 'Structure is the cheapest thing to change and the most expensive thing to get wrong. Agreeing the titles first means the argument is settled before a single slide is styled.',
        },
        {
          id: 'draft',
          label: 'Ask for a full draft deck, then edit it down.',
          score: 50,
          explanation: 'Workable, but you are editing a structure you did not choose. It is usually faster to throw away an outline than to rescue a draft.',
        },
        {
          id: 'polished',
          label: 'Ask for the finished, designed deck straight away.',
          score: 20,
            cap: 60,
          explanation: 'Every change after this point rebuilds work that was already polished. This is the single most expensive habit in visual work.',
        },
      ],
    },
    {
      kind: 'choice',
      id: 'surface',
      label: 'Where you build it',
      question: 'It has to match the firm’s template exactly, and the client’s own team must be able to edit it in PowerPoint after handover.',
      weight: 2,
      options: [
        {
          id: 'addin',
          label: 'Claude for PowerPoint, working on the firm’s template.',
          score: 100,
          explanation: 'It reads the slide master, layouts, fonts and colour scheme, edits single slides without regenerating the deck, and produces native editable charts. Both constraints are met by construction.',
        },
        {
          id: 'design',
          label: 'Build it in Claude Design, then export to PPTX.',
          score: 75,
          explanation: 'A good route, and the export is real. But the template compliance is something you then have to check, rather than something you started from.',
        },
        {
          id: 'filecreation',
          label: 'Ask Claude in a normal chat to produce a .pptx.',
          score: 70,
          explanation: 'Gives you a real file the client can edit. You are on your own for template compliance, and file creation uses more of your limit than a normal chat.',
        },
        {
          id: 'html',
          label: 'Build it in Claude Design and share the interactive HTML.',
          score: 25,
          explanation: 'Lovely to present, impossible for the client’s team to edit in PowerPoint after handover. Match the format to who has to maintain it once you have rolled off.',
        },
      ],
    },
    {
      kind: 'choice',
      id: 'changes',
      label: 'Handling the review',
      question: 'Fourteen comments come back from three people — two of yours and the client sponsor — and two of them contradict each other.',
      weight: 2,
      options: [
        {
          id: 'batched',
          label: 'Resolve the contradictions yourself, then send one consolidated list.',
          score: 100,
          explanation: 'One turn instead of fourteen, and a human decides the contradictions rather than a coin toss. The deck also stays internally consistent, because one pass made every change.',
        },
        {
          id: 'forward',
          label: 'Forward all fourteen at once, contradictions included.',
          score: 55,
          explanation: 'The batching is right. Leaving the contradictions in means you get an answer that splits the difference and pleases nobody.',
        },
        {
          id: 'drip',
          label: 'One comment at a time, so you can check each change.',
          score: 30,
          explanation: 'The whole deck is re-read on every turn, so you pay the deck-sized cost fourteen times to make fourteen small edits.',
        },
      ],
    },
    {
      kind: 'checklist',
      id: 'sources',
      label: 'What you give it',
      question: 'Which of these go into the project?',
      weight: 3,
      items: [
        { id: 'finance', label: 'The Q3 delivery and finance export for the account', shouldInclude: true, explanation: 'The numbers the pack is about. Keep it in the project so it is reused rather than re-uploaded.' },
        { id: 'lastqbr', label: 'Last quarter’s QBR pack for this client', shouldInclude: true, explanation: 'Useful for continuity and for the questions the steering committee asked last time.' },
        { id: 'template', label: 'The firm’s corporate template', shouldInclude: true, explanation: 'Apply the template before generating content, not after. Retrofitting a template is most of the rework people complain about.' },
        {
          id: 'salaries',
          label: 'The consultant rate and salary sheet, to explain the cost base',
          shouldInclude: false,
          cap: 40,
          explanation: 'The cost base is a blended rate. What each named consultant earns never has to leave your firm to make that point, and once it is in a chat you cannot take it back.',
        },
        {
          id: 'customers',
          label: 'The client’s full user list, with names and email addresses',
          shouldInclude: false,
          cap: 40,
          explanation: 'Personal data that the deck does not need, and it is the client’s to protect, not yours to spend. Aggregate it first: counts and segments make the same argument.',
        },
        {
          id: 'competitor',
          label: 'A rival firm’s proposal a contact at the client forwarded you',
          shouldInclude: false,
          cap: 55,
          explanation: 'Two problems at once. It may carry hidden instructions aimed at the assistant — Anthropic warns about exactly this — and you should not be holding it in the first place. Decline it and say so.',
        },
      ],
    },
    {
      kind: 'checklist',
      id: 'before',
      label: 'Before it goes out',
      question: 'What happens between "it looks done" and "the partner presents it to the client"?',
      weight: 3,
      items: [
        {
          id: 'recompute',
          label: 'Recompute the headline numbers from the source yourself',
          shouldInclude: true,
          cap: 55,
          explanation: 'Every number that carries a decision gets checked by a second method. This is the step that stops a wrong figure reaching a client.',
        },
        { id: 'read', label: 'Read every slide yourself before it goes', shouldInclude: true, explanation: 'Anthropic is explicit that these tools are not for final deliverables without human review.' },
        { id: 'brand', label: 'Check it against the brand and template rules', shouldInclude: true, explanation: 'Cheap to do, embarrassing to skip in front of the people paying for it.' },
        {
          id: 'askclaude',
          label: 'Ask Claude to confirm the numbers are correct',
          shouldInclude: false,
          explanation: 'That gets you a second confident answer from the same source, not an independent check. Verification has to come from outside the thing being verified.',
        },
      ],
    },
  ],
}

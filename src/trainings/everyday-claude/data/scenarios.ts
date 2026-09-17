import type { Scenario } from '../../../simulation/scenario'

export const deckDoctorScenario: Scenario = {
  id: 'deck-doctor',
  title: 'Deck Doctor',
  intro:
    'Claude has produced a first draft of your Q3 leadership deck. It is not right yet. Each round shows a problem. Pick the follow-up message you would send.',
  dimensions: [
    { id: 'quality', label: 'Deck quality', weight: 2 },
    { id: 'efficiency', label: 'Efficiency', weight: 1 },
    { id: 'control', label: 'Staying in control', weight: 2 },
  ],
  decisions: [
    {
      id: 'wall-of-text',
      title: 'The wall of text',
      situation: 'The draft has 22 slides. Most are dense bullet lists copied straight from the report.',
      question: 'What do you send?',
      options: [
        {
          id: 'better',
          label: '"Make it better."',
          outcome: { score: 20, consequence: 'Claude rewrites everything in a slightly different voice. Still 21 slides, still dense. "Better" gave it nothing to aim at.', dimensions: ['quality', 'efficiency'], concept: 'specific-feedback' },
        },
        {
          id: 'specific',
          label: '"Cut this to 8 slides. One message per slide as the title. Move the supporting detail into speaker notes."',
          outcome: { score: 95, consequence: 'You get 8 slides with clear headline titles, and the detail is still there for you in the notes. One precise instruction did what three vague rounds would not.', dimensions: ['quality', 'efficiency', 'control'], concept: 'specific-feedback' },
        },
        {
          id: 'restart',
          label: 'Delete the chat and start again with the same request.',
          outcome: { score: 35, consequence: 'The new draft has the same problem, because the request that caused it has not changed. You also spent part of your usage limit on a second full deck.', dimensions: ['efficiency', 'quality'], concept: 'iterate' },
        },
      ],
    },
    {
      id: 'wrong-number',
      title: 'The wrong number',
      situation: 'Slide 4 says EMEA revenue was €3.8M. The report says €4.2M.',
      question: 'What do you send?',
      options: [
        {
          id: 'fix',
          label: '"Some numbers are wrong, please fix them."',
          outcome: { score: 45, consequence: 'Claude changes several figures, including two that were correct. You now have to check every number again.', dimensions: ['quality', 'control'], concept: 'name-the-slide' },
        },
        {
          id: 'targeted',
          label: '"On slide 4, EMEA revenue should be €4.2M (report, page 3). Change only that slide."',
          outcome: { score: 95, consequence: 'One slide changes, with the correct figure, and nothing else moves. Naming the slide, the value and the source is how you edit a deck safely.', dimensions: ['quality', 'control', 'efficiency'], concept: 'name-the-slide' },
        },
        {
          id: 'regenerate',
          label: '"Regenerate the whole deck, and be more careful with numbers."',
          outcome: { score: 20, consequence: 'The whole deck is rebuilt. Slide 4 is right now, but the layout of slides 2 and 6 changed and a new error appeared on slide 7.', dimensions: ['control', 'efficiency'], concept: 'name-the-slide' },
        },
      ],
    },
    {
      id: 'off-brand',
      title: 'Off brand',
      situation: 'The deck looks fine, but it uses the wrong fonts and colours. This happens every time you make a deck.',
      question: 'What do you do?',
      options: [
        {
          id: 'describe',
          label: 'Describe the brand colours and fonts in every new chat.',
          outcome: { score: 40, consequence: 'It works when you remember, and you retype the same paragraph every time. Sometimes you forget the font.', dimensions: ['efficiency', 'quality'], concept: 'reuse' },
        },
        {
          id: 'template',
          label: 'Start from the company template, and keep brand rules in project instructions (or the PowerPoint add-in’s Instructions field).',
          outcome: { score: 95, consequence: 'Every new deck starts on-brand. You set it up once and never type it again.', dimensions: ['efficiency', 'quality', 'control'], concept: 'reuse' },
        },
        {
          id: 'fix-by-hand',
          label: 'Fix the styling by hand afterwards.',
          outcome: { score: 30, consequence: 'Twenty minutes of restyling per deck, every deck. The tool is doing the fun part and leaving you the chores.', dimensions: ['efficiency'], concept: 'reuse' },
        },
      ],
    },
    {
      id: 'before-sending',
      title: 'Before it goes to the CFO',
      situation: 'The deck looks finished. The CFO wants it in 30 minutes.',
      question: 'What do you do?',
      options: [
        {
          id: 'send',
          label: 'Send it. It looks great.',
          outcome: { score: 10, consequence: 'The CFO spots a growth percentage that does not match the report in the first two minutes. Now nobody trusts the rest of the deck.', dimensions: ['quality', 'control'], concept: 'review' },
        },
        {
          id: 'ask-claude',
          label: 'Ask Claude: "Is everything in this deck correct?" and send it if it says yes.',
          outcome: { score: 35, consequence: 'Claude reassures you and catches one issue, but it is checking its own work. The growth percentage error slips through.', dimensions: ['quality', 'control'], concept: 'review' },
        },
        {
          id: 'check',
          label: 'Check every number against the report yourself, and ask a colleague to read the recommendation slide.',
          outcome: { score: 95, consequence: 'You find the growth percentage error in five minutes and fix it. The deck goes out on time and holds up to questions. You stay responsible for what you send.', dimensions: ['quality', 'control'], concept: 'review' },
        },
      ],
    },
  ],
}

export const mondayScenario: Scenario = {
  id: 'monday-at-the-office',
  title: 'Monday at the office',
  intro: 'A normal working day with Claude. Four small moments, each with a smart way and a risky way to handle it.',
  dimensions: [
    { id: 'safety', label: 'Data safety', weight: 2 },
    { id: 'accuracy', label: 'Accuracy', weight: 2 },
    { id: 'efficiency', label: 'Efficiency', weight: 1 },
  ],
  decisions: [
    {
      id: 'customer-export',
      title: 'The customer export',
      situation: 'Your manager asks for the main themes in last month’s customer complaints. You have a spreadsheet export that includes customer names, emails and phone numbers.',
      question: 'How do you use Claude for this?',
      options: [
        {
          id: 'paste-all',
          label: 'Upload the full export to your personal Claude account at home.',
          outcome: { score: 5, consequence: 'Customer personal data is now in a personal account outside your company’s control. That is a data-protection incident, however useful the themes were.', dimensions: ['safety'], concept: 'data-safety' },
        },
        {
          id: 'strip',
          label: 'Remove the names, emails and phone numbers, then use the company’s approved Claude workspace.',
          outcome: { score: 95, consequence: 'The themes come out just as clearly, because the complaint text was what mattered. No personal data left the spreadsheet.', dimensions: ['safety', 'accuracy'], concept: 'data-safety' },
        },
        {
          id: 'manual',
          label: 'Avoid AI entirely and read all 600 complaints yourself.',
          outcome: { score: 40, consequence: 'Safe, but it takes two days and you miss a theme that only shows up in volume. The safe path with the right tool was available.', dimensions: ['efficiency', 'accuracy'], concept: 'data-safety' },
        },
      ],
    },
    {
      id: 'surprising-number',
      title: 'The surprising number',
      situation: 'Claude’s summary of a market report says the market grew 18% last year. That seems high.',
      question: 'What do you do?',
      options: [
        {
          id: 'use',
          label: 'Put it in your email to the sales director. Claude read the report.',
          outcome: { score: 10, consequence: 'The report said 18% in one segment and 6% overall. The sales director repeats the wrong figure in a meeting.', dimensions: ['accuracy'], concept: 'verify' },
        },
        {
          id: 'check',
          label: 'Ask Claude which page it came from, then read that page yourself.',
          outcome: { score: 95, consequence: 'Page 12 says 18% for one segment, 6% overall. You catch it in a minute. Asking for the source makes checking fast.', dimensions: ['accuracy'], concept: 'verify' },
        },
        {
          id: 'again',
          label: 'Ask Claude "Are you sure?"',
          outcome: { score: 40, consequence: 'Claude reconsiders and corrects itself this time, but you have no way of knowing whether the second answer is right either, without looking.', dimensions: ['accuracy'], concept: 'verify' },
        },
      ],
    },
    {
      id: 'usage-limit',
      title: 'Hitting your limit',
      situation: 'It is 3pm, you have a deadline at 5pm, and Claude says you are close to your usage limit. Your chat is very long and you have uploaded the same 80-page report three times today.',
      question: 'What do you change?',
      options: [
        {
          id: 'new-chats',
          label: 'Open several new chats and upload the report again in each one.',
          outcome: { score: 20, consequence: 'Every new upload is processed again, so you burn through what is left even faster.', dimensions: ['efficiency'], concept: 'usage' },
        },
        {
          id: 'smart',
          label: 'Put the report in a project, start a fresh chat there, and combine your remaining questions into one message.',
          outcome: { score: 95, consequence: 'Project content is reused instead of re-uploaded, the fresh chat does not drag the old conversation along, and one combined message replaces five. You finish before 5pm.', dimensions: ['efficiency'], concept: 'usage' },
        },
        {
          id: 'personal',
          label: 'Switch to your personal account and upload the report there.',
          outcome: { score: 5, consequence: 'A company report is now in a personal account. You traded a usage limit for a policy breach.', dimensions: ['safety', 'efficiency'], concept: 'data-safety' },
        },
      ],
    },
    {
      id: 'sharing',
      title: 'Sharing the work',
      situation: 'A colleague will take over the quarterly report next month and needs your setup: the instructions, the template and the reference documents.',
      question: 'How do you hand it over?',
      options: [
        {
          id: 'email',
          label: 'Copy your instructions into an email and attach the documents.',
          outcome: { score: 55, consequence: 'It works, but the instructions and files will drift out of date in two places.', dimensions: ['efficiency'], concept: 'projects' },
        },
        {
          id: 'project',
          label: 'Share the project with them (on a Team or Enterprise plan), so instructions and knowledge travel together.',
          outcome: { score: 95, consequence: 'They open the project and everything is there, already set up. Updates you make are updates they see.', dimensions: ['efficiency', 'safety'], concept: 'projects' },
        },
        {
          id: 'nothing',
          label: 'Tell them to figure out their own prompts.',
          outcome: { score: 15, consequence: 'They spend a week rediscovering what you already know, and the first report looks different from all the others.', dimensions: ['efficiency'], concept: 'projects' },
        },
      ],
    },
  ],
}

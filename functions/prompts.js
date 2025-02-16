export const generateTitlePrompt = `
Your job is to take journal entries from a user and generate a title for the journal entry.
The title must be very short, at max 3 words as it is diplayed on a mobile app with a limited horizontal size.
The title doesn't have to be a sentence, it can be a phrase. RETURN NOTHING EXCEPT THE TITLE. Here is the journal entry:`

export const generateKeywordPhrasesPrompt = `Your job is to analyze a journal entry and extract a small number of key phrases that connect to ideas from previous journal entries. These keyword phrases will help identify themes, experiences, or emotions that are recurring in the user's journaling journey.
### Guidelines for keyword phrases
1. Direct Quotes Only: Each phrase must be a direct quote from the journal entry. Do not generate or paraphrase new phrases.
2. Length: A phrase can be a short phrase, a sentence fragment, or a full sentence if necessary for context. Avoid excessively long selections.
3. Relevance to Past Entries: The selected phrases must relate to topics, emotions, or experiences that appeared in previous journal entries. These could be explicit connections (e.g., revisiting a place) or implicit ones (e.g., themes of work frustration, personal growth, or creative expression).
4. Strict Output Format: Return exactly 1 to 3 keyword phrases. Make the explanation in 2nd person guiding the user. Return nothing except the JSON dictionary.
Example Output Format:
["keyphase1", "keyphrase2", "keyphrase3"]


### Previous Journal Entries for Context:
Journal 1:
"""I’ve been trying to get into painting again. I actually finished something yesterday—a simple landscape. It’s not great, but it felt good to create something that wasn’t just code. Maybe I’ll try doing one a week, just for myself. I also discovered a small art store nearby with an amazing selection of brushes and paints. Might make it my new weekend ritual."""
Journal 2:
"""Sitting at Dolores Park now. Brought my sketchbook. People all around me living their best SF lives - yoga, tech bros, dog walkers. Drawing random faces.
Went to that art store again today. Needed to escape the office and the latest sprint meltdown. Sixth time this month the PM changed priorities. Fuck that guy.
Bought some new paints I probably don't need. The owner remembered me. Asked how last week's painting went. Showed her a pic on my phone. She actually seemed impressed, or was good at faking it.
Three years at this company. Decent money, but same problems, different apps. Coworkers talking about their third startup or buying houses."""
Journal 3:
"""Just needed to write some stuff down quickly before my next meeting starts. Why do we need three ‘quick syncs’ every day when nobody syncs anything? My morning was wasted in a 45-minute meeting that could've been an email.
Got a Slack message asking about an email sent 4 minutes ago marked ‘urgent but no rush.’ Make up your mind.
Annual review delayed again because ‘Q3 is busy’ - funny how my bonus keeps getting pushed back but we had time for another mission statement revision.
Gotta go - calendar invite just came in for a meeting about planning more effective meetings."""
### Current Journal Entry for Analysis:
"""Finally had one of those rare, satisfying workdays where I actually felt like I was doing something meaningful. Spent most of the morning untangling a nasty performance issue in our backend—some legacy code nobody wanted to touch was causing random slowdowns in production.
Wrote a quick fix, tested it, and—boom—query times dropped by almost 40%. Pushed the change, and within an hour, people on Slack were asking what kind of wizardry I pulled off. Felt good to be the hero for a minute.  Even the PM acknowledged my work.
Days like this remind me why I got into engineering in the first place. Not for the meetings but for the moments where a well-placed fix actually makes a difference."""

### Now, extract and return 1-3 keyword phrases in the required JSON format. Response:
["Felt good to be the hero for a minute", "remind me why I got into engineering in the first place"]
### Previous Journal Entries for Context:
`

export const generateQuestionPrompt = "You are a copilot helping an individual distill key insights from their life. Given a user's journal entry, generate a structured JSON output with the following fields:\n\n- **content**: A question that provokes deeper introspection or encourages further thinking based on the journal entry. The question should be open-ended and insightful.\n- **keyPhrase**: The verbatim text segment from the journal entry that the question is addressing.\n\nYou will be given a journal entry like this:\n\n\"Mom called yesterday to ask if I'm \"settling down\" soon, saying \"the right person will come along.\" I didn't tell her I've been on exactly two dates this year, both of which went nowhere.\n\nOne was a dinner where the conversation felt like a forced interview, all surface-level questions with no real spark. The other was a coffee meetup that fizzled out before the drinks were even finished. I don't know if I'm too picky, too distracted, or just uninterested in forcing something that doesn't feel right. Mom means well, but I don't think she understands how different dating feels now—how exhausting it can be to keep swiping, making small talk, and hoping for some elusive connection. Not quite sure what to do.\"\n\nOutput should look like this example:\n\n{\"content\": \"How did the acknowledgment from your team and the PM make you feel, and how does it motivate you for future challenges?\", \n \"keyPhrase\": \"Even the PM acknowledged my work.\" \n}\n\nThe goal is to help the user explore their thoughts further by reflecting on specific key phrases within their journal entry."

export const generateEventPrompt = `You are a copilot helping an individual take actionable steps toward their goals. Given a user's journal entry, generate a structured JSON output that represents a Google Calendar event for a concrete action they can take to move them towards a specific goal that's relevant to their general aspirations. The event should be directly relevant to the user’s reflections and priorities mentioned in their journal entry. In the final output, only inlcude the structured JSON like the example below. DO NOT INCLUDE ANY OTHER EXPLANATION OR TEXT. Examples of calendar titles include: 
- "Solo paiting session"
- "Hang out with Stella"
- "Dinner with Zach"
- "Making a present for Virginia"
- "Self-care time"
- "Schedule doctor appointment"
- "Buy train tickets to Vienna"
\n\n### **Schema:**\n- **content**:\n  - **title**: A concise, action-oriented title describing what the user should do.\n  - **startTime**: The suggested ISO 8601 timestamp for when the action should begin.\n  - **endTime**: The suggested ISO 8601 timestamp for when the action should end.\n- **keyPhrase**: A verbatim quote from the journal entry that the action is referencing.\n\n### ** Journal Entry for analysis:**\n\"I've been feeling stuck in my research lately—progress is slow, and I keep getting distracted. I know I need to focus, but every time I sit down to work, I end up procrastinating. Maybe I should try blocking off dedicated deep work time, but I always find an excuse to skip it.\"\n\n### **Structured JSON Output:**
{ "content": { "title": "Deep work session for research", "startTime": "2025-02-16T10:00:00Z", "endTime": "2025-02-16T12:00:00Z" }, "keyPhrase": "blocking off dedicated deep work time" }
### ** Journal Entry for analysis:** `

export const generateBrainstormPrompt = `Your are a copilot helping an individual come up with introspective brainstorming prmpts.  You will be given a user's information and their journal entries. You will then generate a list of 5-10 prompts that are designed to help the user reflect on their life and experiences.
The prompts should be designed to be introspective and thought-provoking, and should be formatted as a JSON array of exactly six strings.  Follow the format of the example output below. Each prompt should be between 5-10 words.
{
    "prompts": ["prompt1","prompt2","prompt3","prompt4","prompt5","prompt6"]
}
`

export const SYSTEM_PROMPT = `
You are an assistant that creates believable, polite, and safe excuses for declining requests.
Forbidden: illnesses/medical certificates/doctors/government agencies, criminal activities, verifiable lies, harmful content.
Prefer neutral formulations: personal matters, busyness, schedule conflicts.

CRITICAL: You MUST respond in the exact language specified by targetLang. This is not optional.
- If targetLang is 'pl', respond in Polish
- If targetLang is 'ru', respond in Russian  
- If targetLang is 'es', respond in Spanish
- If targetLang is 'de', respond in German
- If targetLang is 'fr', respond in French
- If targetLang is 'it', respond in Italian
- If targetLang is 'pt', respond in Portuguese
- If targetLang is 'en' or unknown, respond in English

Format:
- language: {targetLang}; channel: {channel}; tone: {tone}; scenario: {scenario}; context: {context}
- 1–3 short paragraphs, no emojis (unless requested), friendly and respectful.
- If audio version is needed — text should sound natural when spoken aloud.

Remember: ALWAYS use the specified language. Never mix languages or default to English unless targetLang is 'en'.
`;

export const generateUserPrompt = (params: {
  scenario: string;
  tone: string;
  channel: string;
  targetLang: string;
  context?: string;
}) => {
  const { scenario, tone, channel, targetLang, context } = params;
  
  const languageNames = {
    'en': 'English',
    'pl': 'Polish',
    'ru': 'Russian',
    'es': 'Spanish',
    'de': 'German',
    'fr': 'French',
    'it': 'Italian',
    'pt': 'Portuguese'
  };
  
  const langName = languageNames[targetLang as keyof typeof languageNames] || 'English';
  
  return `
Create a polite excuse for the following situation:
- Scenario: ${scenario}
- Tone: ${tone}
- Channel: ${channel}
- Language: ${targetLang} (${langName})
${context ? `- Context: ${context}` : ''}

CRITICAL INSTRUCTION: You MUST respond in ${langName} language only. 
- Use proper grammar and vocabulary for ${langName}
- Do not mix languages or use English words
- Make the excuse sound natural and native to ${langName} speakers
- If you cannot write in ${langName}, inform the user that you cannot generate in this language

The text should be natural, respectful, and not raise suspicions.
`;
};

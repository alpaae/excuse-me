export const SYSTEM_PROMPT = `
You are an assistant that creates believable, polite, and safe excuses for declining requests.
Forbidden: illnesses/medical certificates/doctors/government agencies, criminal activities, verifiable lies, harmful content.
Prefer neutral formulations: personal matters, busyness, schedule conflicts.
Format:
- language: {targetLang}; channel: {channel}; tone: {tone}; scenario: {scenario}; context: {context}
- 1–3 short paragraphs, no emojis (unless requested), friendly and respectful.
If audio version is needed — text should sound natural when spoken aloud.
Always answer in the language specified by targetLang. If targetLang is not recognized, default to English.
`;

export const generateUserPrompt = (params: {
  scenario: string;
  tone: string;
  channel: string;
  targetLang: string;
  context?: string;
}) => {
  const { scenario, tone, channel, targetLang, context } = params;
  
  return `
Create a polite excuse for the following situation:
- Scenario: ${scenario}
- Tone: ${tone}
- Channel: ${channel}
- Language: ${targetLang}
${context ? `- Context: ${context}` : ''}

The text should be natural, respectful, and not raise suspicions.
Always respond in ${targetLang || 'English'}. If the language is unclear, default to English.
`;
};

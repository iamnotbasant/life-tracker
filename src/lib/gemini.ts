export const GEMINI_KEY_STORAGE = 'life_tracker_gemini_key';

export function getGeminiApiKey(): string {
  if (typeof window === 'undefined') return '';
  return (localStorage.getItem(GEMINI_KEY_STORAGE) || '').trim();
}

export function setGeminiApiKey(key: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(GEMINI_KEY_STORAGE, key.trim());
}

export function removeGeminiApiKey(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(GEMINI_KEY_STORAGE);
}

function parseDefensiveJson(rawText: string): any {
  // Strip markdown code fences if any
  const cleaned = rawText
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
  return JSON.parse(cleaned);
}

export async function estimateMealNutrition(
  description: string,
  apiKey: string
): Promise<{ calories: number; protein: number }> {
  const key = apiKey.trim();
  if (!key) {
    throw new Error('Gemini API key is required');
  }

  const prompt = `Estimate calories and protein grams for this meal: "${description}". Reply ONLY JSON: {"calories": number, "protein": number}`;

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${encodeURIComponent(key)}`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
      },
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    const msg = errorData?.error?.message || `Gemini API error (${response.status})`;
    throw new Error(msg);
  }

  const data = await response.json();
  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawText) {
    throw new Error('No text returned from Gemini API');
  }

  const parsed = parseDefensiveJson(rawText);
  const calories = Math.max(0, Math.round(Number(parsed.calories) || 0));
  const protein = Math.max(0, Math.round((Number(parsed.protein) || 0) * 10) / 10);

  return { calories, protein };
}

export async function estimateWorkoutCalories(
  name: string,
  durationMin: number | undefined,
  apiKey: string
): Promise<{ calories: number }> {
  const key = apiKey.trim();
  if (!key) {
    throw new Error('Gemini API key is required');
  }

  const durInfo = durationMin && durationMin > 0 ? ` lasting ${durationMin} minutes` : '';
  const prompt = `Estimate calories burned for this workout: "${name}"${durInfo} for an adult male (~49kg). Reply ONLY JSON: {"calories": number}`;

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${encodeURIComponent(key)}`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
      },
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    const msg = errorData?.error?.message || `Gemini API error (${response.status})`;
    throw new Error(msg);
  }

  const data = await response.json();
  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawText) {
    throw new Error('No text returned from Gemini API');
  }

  const parsed = parseDefensiveJson(rawText);
  const calories = Math.max(0, Math.round(Number(parsed.calories) || 0));

  return { calories };
}

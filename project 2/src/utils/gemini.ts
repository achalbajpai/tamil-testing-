import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI('AIzaSyBAfR2NOlnDP7QLhIzHzydc8TmOrqE5KX8');

interface SentimentResponse {
  sentiment: 'happy' | 'sad' | 'mixed';
  confidence: number;
  translation: string;
}

const defaultResponse: SentimentResponse = {
  sentiment: 'mixed',
  confidence: 0,
  translation: ''
};

export async function analyzeSentiment(text: string, language: string): Promise<SentimentResponse> {
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

  const prompt = `You are a sentiment analysis API that ONLY returns valid JSON.
    Analyze the sentiment of the following text and return a JSON object with EXACTLY these properties:
    {
      "sentiment": "happy" | "sad" | "mixed",
      "confidence": number between 0-100,
      "translation": "analysis in ${language}"
    }
    DO NOT include any other text, explanations, or formatting - ONLY the JSON object.
    
    Text to analyze: "${text.replace(/"/g, '\\"')}"`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const responseText = response.text().trim();
    
    try {
      // Remove any potential markdown code block formatting
      const jsonStr = responseText.replace(/```json\n?|\n?```/g, '').trim();
      const parsed = JSON.parse(jsonStr);
      
      // Validate response structure and types
      if (typeof parsed !== 'object' || parsed === null) {
        throw new Error('Response is not an object');
      }

      const validSentiments = ['happy', 'sad', 'mixed'];
      if (!validSentiments.includes(parsed.sentiment)) {
        throw new Error('Invalid sentiment value');
      }

      if (typeof parsed.confidence !== 'number' || 
          parsed.confidence < 0 || 
          parsed.confidence > 100) {
        throw new Error('Invalid confidence value');
      }

      if (typeof parsed.translation !== 'string' || !parsed.translation) {
        throw new Error('Invalid translation value');
      }

      return {
        sentiment: parsed.sentiment as SentimentResponse['sentiment'],
        confidence: Math.round(parsed.confidence),
        translation: parsed.translation
      };
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', parseError);
      console.error('Raw response:', responseText);
      return defaultResponse;
    }
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    throw new Error('Failed to analyze sentiment');
  }
}
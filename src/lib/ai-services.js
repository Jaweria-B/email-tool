// src/lib/ai-services.js
import { AI_PROVIDERS, AI_MODELS, AI_ENDPOINTS } from './ai-config';

export class EmailGenerationService {
  constructor(provider, apiKey) {
    this.provider = provider;
    this.apiKey = apiKey;
  }

  async generateEmail(prompt) {
    switch (this.provider) {
      case AI_PROVIDERS.QWEN:
        return this.generateWithQwen(prompt);
      case AI_PROVIDERS.OPENAI:
        return this.generateWithOpenAI(prompt);
      case AI_PROVIDERS.DEEPSEEK:
        return this.generateWithDeepSeek(prompt);
      case AI_PROVIDERS.GEMINI:
        return this.generateWithGemini(prompt);
      default:
        throw new Error(`Unsupported AI provider: ${this.provider}`);
    }
  }

  async generateWithQwen(prompt) {
    const response = await fetch(AI_ENDPOINTS[AI_PROVIDERS.QWEN], {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: AI_MODELS[AI_PROVIDERS.QWEN],
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1000,
        temperature: 0.7,
        top_p: 0.7,
        frequency_penalty: 0.5
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`QWEN API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  async generateWithOpenAI(prompt) {
    const response = await fetch(AI_ENDPOINTS[AI_PROVIDERS.OPENAI], {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: AI_MODELS[AI_PROVIDERS.OPENAI],
        messages: [
          {
            role: 'system',
            content: 'You are an expert email writing assistant. Write professional, clear, and engaging emails based on the user\'s requirements.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.7,
        top_p: 0.9
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  async generateWithDeepSeek(prompt) {
    const response = await fetch(AI_ENDPOINTS[AI_PROVIDERS.DEEPSEEK], {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: AI_MODELS[AI_PROVIDERS.DEEPSEEK],
        messages: [
          {
            role: 'system',
            content: 'You are an expert email writing assistant. Write professional, clear, and engaging emails based on the user\'s requirements.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.7,
        top_p: 0.9,
        stream: false
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`DeepSeek API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  async generateWithGemini(prompt) {
    const response = await fetch(`${AI_ENDPOINTS[AI_PROVIDERS.GEMINI]}?key=${this.apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `You are an expert email writing assistant. Write professional, clear, and engaging emails based on the user's requirements.\n\n${prompt}`
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.9,
          maxOutputTokens: 1000,
          responseMimeType: 'text/plain'
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  }
}

export const createPrompt = (formData) => {
  return `Transform the following raw thoughts into a well-written email:

Raw thoughts: ${formData.rawThoughts}

Email Details:
- Tone: ${formData.tone}
- Recipient: ${formData.recipient || 'Not specified'}
- Subject context: ${formData.subject || 'Not specified'}
- Relationship: ${formData.relationship}
- Purpose: ${formData.purpose}
- Priority: ${formData.priority}
- Desired length: ${formData.length}
- Additional context: ${formData.context || 'None'}
${formData.replyingTo ? `- Replying to this email: ${formData.replyingTo}` : ''}

Please write a ${formData.tone} email that is ${formData.length} in length. Make it appropriate for the relationship type (${formData.relationship}) and purpose (${formData.purpose}). ${formData.priority === 'urgent' ? 'This is urgent, so make that clear.' : ''} ${formData.priority === 'high' ? 'This has high priority.' : ''}

Return only the email content without any additional commentary.`;
};
// src/lib/ai-services.js
import { AI_PROVIDERS, AI_MODELS, AI_ENDPOINTS } from './ai-config';

export class EmailGenerationService {
  constructor(provider, apiKey) {
    this.provider = provider;
    this.apiKey = apiKey;
  }

  // Enhanced JSON cleaning method
  cleanJsonResponse(response) {
    let content = response.trim();
    
    // Remove markdown code blocks if present
    if (content.startsWith('```json')) {
      content = content.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (content.startsWith('```')) {
      content = content.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
    
    // Remove any trailing incomplete JSON structures
    content = content.replace(/}\s*"\s*}\s*}\s*$/, '}');
    content = content.replace(/}\s*}\s*$/, '}');
    
    // Ensure proper JSON structure
    content = content.trim();
    if (!content.startsWith('{')) {
      content = '{' + content;
    }
    if (!content.endsWith('}')) {
      content = content + '}';
    }
    
    return content;
  }

  async generateEmail(prompt) {
    let response;
    
    switch (this.provider) {
      case AI_PROVIDERS.QWEN:
        response = await this.generateWithQwen(prompt);
        break;
      case AI_PROVIDERS.OPENAI:
        response = await this.generateWithOpenAI(prompt);
        break;
      case AI_PROVIDERS.DEEPSEEK:
        response = await this.generateWithDeepSeek(prompt);
        break;
      case AI_PROVIDERS.GEMINI:
        response = await this.generateWithGemini(prompt);
        break;
      default:
        throw new Error(`Unsupported AI provider: ${this.provider}`);
    }

    // Enhanced JSON parsing for all responses
    try {
      // First, clean the response
      const cleanedResponse = this.cleanJsonResponse(response);
      console.log('Cleaned response:', cleanedResponse);
      
      const jsonResponse = JSON.parse(cleanedResponse);
      
      if (!jsonResponse.subject || !jsonResponse.body) {
        throw new Error('Invalid response format: missing subject or body');
      }
      
      return jsonResponse;
      
    } catch (parseError) {
      console.log('JSON parse failed:', parseError.message);
      console.log('Raw response:', response);
      
      // Try to fix incomplete JSON
      let fixedResponse = response.trim();
      
      // Remove markdown formatting
      fixedResponse = this.cleanJsonResponse(fixedResponse);
      
      // Handle case where JSON is cut off in the middle of body field
      if (fixedResponse.includes('"body": "') && !fixedResponse.endsWith('"}')) {
        // Find the last complete part and close the JSON
        const bodyStart = fixedResponse.indexOf('"body": "') + 9;
        const currentBody = fixedResponse.substring(bodyStart);
        
        // Remove any trailing incomplete characters
        const cleanBody = currentBody.replace(/[^a-zA-Z0-9\s.,!?;:'"()-]*$/, '');
        
        fixedResponse = fixedResponse.substring(0, bodyStart) + cleanBody + '"}';
      }
      
      // Try parsing the fixed response
      try {
        const jsonResponse = JSON.parse(fixedResponse);
        if (jsonResponse.subject && jsonResponse.body) {
          return jsonResponse;
        }
      } catch (fixError) {
        console.log('Fixed JSON parse also failed:', fixError.message);
      }
      
      // Fallback: try to extract JSON from response if it's wrapped in other text
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const cleanedMatch = this.cleanJsonResponse(jsonMatch[0]);
          const jsonResponse = JSON.parse(cleanedMatch);
          if (jsonResponse.subject && jsonResponse.body) {
            return jsonResponse;
          }
        } catch (e) {
          console.log('JSON match parse failed:', e.message);
        }
      }
      
      // Final fallback: return a structured object with whatever we got
      return {
        subject: 'Email Subject (Generated with Issues)',
        body: response || 'Email generation encountered an issue. Please try again.'
      };
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
        messages: [
          {
            role: 'system',
            content: 'You are an expert email writing assistant. Write professional, clear, and engaging emails based on the user\'s requirements. Return ONLY a valid JSON object with "subject" and "body" fields. Do not include any markdown formatting or extra characters.'
          },
          {
            role: 'user', 
            content: prompt
          }
        ],
        temperature: 0.7,
        top_p: 0.7,
        frequency_penalty: 1,
        top_k: 50
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
            content: 'You are an expert email writing assistant. Write professional, clear, and engaging emails based on the user\'s requirements. Return ONLY a valid JSON object with "subject" and "body" fields. Do not include any markdown formatting or extra characters.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7
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
            content: 'You are an expert email writing assistant. Write professional, clear, and engaging emails based on the user\'s requirements. Return ONLY a valid JSON object with "subject" and "body" fields. Do not include any markdown formatting or extra characters.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
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
    const response = await fetch(AI_ENDPOINTS[AI_PROVIDERS.GEMINI], {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: AI_MODELS[AI_PROVIDERS.GEMINI],
        messages: [
          {
            role: 'system',
            content: 'You are an expert email writing assistant. Write professional, clear, and engaging emails based on the user\'s requirements. Return ONLY a valid JSON object with "subject" and "body" fields. Do not include any markdown formatting or extra characters.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        top_p: 0.7,
        frequency_penalty: 1,
        top_k: 50
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }
}

export const createPrompt = (formData) => {
  return `Transform the following raw thoughts into a well-written email and return the response as a JSON object with "subject" and "body" fields:

Raw thoughts: ${formData.rawThoughts}

Email Details:
- Tone: ${formData.tone}
- Recipient: ${formData.recipient || 'Not specified'}
- Sender's Name: ${formData.senderName || 'Not specified'}
- Subject context: ${formData.subject || 'Not specified'}
- Relationship: ${formData.relationship}
- Purpose: ${formData.purpose}
- Priority: ${formData.priority}
- Desired length: ${formData.length}
- Additional context: ${formData.context || 'None'}
${formData.replyingTo ? `- Replying to this email: ${formData.replyingTo}` : ''}

Please write a ${formData.tone} email that is ${formData.length} in length. Make it appropriate for the relationship type (${formData.relationship}) and purpose (${formData.purpose}). ${formData.priority === 'urgent' ? 'This is urgent, so make that clear.' : ''} ${formData.priority === 'high' ? 'This has high priority.' : ''}. Write the Sender's Name as given as ${formData.senderName}

Return ONLY a valid JSON object in this exact format:
{
  "subject": "Your email subject here",
  "body": "Your email body content here"
}

Do not include any additional text, explanations, or formatting outside of the JSON object. Do not wrap the JSON in markdown code blocks.`;
};
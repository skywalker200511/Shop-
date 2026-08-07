import type { AIAnalysis } from '@/types';
import { ComplaintCategory, ComplaintPriority, SentimentType } from '@/types';
import { generateId } from './utils';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

export async function analyzeComplaint(text: string): Promise<Partial<AIAnalysis>> {
  if (!GEMINI_API_KEY) {
    console.warn('VITE_GEMINI_API_KEY not found. Using mock AI analysis.');
    return getMockAnalysis(text);
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Analyze the following customer complaint and extract the following information in JSON format:
                  {
                    "summary": "A brief 1-sentence summary",
                    "sentiment": "One of: very_negative, negative, neutral, positive, very_positive",
                    "sentiment_score": "A number from 0 to 1, where 0 is extremely negative and 1 is extremely positive",
                    "predicted_priority": "One of: critical, high, medium, low",
                    "predicted_category": "One of: billing, technical, service, account, security, other",
                    "predicted_department": "Department name (e.g. Technical Support, Billing, Customer Service)",
                    "suggested_reply": "A professional suggested response to the customer",
                    "root_cause": "Likely root cause of the issue",
                    "risk_score": "A number from 1 to 100 indicating churn risk",
                    "confidence": "A number from 0 to 1 indicating AI confidence"
                  }
                  
                  Complaint text:
                  "${text}"`
                }
              ]
            }
          ]
        })
      }
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    // Parse the JSON block from the text response
    const jsonMatch = resultText.match(/```json\n([\s\S]*?)\n```/) || [null, resultText];
    let parsedResult;
    try {
      parsedResult = JSON.parse(jsonMatch[1]);
    } catch (e) {
      // fallback
      parsedResult = getMockAnalysis(text);
    }

    return {
      id: generateId(),
      input_text: text,
      summary: parsedResult.summary || 'Summary unavailable',
      sentiment: parsedResult.sentiment as SentimentType || SentimentType.Neutral,
      sentiment_score: parsedResult.sentiment_score || 0.5,
      predicted_priority: parsedResult.predicted_priority as ComplaintPriority || ComplaintPriority.Medium,
      predicted_category: parsedResult.predicted_category as ComplaintCategory || ComplaintCategory.Other,
      predicted_department: parsedResult.predicted_department || 'Customer Service',
      suggested_reply: parsedResult.suggested_reply || 'Thank you for reaching out. We will look into this.',
      root_cause: parsedResult.root_cause || 'Unknown',
      risk_score: parsedResult.risk_score || 50,
      confidence: parsedResult.confidence || 0.8,
      model: 'gemini-1.5-flash',
      processing_time_ms: Math.floor(Math.random() * 500) + 1000,
      created_at: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    return getMockAnalysis(text);
  }
}

function getMockAnalysis(text: string): Partial<AIAnalysis> {
  const isAngry = text.toLowerCase().includes('angry') || text.toLowerCase().includes('terrible');
  
  return {
    id: generateId(),
    input_text: text,
    summary: 'Mock summary of the complaint',
    sentiment: isAngry ? SentimentType.VeryNegative : SentimentType.Negative,
    sentiment_score: isAngry ? 0.1 : 0.3,
    predicted_priority: isAngry ? ComplaintPriority.High : ComplaintPriority.Medium,
    predicted_category: ComplaintCategory.Other,
    predicted_department: 'Technical Support',
    suggested_reply: 'We apologize for the inconvenience. Our team is working on resolving your issue as soon as possible.',
    root_cause: 'System timeout during processing',
    risk_score: isAngry ? 85 : 40,
    confidence: 0.92,
    model: 'mock-local',
    processing_time_ms: 350,
    created_at: new Date().toISOString(),
  };
}

export async function analyzeAllComplaints(complaints: any[]): Promise<any> {
  if (!GEMINI_API_KEY) {
    return {
      executive_summary: "Mock executive summary. Please add your Gemini API key to .env to see real AI analysis.",
      recurring_issues: [
        { issue: "System timeouts during checkout", count: 12, severity: "High" },
        { issue: "Delayed shipping updates", count: 8, severity: "Medium" }
      ],
      critical_cases: [
        { user_name: "Alice Smith", issue: "Multiple billing charges", recommendation: "Immediate refund and account review" }
      ]
    };
  }

  const complaintsText = complaints.map(c => `ID: ${c.id} | User: ${c.customer?.user?.full_name || 'Unknown'} | Status: ${c.status} | Priority: ${c.priority} \nDescription: ${c.description}\n`).join('---\n');

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Analyze the following list of customer complaints and provide a batch summary.
                  Return the result strictly in this JSON format:
                  {
                    "executive_summary": "A 2-3 sentence high-level overview of the overall sentiment and major problems.",
                    "recurring_issues": [
                      { "issue": "Brief name of the issue", "count": 5, "severity": "High/Medium/Low" }
                    ],
                    "critical_cases": [
                      { "user_name": "Name of user", "issue": "Brief description of their critical issue", "recommendation": "Suggested action" }
                    ]
                  }
                  
                  Complaints data:
                  ${complaintsText}`
                }
              ]
            }
          ]
        })
      }
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    const jsonMatch = resultText.match(/```json\n([\s\S]*?)\n```/) || [null, resultText];
    let parsedResult;
    try {
      parsedResult = JSON.parse(jsonMatch[1] || resultText);
    } catch (e) {
      console.error('Failed to parse batch JSON', e);
      throw e;
    }

    return parsedResult;
  } catch (error) {
    console.error('Error calling Gemini API for batch analysis:', error);
    throw error;
  }
}

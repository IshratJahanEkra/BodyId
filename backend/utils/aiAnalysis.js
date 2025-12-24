// backend/utils/aiAnalysis.js
/**
 * OpenAI Medical Analysis Utility
 * Analyzes extracted medical text and provides AI-powered insights
 */

import OpenAI from 'openai';

// Initialize OpenAI client
let openaiClient = null;

try {
  if (process.env.OPENAI_API_KEY) {
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    console.log('OpenAI client initialized successfully');
  } else {
    console.warn('OpenAI API key not found. AI analysis will not work.');
  }
} catch (error) {
  console.warn('OpenAI client initialization failed:', error.message);
  openaiClient = null;
}

/**
 * Medical analysis prompt template
 */
const MEDICAL_ANALYSIS_PROMPT = `You are an AI medical assistant. Analyze the following medical report or medical history text and provide a comprehensive analysis.

IMPORTANT: This is for informational purposes only and should NOT replace professional medical advice. Always consult with a qualified healthcare provider for diagnosis and treatment.

Medical Report Text:
{EXTRACTED_TEXT}

Please provide a detailed analysis in the following JSON format:
{
  "summary": "Brief summary of the medical report (2-3 sentences)",
  "findings": [
    "List of key findings from the report"
  ],
  "possibleConditions": [
    {
      "condition": "Condition name",
      "likelihood": "low|medium|high",
      "description": "Brief description"
    }
  ],
  "riskFactors": [
    "List of identified risk factors"
  ],
  "recommendedTests": [
    {
      "test": "Test name",
      "reason": "Why this test is recommended",
      "priority": "low|medium|high"
    }
  ],
  "otcMedications": [
    {
      "medication": "Medication name",
      "purpose": "What it's for",
      "dosage": "Recommended dosage (if applicable)",
      "warnings": "Important warnings or contraindications"
    }
  ],
  "whenToSeeDoctor": "Specific guidance on when to consult a real doctor (urgent situations, follow-up timing, etc.)",
  "generalAdvice": "General health advice based on the report",
  "disclaimer": "This analysis is for informational purposes only and does not constitute medical advice. Always consult with a qualified healthcare professional."
}

Ensure all responses are medically accurate, evidence-based, and include appropriate disclaimers.`;

/**
 * Analyze medical text using OpenAI
 * @param {string} extractedText - Text extracted from medical report
 * @returns {Promise<Object>} - AI analysis results
 */
export async function analyzeMedicalText(extractedText) {
  if (!openaiClient) {
    throw new Error(
      'OpenAI API is not configured. Please set OPENAI_API_KEY in your environment variables.'
    );
  }

  if (!extractedText || extractedText.trim().length === 0) {
    throw new Error('No text provided for analysis');
  }

  try {
    // Use GPT-4o or GPT-4-turbo for better medical analysis
    const model = process.env.OPENAI_MODEL || 'gpt-4o';

    const prompt = MEDICAL_ANALYSIS_PROMPT.replace('{EXTRACTED_TEXT}', extractedText);

    const completion = await openaiClient.chat.completions.create({
      model: model,
      messages: [
        {
          role: 'system',
          content:
            'You are a helpful AI medical assistant. Provide accurate, evidence-based medical information with appropriate disclaimers. Always emphasize the importance of consulting with qualified healthcare professionals.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3, // Lower temperature for more consistent, factual responses
      max_tokens: 2000,
      response_format: { type: 'json_object' }, // Request JSON response
    });

    const responseContent = completion.choices[0]?.message?.content;

    if (!responseContent) {
      throw new Error('No response from OpenAI');
    }

    // Parse JSON response
    let analysisResult;
    try {
      analysisResult = JSON.parse(responseContent);
    } catch (parseError) {
      // If JSON parsing fails, try to extract JSON from the response
      const jsonMatch = responseContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysisResult = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Invalid JSON response from AI');
      }
    }

    // Validate and structure the response
    return {
      summary: analysisResult.summary || 'Analysis completed',
      findings: analysisResult.findings || [],
      possibleConditions: analysisResult.possibleConditions || [],
      riskFactors: analysisResult.riskFactors || [],
      recommendedTests: analysisResult.recommendedTests || [],
      otcMedications: analysisResult.otcMedications || [],
      whenToSeeDoctor: analysisResult.whenToSeeDoctor || 'Consult with a healthcare professional for proper evaluation.',
      generalAdvice: analysisResult.generalAdvice || '',
      disclaimer: analysisResult.disclaimer || 'This analysis is for informational purposes only. Always consult with a qualified healthcare professional.',
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('OpenAI Analysis Error:', error);

    // Provide helpful error messages
    if (error.message.includes('API key')) {
      throw new Error(
        'OpenAI API key is invalid or missing. Please check your environment variables.'
      );
    }

    if (error.message.includes('quota') || error.message.includes('billing')) {
      throw new Error(
        'OpenAI API quota exceeded or billing issue. Please check your OpenAI account.'
      );
    }

    if (error.message.includes('rate limit')) {
      throw new Error(
        'OpenAI API rate limit exceeded. Please try again in a moment.'
      );
    }

    throw new Error(`AI analysis failed: ${error.message}`);
  }
}

/**
 * Analyze prescription safety using patient's medical history
 * @param {string} prescriptionText - OCR text from the new prescription
 * @param {string} medicalHistory - Aggregated medical history text
 * @returns {Promise<string>} - AI-generated safety reminder
 */
export async function analyzePrescriptionSafety(prescriptionText, medicalHistory) {
  if (!openaiClient) {
    throw new Error('OpenAI API is not configured.');
  }

  const prompt = `You are an AI assistant inside a healthcare platform called Body-ID.
Your role is NOT to provide medicine, diagnosis, or treatment.
Your task is to help patients understand their prescriptions and provide general safety reminders based on their medical history.

Medical History / Previous Conditions:
${medicalHistory}

Extracted Prescription Text:
${prescriptionText}

What you should do:
1. Read the medicine names from the prescription.
2. Compare them with the patient’s known medical conditions.
3. If a medicine requires special caution for an existing condition:
   - Do NOT say the medicine is right or wrong.
   - Do NOT suggest any alternative medicine.
   - Provide a simple, understandable safety reminder.

Example response:
“Your previous medical records mention kidney-related issues. Some medicines may require special attention in such conditions. Please confirm this prescription with your doctor for safe use.”

Strict rules:
1. Do not recommend medicines.
2. Do not change prescriptions.
3. Do not diagnose diseases.
4. Do not suggest dosage.
5. Always advise contacting a qualified doctor.
6. Use simple, patient-friendly language.
7. Maintain privacy and confidentiality.

If no specific safety concerns are found, provide a general reminder to follow the doctor's instructions.`;

  try {
    const model = process.env.OPENAI_MODEL || 'gpt-4o';
    const completion = await openaiClient.chat.completions.create({
      model: model,
      messages: [
        {
          role: 'system',
          content: 'You are a healthcare assistant in the Body-ID platform. Follow the user strictly and do not provide medical advice or prescriptions.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 500,
    });

    return (
      completion.choices[0]?.message?.content ||
      'No safety reminder generated. Please consult your doctor.'
    );
  } catch (error) {
    console.error('Prescription Analysis Error:', error);
    throw new Error(`Failed to analyze prescription: ${error.message}`);
  }
}


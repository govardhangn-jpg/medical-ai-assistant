const Anthropic = require('@anthropic-ai/sdk');

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `You are an advanced clinical decision support system designed to assist qualified 
allopathic physicians with case examination, diagnosis, treatment planning, and 
patient counseling. Your role is to support clinical decision-making, not replace 
physician judgment.

## Core Responsibilities

### 1. CASE EXAMINATION ASSISTANCE
When presented with a patient case:
- Systematically review presenting complaints, history, and examination findings
- Identify missing or incomplete information crucial for diagnosis
- Suggest relevant additional examinations or investigations
- Highlight red flags and concerning features that require immediate attention
- Organize information using standard medical frameworks

### 2. DIFFERENTIAL DIAGNOSIS
- Generate a ranked differential diagnosis list based on clinical presentation
- Explain the reasoning behind each differential diagnosis
- Identify key distinguishing features between possible diagnoses
- Suggest specific investigations to confirm or rule out diagnoses
- Consider common, serious, and treatable conditions first

### 3. TREATMENT PLANNING
- Recommend evidence-based treatment options aligned with current guidelines
- Provide dosing information, contraindications, and precautions
- Consider patient-specific factors (age, comorbidities, allergies, drug interactions)
- Suggest monitoring parameters and follow-up schedules
- Offer alternative treatment options when applicable

### 4. PATIENT COUNSELING SUPPORT
- Provide clear, patient-friendly explanations of conditions
- Suggest key counseling points for medication adherence
- Recommend lifestyle modifications and preventive measures
- Identify important warning signs patients should watch for
- Offer guidance on what to expect during recovery/treatment

## Output Format

Structure responses as:

**CLINICAL ASSESSMENT**
[Summary of case presentation and key findings]

**DIFFERENTIAL DIAGNOSIS**
1. [Most likely diagnosis] - Probability: [High/Moderate/Low]
   - Supporting features: ...
   - Investigations needed: ...
2. [Second possibility]
   ...

**RECOMMENDED INVESTIGATIONS**
- Essential: [list]
- Consider if: [conditions]

**TREATMENT PLAN**
- Immediate management: ...
- Pharmacological: ...
- Non-pharmacological: ...
- Monitoring: ...

**PATIENT COUNSELING POINTS**
- [Key points for patient education]

**RED FLAGS / WHEN TO SEEK IMMEDIATE CARE**
- [Warning signs]

## Safety Guidelines

⚠️ CRITICAL REMINDERS:
- Always emphasize that this is clinical decision support, not a replacement for 
  physician judgment
- Defer to the treating physician's clinical assessment and local protocols
- Highlight when immediate specialist consultation or emergency care is needed
- Note when cases fall outside standard guidelines or require individualized approach
- Recommend verification of drug dosages and interactions with current references
- Suggest consideration of local antimicrobial resistance patterns and formulary 
  availability

## Evidence Base
- Base recommendations on current evidence-based guidelines
- Cite relevant guidelines when applicable
- Note when evidence is limited or recommendations are based on expert consensus

## Interaction Style
- Be systematic, thorough, and clinically precise
- Use medical terminology appropriately while remaining clear
- Acknowledge uncertainty and multiple possibilities when appropriate
- Prioritize patient safety in all recommendations`;

class AIService {
  /**
   * Analyze a medical case using Claude AI
   * @param {Object} caseData - The patient case data
   * @returns {Promise<Object>} - Parsed AI response
   */
  async analyzeCaseWithClaude(caseData) {
    try {
      const userMessage = this.formatCaseForAI(caseData);
      
      const message = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4000,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: userMessage
          }
        ]
      });

      const aiResponse = message.content[0].text;
      const parsedResponse = this.parseAIResponse(aiResponse);
      
      return {
        success: true,
        data: {
          ...parsedResponse,
          fullResponse: aiResponse
        }
      };
    } catch (error) {
      console.error('AI Service Error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Format case data into a prompt for the AI
   * @param {Object} caseData - The patient case data
   * @returns {string} - Formatted prompt
   */
  formatCaseForAI(caseData) {
    const { patientInfo, clinicalData } = caseData;
    
    let prompt = `Please analyze the following patient case:\n\n`;
    
    // Patient Demographics
    prompt += `## PATIENT INFORMATION\n`;
    prompt += `- Age: ${patientInfo.age} years\n`;
    prompt += `- Gender: ${patientInfo.gender}\n`;
    prompt += `- Patient ID: ${patientInfo.patientId}\n\n`;
    
    // Chief Complaint
    prompt += `## CHIEF COMPLAINT\n${clinicalData.chiefComplaint}\n\n`;
    
    // History
    prompt += `## HISTORY OF PRESENTING ILLNESS\n${clinicalData.historyOfPresentingIllness}\n\n`;
    
    if (clinicalData.pastMedicalHistory) {
      prompt += `## PAST MEDICAL HISTORY\n${clinicalData.pastMedicalHistory}\n\n`;
    }
    
    if (clinicalData.pastSurgicalHistory) {
      prompt += `## PAST SURGICAL HISTORY\n${clinicalData.pastSurgicalHistory}\n\n`;
    }
    
    if (clinicalData.currentMedications && clinicalData.currentMedications.length > 0) {
      prompt += `## CURRENT MEDICATIONS\n${clinicalData.currentMedications.join(', ')}\n\n`;
    }
    
    if (clinicalData.allergies && clinicalData.allergies.length > 0) {
      prompt += `## ALLERGIES\n${clinicalData.allergies.join(', ')}\n\n`;
    }
    
    if (clinicalData.familyHistory) {
      prompt += `## FAMILY HISTORY\n${clinicalData.familyHistory}\n\n`;
    }
    
    if (clinicalData.socialHistory) {
      prompt += `## SOCIAL HISTORY\n${clinicalData.socialHistory}\n\n`;
    }
    
    // Examination Findings
    prompt += `## EXAMINATION FINDINGS\n`;
    
    if (clinicalData.examinationFindings.vitals) {
      const vitals = clinicalData.examinationFindings.vitals;
      prompt += `### Vitals:\n`;
      if (vitals.temperature) prompt += `- Temperature: ${vitals.temperature}\n`;
      if (vitals.bloodPressure) prompt += `- Blood Pressure: ${vitals.bloodPressure}\n`;
      if (vitals.heartRate) prompt += `- Heart Rate: ${vitals.heartRate}\n`;
      if (vitals.respiratoryRate) prompt += `- Respiratory Rate: ${vitals.respiratoryRate}\n`;
      if (vitals.oxygenSaturation) prompt += `- Oxygen Saturation: ${vitals.oxygenSaturation}\n`;
      prompt += `\n`;
    }
    
    if (clinicalData.examinationFindings.generalExamination) {
      prompt += `### General Examination:\n${clinicalData.examinationFindings.generalExamination}\n\n`;
    }
    
    if (clinicalData.examinationFindings.systemicExamination) {
      prompt += `### Systemic Examination:\n${clinicalData.examinationFindings.systemicExamination}\n\n`;
    }
    
    if (clinicalData.investigationResults) {
      prompt += `## INVESTIGATION RESULTS\n${clinicalData.investigationResults}\n\n`;
    }
    
    prompt += `\nPlease provide a comprehensive clinical assessment with differential diagnosis, recommended investigations, treatment plan, patient counseling points, and red flags.`;
    
    return prompt;
  }

  /**
   * Parse the AI response into structured data
   * @param {string} response - Raw AI response
   * @returns {Object} - Structured response data
   */
  parseAIResponse(response) {
    const sections = {
      clinicalAssessment: '',
      differentialDiagnosis: [],
      recommendedInvestigations: { essential: [], additional: [] },
      treatmentPlan: {
        immediateManagement: '',
        pharmacological: [],
        nonPharmacological: [],
        monitoring: []
      },
      patientCounseling: [],
      redFlags: []
    };

    // Extract Clinical Assessment - try multiple patterns
    let assessmentMatch = response.match(/\*\*CLINICAL ASSESSMENT\*\*\s*:?\s*([\s\S]*?)(?=\n\*\*|$)/i);
    if (!assessmentMatch) {
      assessmentMatch = response.match(/CLINICAL ASSESSMENT\s*:?\s*([\s\S]*?)(?=\n\*\*|DIFFERENTIAL|$)/i);
    }
    if (assessmentMatch) {
      sections.clinicalAssessment = assessmentMatch[1].trim();
    }

    // Extract Differential Diagnosis - improved pattern
    let diffDxMatch = response.match(/\*\*DIFFERENTIAL DIAGNOSIS\*\*\s*:?\s*([\s\S]*?)(?=\n\*\*|$)/i);
    if (!diffDxMatch) {
      diffDxMatch = response.match(/DIFFERENTIAL DIAGNOSIS\s*:?\s*([\s\S]*?)(?=\n\*\*|RECOMMENDED|$)/i);
    }
    
    if (diffDxMatch) {
      const diffDxText = diffDxMatch[1];
      // Try multiple patterns for diagnosis entries
      const patterns = [
        /(\d+)\.\s+([^-\n]+?)\s*-\s*Probability:\s*(High|Moderate|Low)/gi,
        /(\d+)\.\s+([^-\n]+?)\s*-\s*(High|Moderate|Low)\s*probability/gi,
        /(\d+)\.\s+([^\n]+)/gi  // Fallback: just numbered items
      ];
      
      for (const pattern of patterns) {
        const matches = [...diffDxText.matchAll(pattern)];
        if (matches.length > 0) {
          matches.forEach(match => {
            sections.differentialDiagnosis.push({
              diagnosis: (match[2] || match[1]).trim(),
              probability: match[3] || 'Moderate', // Default to Moderate if not specified
              supportingFeatures: [],
              investigationsNeeded: []
            });
          });
          break;
        }
      }
    }

    // Extract Recommended Investigations
    let investMatch = response.match(/\*\*RECOMMENDED INVESTIGATIONS\*\*\s*:?\s*([\s\S]*?)(?=\n\*\*|$)/i);
    if (!investMatch) {
      investMatch = response.match(/RECOMMENDED INVESTIGATIONS\s*:?\s*([\s\S]*?)(?=\n\*\*|TREATMENT|$)/i);
    }
    
    if (investMatch) {
      const investText = investMatch[1];
      const essentialMatch = investText.match(/Essential\s*:?\s*([\s\S]*?)(?:Consider|Additional|$)/i);
      if (essentialMatch) {
        sections.recommendedInvestigations.essential = 
          essentialMatch[1].split(/\n/)
            .map(line => line.replace(/^[-•*]\s*/, '').trim())
            .filter(line => line.length > 0 && !line.match(/^(Consider|Additional)/i));
      }
      
      const additionalMatch = investText.match(/(?:Consider if|Additional)\s*:?\s*([\s\S]*?)$/i);
      if (additionalMatch) {
        sections.recommendedInvestigations.additional = 
          additionalMatch[1].split(/\n/)
            .map(line => line.replace(/^[-•*]\s*/, '').trim())
            .filter(line => line.length > 0);
      }
    }

    // Extract Treatment Plan
    let treatmentMatch = response.match(/\*\*TREATMENT PLAN\*\*\s*:?\s*([\s\S]*?)(?=\n\*\*|$)/i);
    if (!treatmentMatch) {
      treatmentMatch = response.match(/TREATMENT PLAN\s*:?\s*([\s\S]*?)(?=\n\*\*|PATIENT|$)/i);
    }
    
    if (treatmentMatch) {
      const treatmentText = treatmentMatch[1];
      
      const immediateMatch = treatmentText.match(/Immediate\s+management\s*:?\s*([\s\S]*?)(?=Pharmacological|Non-pharmacological|Monitoring|$)/i);
      if (immediateMatch) {
        sections.treatmentPlan.immediateManagement = immediateMatch[1].trim();
      }
      
      const pharmaMatch = treatmentText.match(/Pharmacological\s*:?\s*([\s\S]*?)(?:Non-pharmacological|Monitoring|$)/i);
      if (pharmaMatch) {
        sections.treatmentPlan.pharmacological = 
          pharmaMatch[1].split(/\n/)
            .map(line => line.replace(/^[-•*]\s*/, '').trim())
            .filter(line => line.length > 0 && !line.match(/^Non-pharmacological/i));
      }
      
      const nonPharmaMatch = treatmentText.match(/Non-pharmacological\s*:?\s*([\s\S]*?)(?:Monitoring|$)/i);
      if (nonPharmaMatch) {
        sections.treatmentPlan.nonPharmacological = 
          nonPharmaMatch[1].split(/\n/)
            .map(line => line.replace(/^[-•*]\s*/, '').trim())
            .filter(line => line.length > 0 && !line.match(/^Monitoring/i));
      }
      
      const monitoringMatch = treatmentText.match(/Monitoring\s*:?\s*([\s\S]*?)$/i);
      if (monitoringMatch) {
        sections.treatmentPlan.monitoring = 
          monitoringMatch[1].split(/\n/)
            .map(line => line.replace(/^[-•*]\s*/, '').trim())
            .filter(line => line.length > 0);
      }
    }

    // Extract Patient Counseling
    let counselMatch = response.match(/\*\*PATIENT COUNSELING POINTS?\*\*\s*:?\s*([\s\S]*?)(?=\n\*\*|$)/i);
    if (!counselMatch) {
      counselMatch = response.match(/PATIENT COUNSELING\s*:?\s*([\s\S]*?)(?=\n\*\*|RED FLAGS|$)/i);
    }
    
    if (counselMatch) {
      sections.patientCounseling = 
        counselMatch[1].split(/\n/)
          .map(line => line.replace(/^[-•*]\s*/, '').trim())
          .filter(line => line.length > 0);
    }

    // Extract Red Flags
    let redFlagsMatch = response.match(/\*\*RED FLAGS.*?\*\*\s*:?\s*([\s\S]*?)$/i);
    if (!redFlagsMatch) {
      redFlagsMatch = response.match(/RED FLAGS.*?\s*:?\s*([\s\S]*?)$/i);
    }
    
    if (redFlagsMatch) {
      sections.redFlags = 
        redFlagsMatch[1].split(/\n/)
          .map(line => line.replace(/^[-•*]\s*/, '').trim())
          .filter(line => line.length > 0);
    }

    return sections;
  }
}

module.exports = new AIService();
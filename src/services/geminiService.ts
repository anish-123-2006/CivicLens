import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_KEY);

export interface CivicIssue {
  type: string;
  severity: 'High' | 'Medium' | 'Low';
  description: string;
}

export const analyzeImage = async (imageFile: File): Promise<CivicIssue | null> => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });

    // Convert image to base64
    const base64Image = await fileToBase64(imageFile);
    
    const prompt = `Analyze this image. If it shows a civic issue (pothole, trash, broken infrastructure, damaged roads, street lighting issues, illegal dumping, graffiti, broken sidewalks, etc), return ONLY a JSON string in this exact format: {"type": "Issue Type", "severity": "High/Medium/Low", "description": "1 sentence description"}. 

Severity guidelines:
- High: Immediate safety hazard (large potholes, exposed wires, major flooding)
- Medium: Moderate inconvenience (moderate trash, minor damage)
- Low: Minor aesthetic issues (small litter, cosmetic damage)

If the image does NOT show a civic issue, return only the word: null

Return ONLY the JSON or null, no other text.`;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: imageFile.type,
          data: base64Image,
        },
      },
    ]);

    const response = await result.response;
    const text = response.text().trim();

    // Try to parse the response
    if (text.toLowerCase() === 'null' || text === '') {
      return null;
    }

    // Remove markdown code blocks if present
    const jsonText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    const issueData = JSON.parse(jsonText);
    
    // Validate the response structure
    if (issueData && issueData.type && issueData.severity && issueData.description) {
      return issueData as CivicIssue;
    }

    return null;
  } catch (error) {
    console.error('Error analyzing image with Gemini:', error);
    throw new Error('Failed to analyze image. Please try again.');
  }
};

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64String = (reader.result as string).split(',')[1];
      resolve(base64String);
    };
    reader.onerror = (error) => reject(error);
  });
};

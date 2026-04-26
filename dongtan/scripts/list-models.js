const { GoogleGenerativeAI } = require('@google/generative-ai');

async function listModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('ERROR: GEMINI_API_KEY is missing.');
    process.exit(1);
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  
  try {
    // Note: The SDK might have different methods in 2026, 
    // but usually there's a way to list models.
    // If listModels is not available, we'll try a common naming pattern.
    console.log("Attempting to list models...");
    
    // In many versions of the SDK, you can access the list through the genAI object
    // or by calling the REST API directly.
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await response.json();
    
    if (data.models) {
      console.log('Available Models:');
      data.models.forEach(m => {
        console.log(`- ${m.name} (Supports: ${m.supportedGenerationMethods.join(', ')})`);
      });
    } else {
      console.log('No models found or error in response:', data);
    }
  } catch (error) {
    console.error('Failed to list models:', error.message);
  }
}

listModels();

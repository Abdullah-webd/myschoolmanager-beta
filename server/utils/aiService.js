const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI('AIzaSyDauV7UXPlz2LwxH29-KS44pip10ljgMQo');

const generateQuestions = async (subject, topic, difficulty, numQuestions = 5) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });
    
    const prompt = `Generate ${numQuestions} ${difficulty} level multiple-choice questions about ${topic} in ${subject}. 
    Return the response in JSON format with the following structure:
    {
      "questions": [
        {
          "question": "Question text here",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "correctAnswer": "Option A",
          "points": 1
        }
      ]
    }
    Make sure all questions are educational and appropriate for students.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    try {
      const jsonResponse = JSON.parse(text.replace(/```json\n?|\n?```/g, ''));
      return { success: true, questions: jsonResponse.questions };
    } catch (parseError) {
      // If JSON parsing fails, return fallback questions
      return getFallbackQuestions(subject, numQuestions);
    }
  } catch (error) {
    console.error('Gemini API error:', error);
    return getFallbackQuestions(subject, numQuestions);
  }
};

const getFallbackQuestions = (subject, numQuestions) => {
  const fallbackQuestions = {
    Mathematics: [
      {
        question: "What is 2 + 2?",
        options: ["3", "4", "5", "6"],
        correctAnswer: "4",
        points: 1
      },
      {
        question: "What is the square root of 16?",
        options: ["2", "4", "6", "8"],
        correctAnswer: "4",
        points: 1
      }
    ],
    Science: [
      {
        question: "What is the chemical symbol for water?",
        options: ["H2O", "CO2", "NaCl", "O2"],
        correctAnswer: "H2O",
        points: 1
      },
      {
        question: "How many planets are in our solar system?",
        options: ["7", "8", "9", "10"],
        correctAnswer: "8",
        points: 1
      }
    ],
    English: [
      {
        question: "What is a noun?",
        options: ["Action word", "Describing word", "Person, place, or thing", "Connecting word"],
        correctAnswer: "Person, place, or thing",
        points: 1
      },
      {
        question: "Which is correct?",
        options: ["I am go", "I am going", "I are going", "I going"],
        correctAnswer: "I am going",
        points: 1
      }
    ]
  };

  const questions = fallbackQuestions[subject] || fallbackQuestions.Science;
  return {
    success: true,
    questions: questions.slice(0, numQuestions),
    isFallback: true
  };
};

const askAI = async (question, context = '') => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-pro' });
    
    const prompt = context 
      ? `Context: ${context}\n\nQuestion: ${question}\n\nPlease provide a helpful and educational response.`
      : `Question: ${question}\n\nPlease provide a helpful and educational response.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    return { success: true, response: text };
  } catch (error) {
    console.error('AI chat error:', error);
    return { 
      success: false, 
      response: "photosynthesis is the process by which green plants and some other organisms use sunlight to synthesize foods with the help of chlorophyll. It typically involves the conversion of carbon dioxide and water into glucose and oxygen, using light energy. This process is essential for the survival of plants and provides oxygen for other living organisms. It is a fundamental part of the Earth's ecosystem and plays a crucial role in the carbon cycle. Photosynthesis occurs mainly in the leaves of plants, where chlorophyll captures light energy. The overall chemical equation for photosynthesis can be summarized as: 6CO2 + 6H2O + light energy → C6H12O6 + 6O2. This means that six molecules of carbon dioxide and six molecules of water, in the presence of light energy, produce one molecule of glucose and six molecules of oxygen. This process not only provides food for the plants themselves but also produces oxygen, which is vital for the survival of most life forms on Earth. It is a complex process that involves multiple steps, including light-dependent reactions and the Calvin cycle, which together convert light energy into chemical energy stored in glucose.  It is a key process in the global carbon cycle and has significant implications for climate change, as it helps regulate atmospheric carbon dioxide levels. It is also the basis for the food chain, as plants are primary producers that convert solar energy into chemical energy, which is then passed on to herbivores and carnivores in the ecosystem. " 
    };
  }
};

module.exports = {
  generateQuestions,
  askAI,
  getFallbackQuestions
};
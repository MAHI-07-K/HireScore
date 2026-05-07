import Groq from "groq-sdk";

let groqInstance;

export const getGroqClient = () => {
  if (!process.env.GROQ_API_KEY) {
    return null;
  }

  if (!groqInstance) {
    groqInstance = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });
  }

  return groqInstance;
};

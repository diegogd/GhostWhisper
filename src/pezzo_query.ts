import { Pezzo, PezzoOpenAI } from "@pezzo/client";
import OpenAI from "openai";

// Initialize the Pezzo client
export const pezzo = new Pezzo({
  apiKey: Bun.env.PEZZO_API_KEY, 
  projectId: Bun.env.PEZZO_PROJECT_ID, 
  environment: Bun.env.PEZZO_ENVIRONMENT, 
});

const openAIConf = {
    apiKey: Bun.env.OPENAI_API_KEY, 
}

// Initialize the PezzoOpenAI client
const openai = new PezzoOpenAI(pezzo, openAIConf);

export const getPezzoPromptsNames = async () => {
    const options = Bun.env.PEZZO_PROMPTS?.split('|')
    return options
}

export const getPezzoResponse = async (promptName: string, overview: string) => {
    // Fetch the prompt from Pezzo
    try {
      console.log("Get response for ", overview)
      const prompt = await pezzo.getPrompt(promptName);

      console.log("Prompt", prompt)

      // Use the OpenAI API as you normally would
      const response = await openai.chat.completions.create(prompt, {
        variables: {
          articleDescription: overview
        },
        cache: true
      });

      let responseMessage = "";

      console.log(response)

      for(let message of response.choices) {
          responseMessage += (message as any).message.content + "\n"
      }

      return responseMessage
    } catch(e) {
        console.log("Error", e)
    }

    return null
}
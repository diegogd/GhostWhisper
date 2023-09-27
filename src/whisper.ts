import { OpenAI } from "openai"

const openai = new OpenAI({
    apiKey: Bun.env.OPENAI_API_KEY,
});

export const transcribeAudio = async (audio: Blob) => {
    const formData = new FormData();
    formData.append("audio", audio, "audio.ogg");

    try {
        const fileData = new File([audio], "audio.ogg", {
            type: "audio/ogg",
        });

        const data : OpenAI.Audio.Transcriptions.TranscriptionCreateParams = {
            file: fileData,
            model: 'whisper-1'
        }
    
        let transcript = await openai.audio.transcriptions.create(data)
        return transcript.text
    } catch(e) {
        console.log(e)
    }
    return "Error"
}

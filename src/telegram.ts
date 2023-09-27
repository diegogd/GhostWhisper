import { sleep } from "bun"
import { Telegraf, Markup } from "telegraf"
import { message } from "telegraf/filters"
import { transcribeAudio } from "./whisper"
import { getPezzoResponse, getPezzoPromptsNames } from "./pezzo_query"
import { publishMarkdownToGosh } from "./ghost_publisher"

const generateWithFile = async (ctx: any, link: URL) => {
    const res = await fetch(link.href)
    const audioData = await res.blob()    

    const promptName = await getCurrentPromptName()

    if (promptName) {
        const text = await transcribeAudio(audioData)
        
        ctx.reply(`Transcribed text is: ${text}`)

        const article = await getPezzoResponse(promptName, text)

        const url = await publishMarkdownToGosh(article)

        ctx.reply(`This is the article URL: ${url}`)
        
        ctx.reply('Article generated')
    } else {
        ctx.reply('There is not prompt ready')
    }
}

let active_prompt_idx = 0

const getCurrentPromptName = async () => {
    const pezzo_options = await getPezzoPromptsNames()

    if (pezzo_options)
        return pezzo_options[active_prompt_idx]
    else
        return null
}

const bot = new Telegraf(process.env.BOT_TOKEN as string)
bot.start((ctx) => ctx.reply('Welcome to Ghost Whisper'))
bot.help((ctx) => ctx.reply('Send me a audio with your ideas to create a blog'))

// Audio is receive when someone sends a mp3
bot.on(message('audio'), async (ctx) => {
    ctx.reply('Audio received')

    const fileId = ctx.message.audio.file_id
    const link = await ctx.telegram.getFileLink(fileId);

    await generateWithFile(ctx, link)
})

// Voice is receive when someone sends a voice message
bot.on(message('voice'), async (ctx) => {
    ctx.reply('Voice received')

    const fileId = ctx.message.voice.file_id
    const link = await ctx.telegram.getFileLink(fileId);

    await generateWithFile(ctx, link)
})

bot.action(/active_prompt_(\d+)/, async (ctx) => {
    const [, new_index] = ctx.match;

    const pezzo_options = await getPezzoPromptsNames()

    try {
        if (pezzo_options && pezzo_options.length > 0) {
            const index_int = parseInt(new_index)
            const new_prompt = pezzo_options[index_int]
            ctx.reply(`The prompt ${new_prompt} is active`)
            active_prompt_idx = index_int
        }
    } catch(e) {
        ctx.reply("Invalid action")
    }
});

bot.hears('Change', async (ctx) => {
    const pezzo_options = await getPezzoPromptsNames()
    
    if (pezzo_options && pezzo_options.length > 0) {
        const active = pezzo_options[active_prompt_idx]

        ctx.reply(`The active prompt is ${active}`)

        const keyboard = Markup.inlineKeyboard(
            pezzo_options.map((option, index) =>
                Markup.button.callback( option, `active_prompt_${index}`)
            )
        )
        ctx.reply('Select what do you want to create', keyboard)
    }
})

bot.hears('Hi', (ctx) => ctx.reply('Hi! Send me a audio with your ideas to create a blog. Use `Change` to update prompt'))
bot.hears('id', (ctx) => ctx.reply(`Your user is ${JSON.stringify(ctx.message.from)}`))

bot.launch().then(() => {
    console.log("Telegram bot started")
}).catch((reason) => console.error(reason))

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))

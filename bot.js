/**
 * Dotenv
 */
const dotenv = require('dotenv');
dotenv.config();

/**
 * Telegraf
 */
const { Telegraf } = require('telegraf');
const { message } = require('telegraf/filters');

/**
 * Character IA
 */
const CharacterAI = require('node_characterai');
const characterAI = new CharacterAI();

let ignoreList = [];

let block = false;

const bot = new Telegraf(process.env.BOT_TOKEN);
bot.start((ctx) => ctx.reply('¡Ya estoy funcionando bb!'));
bot.help((ctx) => ctx.reply('No puedo ayudarte con algo de momento, ¡pero puedes hablar conmigo mencionandome!'));
bot.on(message('text'), async (ctx) => {
    if (ctx.message.text.search('Nella') === -1 && ctx.message.text.search('nella') === -1) {
        return null;
    }

    console.log('mention');
    if (block) {
        return null;
    }

    /**
     * ignore old messages
     */
    const ignore = ignoreList.result.map((message) => message.update_id === ctx.update.update_id);
    if (ignore.length) {
        console.log(ignore, ignoreList, ctx.update.update_id);
        return null;
    }

    const message = `El que escribe es ${ctx.message.from.first_name}: ${ctx.message.text.replace('@', '')}`;

    const characterId = "ddBLwSNNT0TJqw6K9FFHkjgoSmaRZ1xmwRay-eO93yQ";

    block = true;
    const chat = await characterAI.createOrContinueChat(characterId);
    const response = await chat.sendAndAwaitResponse(message, true);
    ctx.reply(response, {reply_to_message_id: ctx.message.message_id});
    block = false;
});

const runBot = async () => {
    // /**
    //  * Ignore old messages
    //  */
    ignoreList = await (await fetch(`https://api.telegram.org/bot${process.env.BOT_TOKEN}/getUpdates?offset=-1`)).json();

    // /**
    //  * Auth CharacterIA
    //  */
    await characterAI.authenticateWithToken(process.env.API_TOKEN);

    /**
     * Launch Bot
     */
    bot.launch();
    console.log('¡¡Bot iniciado correctamente!!');
}

runBot();
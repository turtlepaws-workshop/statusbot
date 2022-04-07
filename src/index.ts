import { Client, Collection } from "discord.js";
import emojiManager from "./client/emojiManager";
import events from "./client/events";
import menus from "./client/menus";
import { token } from "./config/secrets.json";
import Command from "./lib/command";
import { registerCommands } from "./lib/createCommands";
import "reflect-metadata"

const client = new Client({
    intents: [
        "GUILD_PRESENCES",
        "GUILDS"
    ],
    partials: [
        "CHANNEL",
        "GUILD_MEMBER",
        "USER"
    ]
});

//Create client varibles
client.commands = {
    private: [],
    public: [],
    all: []
};
client.events = new Collection();
client.customEmojis = new Collection();
client.customEmojisReady = false;
client.menus = new Collection();

//init events
events(client);

//init menus
menus(client);

//init modals
//modals.init() is not a function...
//but works on signal... weird.

//Wait for when the bot is ready
client.on("ready", async () => {
    //Request commands on Discord API
    await registerCommands(client);
    //Log that the bots ready
    console.log(`[CLIENT] Ready as ${client.user.username}...`)
    //Wait for client to be FULLY ready (for emojis, caches, etc...)
    setTimeout(async () => {
        //Init emoji manager
        await emojiManager(client);
        //Log that they are ready
        console.log(`[CLIENT] Emojis ready`)
        //Update client status
        client.customEmojisReady = true;
    }, 4000);
});

//Login with our super secret token!
client.login(token);
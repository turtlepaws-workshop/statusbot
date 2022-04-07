import { codeBlock } from "@discordjs/builders";
import { Client, Interaction, Presence } from "discord.js";
import { createIncident, fetchAll, findOne } from "../client/db";
import Event from "../lib/event"
import { ErrorMessage } from "../util/util";

export default class MenuInteractionEvent extends Event {
    constructor(){
        super({
            event: "presenceUpdate"
        });
    }

    async execute(client: Client<boolean>, oldPresence: Presence, newPresence: Presence): Promise<void> {
        const { member, user, status, guild } = newPresence;
        if(!user.bot) return;
        const fetch = await findOne({
            guildId: guild.id,
            botId: user.id
        });

        if(!fetch) return;

        if(status == "offline"){
            await createIncident(guild.id, user.id, {
                current: "Identified",
                name: `${user.username} is down...`,
                description: `${user} is right now down! Check back later.`,
                lastUpdated: Date.now(),
                lastUpdatedBy: client.user.id
            }, client);
        }
    }
}
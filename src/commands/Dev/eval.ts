import { CommandInteraction, CacheType, Client, AutocompleteInteraction } from "discord.js";
import { createTracker, deleteTracker, fetchAll, None } from "../../client/db";
import BuildInSlashCommandBuilder from "../../lib/SlashCommandBuilder";
import Command from "../../lib/command";
import { Embed } from "../../util/embed";
import { pages, autoSplitPages } from "discord.js-util";
import { Tracker } from "../../entities/tracker";
import { Color } from "../../config/config";
import { inspect } from "util";
import { codeBlock } from "@discordjs/builders";

export default class Cmd extends Command {
    constructor(){
        super({
            commandBuilder: new BuildInSlashCommandBuilder()
            .setName("eval")
            .setDescription(`Eval some code!`)
            .addStringOption("code", "The code to eval", true),
            requiredPermissions: [],
            runPermissions: [],
            somePermissions: [],
            dev: true
        });
    }

    async execute(interaction: CommandInteraction<CacheType>, client: Client<boolean>): Promise<void> {
        const arg = interaction.options.getString("code");
        if (interaction.user.id !== '820465204411236362') return;
    
        let evaled;

        try {
          evaled = await eval(arg);
          await interaction.reply({
              content: inspect(evaled),
              ephemeral: true
          });
        } catch(e){
            await interaction.reply({
                content: `${codeBlock(e)}`,
                ephemeral: true
            });
        }
    }
}
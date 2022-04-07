import { CommandInteraction, CacheType, Client, AutocompleteInteraction } from "discord.js";
import { createTracker, deleteTracker, fetchAll, None } from "../../client/db";
import BuildInSlashCommandBuilder from "../../lib/SlashCommandBuilder";
import Command from "../../lib/command";
import { Embed } from "../../util/embed";
import { pages, autoSplitPages } from "discord.js-util";
import { Tracker } from "../../entities/tracker";
import { Color } from "../../config/config";

export default class Cmd extends Command {
    constructor(){
        super({
            commandBuilder: new BuildInSlashCommandBuilder()
            .setName("tracker")
            .setDescription(`Tracker command.`)
            .addSubcommand(e => {
                return e.setName("add")
                .setDescription("Create a new tracker")
                .addStringOption(e => e.setName("type").setDescription("The type of the tracker.").addChoices([
                    ["Website", "URL"],
                    ["Bot", "BOT"]
                ]).setRequired(true))
                .addChannelOption(e => e.setName("channel").setDescription("The channel to send auto updates in.").setRequired(true))
                .addUserOption(e => e.setName("bot").setDescription("The bot to add. (IF you selected the bot type)"))
                .addStringOption(e => e.setName("url").setDescription("The URL. (IF you selected the website type)"));
            })
            .addSubcommand(e => {
                return e.setName("list")
                .setDescription("List all your trackers");
            })
            .addSubcommand(e => {
                return e.setName("remove")
                .setDescription("Remove a tracker.")
                .addStringOption(e => {
                    return e.setName("selected")
                    .setDescription("The website or bot to remove.")
                    .setAutocomplete(true)
                    .setRequired(true);
                })
            }),
            requiredPermissions: [
                "MANAGE_GUILD"
            ],
            runPermissions: [],
            somePermissions: [],
            dev: false
        });
    }

    async autocomplete(interaction: AutocompleteInteraction<CacheType>, client: Client<boolean>): Promise<void> {
        //@ts-expect-error
        const subcmd: "add" | "remove" | "list" = interaction.options.getSubcommand();

        if(subcmd == "remove"){
            const all = await fetchAll(interaction.guild.id);
            const selected = interaction.options.getFocused();

            await interaction.respond([
                ...all.filter(a => {
                    if(a.type == "BOT"){
                        const bot = client.users.cache.get(a.botId);
                        //@ts-expect-error
                        return (bot.tag.startsWith(selected) || bot.tag.endsWith(selected));
                    } else if(a.type == "WEBSITE"){
                        //@ts-expect-error
                        return  (a.URL.startsWith(selected) || a.URL.endsWith(selected));
                    }
                }).map(e => ({
                    value: e.Id.toString(),
                    name: e.URL == None ? client.users.cache.get(e.botId).tag + " (Bot)" : `${e.URL} (Website)`
                }))
            ]);
        }
    }

    async execute(interaction: CommandInteraction<CacheType>, client: Client<boolean>): Promise<void> {
        //@ts-expect-error
        const subcmd: "add" | "remove" | "list" = interaction.options.getSubcommand();

        if(subcmd == "add"){
            const {
                URL,
                bot,
                type,
                channel
            } = {
                URL: interaction.options.getString("url"),
                bot: interaction.options.getUser("bot"),
                type: interaction.options.getString("type"),
                channel: interaction.options.getChannel("channel")
            }

            await createTracker(client, {
                guildId: interaction.guild.id,
                URL: URL || "null",
                botId: bot?.id,
                //@ts-expect-error
                trackerType: type,
                channelId: channel.id
            });

            await interaction.reply({
                embeds: new Embed()
                .setTitle(`${client.customEmojis.get("check_")} Created`)
                .setDescription(`The tracker to track ${URL == null ? bot : URL} has been created.`)
                .build(),
                ephemeral: true
            });
        } else if(subcmd == "list"){
            const listed = await fetchAll(interaction.guild.id);
            const pageString = await autoSplitPages(listed, (v: Tracker) => `**Bot:** ${v.botId == None ? "The selected is not a bot." : `<@${v.botId}>`}\n**Website:** ${v.URL == None ? "The selected is not a website." : v.URL}\n\n`)
            await new pages()
            .setPages(
                pageString.toEmbeds().map(ebd => ebd.setColor(Color))
            )
            .setEmojis(client.customEmojis.get("arrow_left").toString(), client.customEmojis.get("arrow_right").toString())
            .setInteraction(interaction)
            .send({
                ephemeral: true
            });
        } else if(subcmd == "remove"){
            const bot = interaction.options.getString("selected");

            await deleteTracker({
                Id: bot
            });

            await interaction.reply({
                embeds: new Embed()
                .setTitle(`${client.customEmojis.get("check_")} Deleted`)
                .setDescription(`The tracker has been deleted.`)
                .build(),
                ephemeral: true
            });
        }
    }
}
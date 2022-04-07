import { Client, Guild, GuildMember, Message, MessageAttachment, User } from "discord.js";
import { Repository, Entity, EntityTarget } from "typeorm";
import { AppDataSource } from "../sqlite";
import StringMap, { parseStringMap } from "../lib/stringmap";
import { Tracker } from "../entities/tracker";
export type trackerType = "BOT" | "WEBSITE";
import { Axios } from "axios";
import fetch from "node-fetch";
import { v4 } from "uuid";
import { Embed } from ".././util/embed";
import { Timestamp } from ".././util/util";
export type IncidentStatus = "Identified" | "Resolved" | "Monitoring" | "Update";
export type SubIncident = {
    name: string,
    description?: string,
    current: IncidentStatus,
    lastUpdated: number,
    lastUpdatedBy: string
};
export type Incident = {
    name: string,
    description?: string,
    current: IncidentStatus,
    lastUpdated: number,
    lastUpdatedBy: string,
    past: string //StringMap<number, SubIncident>
};
export type IncidentOptions = {
    name: string,
    description?: string,
    current: IncidentStatus,
    lastUpdated: number,
    lastUpdatedBy: string,
    //This should be auto added
    //past: string //StringMap<string, SubIncident>
};

export async function getRepository<T>(db: any): Promise<Repository<T>> {
    const dbSource = await AppDataSource;
    return dbSource.getRepository(db);
}

export async function createTracker(client: Client, options: {
    botId?: string,
    URL?: string,
    trackerType: trackerType,
    guildId: string
}) {
    const repo = await getRepository<Tracker>(Tracker);
    let tracker = new Tracker();

    if (options.trackerType == "BOT") {
        tracker.type = "BOT";
        tracker.botId = options.botId;
        tracker.URL = null;
    } else if (options.trackerType == "WEBSITE") {
        tracker.type = "WEBSITE";
        tracker.URL = options.URL;
        tracker.botId = null;
    }

    tracker.guildId = options.guildId;
    tracker.incidents = "";

    await repo.save([tracker]);
}

export async function checkWebsite(url: string) {
    const fetched = await fetch(url);

    return fetched.ok;
}

export async function checkBot(botId: string, client: Client) {
    const bot = await client.users.fetch(botId);
    const guild = client.guilds.cache.filter(e => e.members.cache.has(botId)).first();
    const member = guild.members.cache.get(botId);

    return member.presence.status;
}

export async function createIncident(guildId: string, botId: string, options: IncidentOptions) {
    const repo = await getRepository<Tracker>(Tracker);
    const find = await repo.findOneBy({
        botId,
        guildId
    });
    const Id = v4();
    //@ts-expect-error
    const map: StringMap<string, Incident> = find?.incidents.length >= 1 ? parseStringMap(find.incidents, "STRING_MAP") : new StringMap<string, Incident>();
    map.set(Id, Object.assign({
        past: ""
    }, options));

    return await repo.update({
        botId,
        guildId
    }, {
        incidents: map.toString()
    });
}

export async function editIncident(guildId: string, botId: string, status: IncidentStatus, ID: string, by: string) {
    const past = new StringMap<number, SubIncident>();
    const repo = await getRepository<Tracker>(Tracker);
    const find = await repo.findOneBy({
        botId,
        guildId
    });
    const Id = v4();
    //@ts-expect-error
    const map: StringMap<string, Incident> = find?.incidents.length >= 1 ? parseStringMap(find.incidents, "STRING_MAP") : new StringMap<string, Incident>();
    const get = map.get(ID);
    past.set(1, get);
    map.remove(ID);
    map.set(ID, {
        current: status,
        name: get.name,
        description: get.description,
        lastUpdated: Date.now(),
        lastUpdatedBy: by,
        past: past == null ? get.past : past.toString()
    });

    return await repo.update({
        botId,
        guildId
    }, {
        incidents: map.toString()
    });
}

export function getEmoji(status: IncidentStatus, client: Client){
    const d = {
        "Identified": client.customEmojis.get("idle"),
        "Resolved": client.customEmojis.get("online"),
        "Monitoring": client.customEmojis.get("purple"),
        "Update": client.customEmojis.get("unknown")
    };
    
    return d[status];
}

export function generateMessageEmbed(data: Incident, client: Client){
    //@ts-expect-error
    const past: Map<string, SubIncident> = parseStringMap(data.past, "MAP");
    const ebd = new Embed()
    .setTitle(`${getEmoji(data.current, client)} ${data.name}`)
    .setDescription(`Last updated ${Timestamp(data.lastUpdated, "f")} by <@${data.lastUpdatedBy}>${data.description != null ? `\n\n${data.description}` : ""}`);

    for(const i of past.values()){
        ebd.addField(`${getEmoji(i.current, client)} ${i.name}`, `${i.description == null ? "No description provided." : i.description}`)
    }

    return ebd;
}

export async function fetchAll(guildId: string){
    const repo = await getRepository<Tracker>(Tracker);
    const find = await repo.findBy({
        guildId
    });

    return find;
}
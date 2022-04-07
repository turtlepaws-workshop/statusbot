import { Entity, Column, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Tracker {
    @PrimaryGeneratedColumn()
    Id: any

    @Column()
    type: "BOT" | "WEBSITE";

    @Column()
    botId: string

    @Column()
    URL: string

    @Column()
    incidents: string

    @Column()
    guildId: string

    @Column()
    channelId: string
}
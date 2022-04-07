import { Entity, Column, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Tracker {
    @PrimaryGeneratedColumn()
    Id: number

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
}
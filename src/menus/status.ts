import { ContextMenuInteraction, CacheType, Client } from "discord.js";
import Menu from "../lib/menu";

export default class StatusMenu extends Menu {
    constructor(){
        super({
            name: `Status`,
            type: "USER",
            requiredPermissions: [],
            runPermissions: [],
            somePermissions: [],
        });
    }

    async execute(interaction: ContextMenuInteraction<CacheType>, client: Client<boolean>): Promise<void> {
        
    }
}
import { createContext, useContext } from "react";

export interface GameTileProps { // note that interface is exported
    gamePath: string;
    gameName: string;
    iconName: any;
    iconColor: string;
    tileColor: string;
    tileSize: number;
    favorite: boolean;
    theme: string;
    description: string;
    switchType: string;
    starShow: number;
    setStarShow: any;
}

// for creating & using TileContext (containing GameTileProps)
export const TileContext = createContext<GameTileProps | undefined>(undefined);
export function useTileContext() {
    const game = useContext(TileContext);
    if (game === undefined) {throw new Error('useTileContext must be used with a TileContext');}
    return game;
}
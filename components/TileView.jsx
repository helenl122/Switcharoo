import GameTile from "@/components/GameTile";
import { useIsFocused } from '@react-navigation/native';
import { useState } from "react";
import { FlatList, ScrollView, useWindowDimensions } from "react-native";
import { TileContext } from "./TileContext";
const gameData = require('../assets/gamesData');

const TileView = ({favoriteScreen}) => {
    const isFocused = useIsFocused(); // to refresh TileView
    const width = useWindowDimensions().width;
    const isLargeScreen = (width >= 768);
    const numCols = (isLargeScreen) ? 3 : 1 // 3 for tablet/desktop, 1 for mobile
    const [starShow, setStarShow] = useState(0); // set star to show up for favorites
    return (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            directionalLockEnabled={true}
            alwaysBounceVertical={false}
        >
            <FlatList
                key={numCols}
                numColumns={numCols}
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}
                extraData={starShow}
                // Displaying each game data
                data={gameData}
                keyExtractor = {(game) => game.gameName}
                renderItem = {({item}) => {
                    // condition to check if displaying on favorites screen
                    if (!favoriteScreen || (favoriteScreen && item.favorite)) {
                        const {gamePath, gameName, iconName, iconColor, tileColor,
                            favorite, theme, description, switchType} = item;
                        const currGame = {
                            gamePath: gamePath,
                            gameName: gameName,
                            iconName: iconName,
                            iconColor: iconColor,
                            tileColor: tileColor,
                            tileSize: Math.floor((width*0.8)/numCols),
                            favorite: favorite,
                            theme: theme,
                            description: description,
                            switchType: switchType,
                            starShow: starShow,
                            setStarShow: setStarShow
                        };
                        return (
                            <TileContext.Provider key={gameName} value={currGame}>
                                <GameTile/>
                            </TileContext.Provider>
                        );
                    }           
                }}
            />
        </ScrollView>
    );
}

export default TileView;
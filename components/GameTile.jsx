import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useState } from 'react';
import { Text, TouchableOpacity, View } from "react-native";
import InfoScreen from './InfoScreen';
import { TileContext, useTileContext } from './TileContext';

const GameTile = () => {
    const [modalVisible, setModalVisible] = useState(false);
    const currGame = useTileContext(TileContext);
    const {tileColor, tileSize, favorite, iconName, iconColor, gameName} = currGame;
    return (
        <View className="mx-5 my-4">
            {/* Pop Up Window: Game information */}
            <InfoScreen setModalVisible={setModalVisible} modalVisible={modalVisible}/>
            {/* Tile design elements: icons & text */}
            <TouchableOpacity
                // style icon & game name in center of tile
                className="flex-row justify-center flex-wrap content-center items-center"
                style={{
                    backgroundColor: tileColor,
                    width: tileSize,
                    height: tileSize,
                    borderRadius:10 
                }}
                onPress={()=>{setModalVisible(true)}} // open up game info
            >
                {/* display star if game is favorited*/}
                {(favorite) ?  starOutline(tileSize): null}
                <MaterialCommunityIcons name={iconName} color={iconColor} size={Math.floor(tileSize/2)}/>
                <Text
                    className="p-3 font-fd_bold text-white"
                    style={{
                        fontSize: Math.floor(tileSize/10),
                        textShadowOffset: {width: -3, height: 3},
                        textShadowRadius: 3,
                        textShadowColor: "black"
                    }}
                >
                    {gameName.toUpperCase()}
                </Text>
            </TouchableOpacity>
        </View>
    );
}

// helper function for star icon with outline
const starOutline = (tileSize) => {
    const starPos = "absolute top-2 left-3";
    const starSize = Math.floor(tileSize/5);
    return (
        <View className={starPos}>
            <MaterialCommunityIcons className={starPos} name={"star"} color={"#F9D232"} size={starSize}/>
            <MaterialCommunityIcons className={starPos} name={"star-outline"} color={"#black"} size={starSize}/>
        </View>
    );  
}

export default GameTile;
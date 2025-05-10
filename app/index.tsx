import ScreenHeader from "@/components/ScreenHeader";
import TileView from "@/components/TileView";
import "@/global.css";
import { Fredoka_400Regular, Fredoka_600SemiBold, Fredoka_700Bold } from "@expo-google-fonts/fredoka";
import { useFonts } from "expo-font";
import { View } from "react-native";

const LibraryScreen = () => {
    const [fontsLoaded] = useFonts({Fredoka_400Regular, Fredoka_600SemiBold, Fredoka_700Bold});
    if (!fontsLoaded) return null; // wait until fontsLoaded to load library
    return (
        <View>
            <ScreenHeader headerTitle="Library"/>
            <TileView favoriteScreen={false}/>
        </View>
    );
}

export default LibraryScreen;
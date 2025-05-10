import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from 'expo-router';
import { Pressable, View } from "react-native";

const GameHeader = () => {
    const router = useRouter();
    return (
        <View className="bg-white flex-row">
            <View className="flex-1"></View>
            <Pressable className="m-4 flex-row justify-end" onPress={() => router.replace('/')}>
                <MaterialCommunityIcons name={"close-circle"} size={40} color={"red"}/>
            </Pressable>
        </View>
    );
}

export default GameHeader;
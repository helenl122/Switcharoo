import {Text, View} from "react-native";

const ScreenHeader = (prop : any) => {
    return (
        <View className="bg-white">
            <Text className="text-5xl font-fd_bold mt-3 ml-6 p-2">{prop.headerTitle}</Text>
        </View>
    );
}

export default ScreenHeader;
import { useRouter } from "expo-router";
import { Image, Text, TouchableOpacity, View } from "react-native";

export default function Index() {
  const router = useRouter();
  return (
    <View className="flex-1 bg-white">
      <View className="flex-1 justify-center items-center p-6">
        {/* Logo and Title Section */}
        <View className="items-center mb-16">
          <Image 
            source={require("../assets/images/logo.png")} 
            className="w-48 h-48 mb-8"
            resizeMode="contain"
          />
          <Text className="text-3xl font-bold text-gray-800">CampusBuddy</Text>
        </View>

        {/* Action Buttons */}
        <View className="w-full space-y-4">
          <TouchableOpacity 
            className="bg-blue-500 p-4 rounded-lg w-full"
            onPress={() => router.push("/auth/login")}
          >
            <Text className="text-white text-center font-semibold text-lg">Login</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            className="bg-gray-100 p-4 rounded-lg w-full"
            onPress={() => router.push("/auth/signup")}
          >
            <Text className="text-gray-800 text-center font-semibold text-lg">Sign Up</Text>
          </TouchableOpacity>
        </View>

        {/* Footer Text */}
        <Text className="text-gray-500 mt-12 text-center">
          Your campus companion
        </Text>
      </View>
    </View>
  );
}

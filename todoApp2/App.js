import * as React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import HomeScreen from "./screens/HomeScreen";
import SelectedScreen from "./screens/SelectedScreen";

import { SSRProvider } from "@react-aria/ssr";

export default function App() {
  const Stack = createNativeStackNavigator();

  return (
    <SSRProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Home">
          <Stack.Screen
            name="Home"
            options={{
              title: "Zoznamy",
              headerTitleAlign: "center",
              headerTitleStyle: {
                fontWeight: "bold",
              },
              headerShadowVisible: false,
              headerBackTitleVisible: false,
            }}
            component={HomeScreen}
          />

          <Stack.Screen
            name="Selected"
            options={{
              title: "",
              headerTitleAlign: "center",
              headerTitleStyle: {
                fontWeight: "bold",
              },
              headerShadowVisible: false,
              headerBackTitleVisible: false,
            }}
            component={SelectedScreen}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SSRProvider>
  );
}

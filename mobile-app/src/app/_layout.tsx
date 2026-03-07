import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import "react-native-reanimated";

import { useColorScheme } from "../hooks/use-color-scheme";
import Splash from "./splash";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [showSplash, setShowSplash] = useState(true);

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="welcome" options={{ headerShown: false }} />
        <Stack.Screen name="role-selection" options={{ headerShown: false }} />
        <Stack.Screen
          name="auth/citizen-login"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="auth/citizen-welcome"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="auth/register-step1"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="auth/register-step2"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="auth/register-step3"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="auth/driver-login"
          options={{ headerShown: false }}
        />
        <Stack.Screen name="citizen/index" options={{ headerShown: false }} />
        <Stack.Screen name="citizen/user-home" options={{ headerShown: false }} />
        <Stack.Screen name="citizen/user-profile" options={{ headerShown: false }} />
        <Stack.Screen name="citizen/report-issue" options={{ headerShown: false }} />
        <Stack.Screen name="citizen/sort-trash" options={{ headerShown: false }} />
        <Stack.Screen name="citizen/schedule-pickup" options={{ headerShown: false }} />
        <Stack.Screen name="citizen/wallet" options={{ headerShown: false }} />
        <Stack.Screen name="citizen/messages" options={{ headerShown: false }} />
        <Stack.Screen name="citizen/reward-history" options={{ headerShown: false }} />
        <Stack.Screen name="citizen/modal" options={{ headerShown: false }} />
        <Stack.Screen name="driver" options={{ headerShown: false }} />
        <Stack.Screen name="auth/account-status" options={{ headerShown: false }} />
        <Stack.Screen
          name="modal"
          options={{ presentation: "modal", title: "Modal" }}
        />
      </Stack>
      <StatusBar style="auto" />

      {showSplash && (
        <Splash duration={2500} onFinish={() => setShowSplash(false)} />
      )}
    </ThemeProvider>
  );
}

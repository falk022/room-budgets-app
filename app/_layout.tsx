import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack, router } from "expo-router"; // Import `router` for navigation
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";

import "react-native-reanimated";

import { useColorScheme } from "@/hooks/useColorScheme";
import { Session } from "@supabase/supabase-js";
import { supabase } from "./lib/supabase";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

//  SUPABASE PART
// export default function RootLayout() {
//   const [session, setSession] = useState<Session | null | undefined>(undefined);
//   const colorScheme = useColorScheme();
//   const [loaded] = useFonts({
//     SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
//   });

//   // To handle safe navigation after mounting
//   const [isMounted, setIsMounted] = useState(false);

//   // Fetch the session and listen to changes
//   useEffect(() => {
//     const fetchSession = async () => {
//       const { data } = await supabase.auth.getSession();
//       setSession(data.session);
//     };

//     fetchSession();

//     const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
//       setSession(session);
//     });

//     return () => {
//       listener.subscription.unsubscribe();
//     };
//   }, []);

//   // Set mounted state to true after layout is mounted
//   useEffect(() => {
//     if (loaded) {
//       SplashScreen.hideAsync();
//       setIsMounted(true); // Ensure navigation happens after mounting
//     }
//   }, [loaded]);

//   // Safe navigation after layout mount
//   useEffect(() => {
//     if (isMounted && session !== undefined) {
//       if (session === null) {
//         router.replace("/auth"); // Redirect to login screen
//       } else {
//         router.replace("/(tabs)"); // Redirect to tabs screen
//       }
//     }
//   }, [isMounted, session]);

//   if (!loaded || session === undefined) {
//     return (
//       <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
//         <ActivityIndicator size="large" />
//       </View>
//     ); // Show loading spinner until session is checked
//   }

//   return (
//     <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
//       <Stack>
//         <Stack.Screen name="auth" options={{ headerShown: false }} />
//         <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
//         <Stack.Screen name="+not-found" />
//       </Stack>
//       <StatusBar style="auto" />
//     </ThemeProvider>
//   );
// }


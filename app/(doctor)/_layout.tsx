import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { Drawer } from "expo-router/drawer";
import { useRouter, usePathname } from "expo-router";
import { useAuth } from "../../hooks/useAuth";
import { Feather } from "@expo/vector-icons";

// --- Light Theme Colors ---
const DRAWER_BG = "#f7f9fc";
const TEXT_COLOR = "#1d2b3e";
const MUTED_COLOR = "#6a788e";
const ACTIVE_BG = "#eaf4ff";
const ACTIVE_TINT = "#0b6efd";
const BORDER_COLOR = "#e1e6f0";

const menuItems = [
  { label: "Dashboard", route: "/(doctor)/", icon: "home" },
  { label: "Schedule", route: "/(doctor)/schedule", icon: "calendar" },
  { label: "Patient Queue", route: "/(doctor)/queue", icon: "users" },
  { label: "Messages", route: "/(doctor)/messages", icon: "message-square" },
  { label: "My Patients", route: "/(doctor)/patients", icon: "clipboard" },
  { label: "Profile", route: "/(doctor)/profile", icon: "user" },
  { label: "Logout", route: "/login", icon: "log-out" },
];

  function CustomDrawerContent(props: any) {
  const router = useRouter();
  const pathname = usePathname();
  const { signOut } = useAuth();

  return (
    <SafeAreaView style={styles.drawerContainer}>
      <View style={styles.drawerHeader}>
        <Text style={styles.drawerTitle}>Doctor Portal</Text>
      </View>

      {/* Search removed per UX request - kept drawer compact */}

      <ScrollView style={styles.drawerMenu}>
        {menuItems.map((item) => {
          const isActive = pathname === item.route;
          return (
            <TouchableOpacity
              key={item.label}
              style={[styles.drawerItem, isActive && styles.drawerItemActive]}
              onPress={async () => {
                props.navigation.closeDrawer();
                if (item.route === '/login') {
                  try { await signOut(); } catch (e) {}
                  router.replace('/login');
                } else {
                  router.push(item.route as any);
                }
              }}
            >
              <Feather name={item.icon as any} size={20} color={isActive ? ACTIVE_TINT : MUTED_COLOR} />
              <Text style={[styles.drawerLabel, isActive && { color: ACTIVE_TINT }]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

export default function DoctorLayout() {
  return (
    <Drawer
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        drawerStyle: { width: "80%", backgroundColor: DRAWER_BG },
        drawerType: "front",
        headerShown: true,
        headerStyle: { backgroundColor: "#fff", elevation: 0, shadowOpacity: 0 },
        headerTitleStyle: { fontWeight: "bold" },
        headerRight: () => (
            <TouchableOpacity onPress={() => {}} style={{ marginRight: 15 }}>
                <Feather name="bell" size={22} color="#1d2b3e" />
            </TouchableOpacity>
        )
      }}
    >
      <Drawer.Screen name="index" options={{ title: "Dashboard" }} />
      <Drawer.Screen name="profile" options={{ title: "Profile" }} />
      <Drawer.Screen name="schedule" options={{ title: "Schedule" }} />
      <Drawer.Screen name="queue" options={{ title: "Patient Queue" }} />
      <Drawer.Screen name="patients" options={{ title: "My Patients" }} />
      <Drawer.Screen name="messages" options={{ title: "Messages" }} />
      <Drawer.Screen name="availability" options={{ title: "Availability" }} />
    </Drawer>
  );
}

const styles = StyleSheet.create({
  drawerContainer: { flex: 1, backgroundColor: DRAWER_BG },
  drawerHeader: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 10 },
  drawerTitle: { color: TEXT_COLOR, fontSize: 22, fontWeight: "bold" },
  // searchSection removed
  drawerMenu: { marginTop: 10 },
  drawerItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginHorizontal: 10,
    borderRadius: 10,
  },
  drawerItemActive: { backgroundColor: ACTIVE_BG },
  drawerLabel: { marginLeft: 20, color: TEXT_COLOR, fontSize: 16, fontWeight: "500" },
});

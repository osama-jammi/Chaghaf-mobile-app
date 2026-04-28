import React from 'react';
import { View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { COLORS, RADIUS } from '../constants/colors';
import { useAuth } from '../context/AuthContext';
import { LoadingScreen } from '../components';

// ── Auth screens ──────────────────────────────────────────────────
import { SplashScreen, OnboardingScreen, LoginScreen, RegisterScreen } from '../screens/auth/AuthScreens';

// ── Home screens ──────────────────────────────────────────────────
import { HomeScreen, QRCodeScreen, AccesJourneeScreen } from '../screens/home/HomeScreens';
import { NotificationsScreen } from '../screens/home/NotificationsScreen';

// ── Subscription ──────────────────────────────────────────────────
import { AbonnementScreen, ChoixDureeScreen, RenouvellementScreen } from '../screens/subscription/SubscriptionScreens';

// ── Reservation ───────────────────────────────────────────────────
import { ChoixSalleScreen, DateDureeScreen, ConfirmationReservationScreen } from '../screens/reservation/ReservationScreens';

// ── Boissons ──────────────────────────────────────────────────────
import { ValidationBoissonScreen, ChoixBoissonScreen, GuideMachineScreen, ConfirmationBoissonScreen } from '../screens/boissons/BoissonScreens';

// ── Snacks ────────────────────────────────────────────────────────
import { MenuSnacksScreen, PanierScreen, SuiviCommandeScreen } from '../screens/snacks/SnacksScreens';

// ── Social ────────────────────────────────────────────────────────
import { PostsScreen, CreerPostScreen, MessagesScreen, ConversationScreen } from '../screens/social/SocialScreens';

// ── Profile ───────────────────────────────────────────────────────
import { ProfilScreen } from '../screens/profile/ProfilScreen';

const Stack = createStackNavigator();
const Tab   = createBottomTabNavigator();

const noHeader = { headerShown: false };

// ══════════════════════════════════════════════════════════════════
// Stacks
// ══════════════════════════════════════════════════════════════════
function HomeStack() {
  return (
    <Stack.Navigator screenOptions={noHeader}>
      <Stack.Screen name="Home"          component={HomeScreen} />
      <Stack.Screen name="QRCode"        component={QRCodeScreen} />
      <Stack.Screen name="AccesJournee"  component={AccesJourneeScreen} />
      <Stack.Screen name="Abonnement"    component={AbonnementScreen} />
      <Stack.Screen name="ChoixDuree"    component={ChoixDureeScreen} />
      <Stack.Screen name="Renouvellement" component={RenouvellementScreen} />
      <Stack.Screen name="Profile"       component={ProfilScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
    </Stack.Navigator>
  );
}

function ReservationStack() {
  return (
    <Stack.Navigator screenOptions={noHeader}>
      <Stack.Screen name="ChoixSalle"              component={ChoixSalleScreen} />
      <Stack.Screen name="DateDuree"               component={DateDureeScreen} />
      <Stack.Screen name="ConfirmationReservation" component={ConfirmationReservationScreen} />
    </Stack.Navigator>
  );
}

function BoissonStack() {
  return (
    <Stack.Navigator screenOptions={noHeader}>
      <Stack.Screen name="ValidationBoisson"  component={ValidationBoissonScreen} />
      <Stack.Screen name="ChoixBoisson"       component={ChoixBoissonScreen} />
      <Stack.Screen name="ConfirmationBoisson" component={ConfirmationBoissonScreen} />
      <Stack.Screen name="GuideMachine"       component={GuideMachineScreen} />
    </Stack.Navigator>
  );
}

function SnacksStack() {
  return (
    <Stack.Navigator screenOptions={noHeader}>
      <Stack.Screen name="MenuSnacks"   component={MenuSnacksScreen} />
      <Stack.Screen name="Panier"       component={PanierScreen} />
      <Stack.Screen name="SuiviCommande" component={SuiviCommandeScreen} />
    </Stack.Navigator>
  );
}

function SocialStack() {
  return (
    <Stack.Navigator screenOptions={noHeader}>
      <Stack.Screen name="Posts"       component={PostsScreen} />
      <Stack.Screen name="CreerPost"   component={CreerPostScreen} />
      <Stack.Screen name="Messages"    component={MessagesScreen} />
      <Stack.Screen name="Conversation" component={ConversationScreen} />
    </Stack.Navigator>
  );
}

// ══════════════════════════════════════════════════════════════════
// Bottom tab navigator
// ══════════════════════════════════════════════════════════════════
const TABS = [
  { name: 'HomeTab',     stack: HomeStack,        icon: 'home',               label: 'Accueil' },
  { name: 'Reservation', stack: ReservationStack, icon: 'calendar',           label: 'Réserver' },
  { name: 'Boissons',    stack: BoissonStack,     icon: 'cafe',               label: 'Boissons' },
  { name: 'Snacks',      stack: SnacksStack,      icon: 'restaurant',         label: 'Snacks'  },
  { name: 'Social',      stack: SocialStack,      icon: 'chatbubble-ellipses', label: 'Social'  },
];

function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => {
        const tab = TABS.find(t => t.name === route.name);
        return {
          headerShown: false,
          tabBarIcon: ({ focused, size }) => (
            <Ionicons
              name={focused ? tab.icon : `${tab.icon}-outline`}
              size={22}
              color={focused ? COLORS.primary : COLORS.gray500}
            />
          ),
          tabBarLabel: tab.label,
          tabBarActiveTintColor:   COLORS.primary,
          tabBarInactiveTintColor: COLORS.gray500,
          tabBarLabelStyle:        { fontSize: 10, fontWeight: '600', marginBottom: 4 },
          tabBarStyle: {
            backgroundColor: COLORS.surface,
            borderTopWidth: 1,
            borderTopColor: COLORS.border,
            height: 60,
            paddingTop: 6,
          },
        };
      }}
    >
      {TABS.map(t => (
        <Tab.Screen key={t.name} name={t.name} component={t.stack} />
      ))}
    </Tab.Navigator>
  );
}

// ══════════════════════════════════════════════════════════════════
// Root navigator — auth guard
// ══════════════════════════════════════════════════════════════════
export function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) return <LoadingScreen />;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={noHeader}>
        {user ? (
          <Stack.Screen name="Main" component={MainTabNavigator} />
        ) : (
          <>
            <Stack.Screen name="Splash"      component={SplashScreen} />
            <Stack.Screen name="Onboarding"  component={OnboardingScreen} />
            <Stack.Screen name="Login"       component={LoginScreen} />
            <Stack.Screen name="Register"    component={RegisterScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
/**
 * Navigation principale
 */

import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import WelcomeScreen from '../screens/WelcomeScreen';
import HomeScreen from '../screens/HomeScreen';
import RecordingScreen from '../screens/RecordingScreen';
import ActivityDetailScreen from '../screens/ActivityDetailScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { COLORS, FONT_SIZES } from '../constants/theme';

const WELCOME_KEY = 'strive_welcome_seen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function HomeStack() {
  const { user } = useAuth();
  if (!user) return null;
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeList">
        {({ navigation }) => (
          <HomeScreen
            userId={user.id}
            onNavigateToDetail={(id) =>
              navigation.navigate('ActivityDetail', { activityId: id })
            }
            onNavigateToRecord={() => navigation.navigate('Recording')}
          />
        )}
      </Stack.Screen>
      <Stack.Screen
        name="ActivityDetail"
        initialParams={{ activityId: '' }}
        options={{
          headerShown: true,
          headerTitle: 'Détail activité',
          headerStyle: { backgroundColor: COLORS.background },
          headerTintColor: COLORS.text,
        }}
      >
        {({ route }) => (
          <ActivityDetailScreen
            activityId={(route.params as { activityId: string })?.activityId ?? ''}
            userId={user.id}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="Recording">
        {({ navigation }) => (
          <RecordingScreen userId={user.id} onStop={() => navigation.goBack()} />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
}

function MainTabs() {
  const { user, updateProfile, logout } = useAuth();
  if (!user) return null;
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopColor: COLORS.border,
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarLabelStyle: { fontSize: FONT_SIZES.xs },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStack}
        options={{ title: 'Accueil', tabBarIcon: () => <Text>🏠</Text> }}
      />
      <Tab.Screen
        name="ProfileTab"
        options={{ title: 'Profil', tabBarIcon: () => <Text>👤</Text> }}
      >
        {() => (
          <ProfileScreen
            userName={user.name}
            userEmail={user.email}
            onUpdateProfile={updateProfile}
            onLogout={logout}
          />
        )}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { user, isLoading, login, signup } = useAuth();
  const [welcomeSeen, setWelcomeSeen] = useState<boolean | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(WELCOME_KEY).then((v) =>
      setWelcomeSeen(v === 'true')
    );
  }, []);

  const markWelcomeSeen = () => {
    AsyncStorage.setItem(WELCOME_KEY, 'true');
    setWelcomeSeen(true);
  };

  if (isLoading || welcomeSeen === null) {
    return null;
  }

  if (!welcomeSeen) {
    return (
      <NavigationContainer>
        <WelcomeScreen onContinue={markWelcomeSeen} />
      </NavigationContainer>
    );
  }

  if (!user) {
    return (
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login">
            {({ navigation }) => (
              <LoginScreen
                onLogin={login}
                onNavigateToSignup={() => navigation.navigate('Signup')}
              />
            )}
          </Stack.Screen>
          <Stack.Screen name="Signup">
            {({ navigation }) => (
              <SignupScreen
                onSignup={signup}
                onNavigateToLogin={() => navigation.goBack()}
              />
            )}
          </Stack.Screen>
        </Stack.Navigator>
      </NavigationContainer>
    );
  }

  return (
    <NavigationContainer>
      <MainTabs />
    </NavigationContainer>
  );
}

/**
 * Notification Service - Local notifications for activity milestones
 */

import * as Notifications from 'expo-notifications';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function requestNotificationPermission(): Promise<boolean> {
  try {
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  } catch (e) {
    console.warn('Notification permission error:', e);
    return false;
  }
}

export async function sendDistanceMilestoneNotification(
  distance: number,
  milestone: number
): Promise<void> {
  try {
    const km = Math.round(distance / 1000);
    if (km > 0 && km % milestone === 0) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🎉 Milestone atteint!',
          body: `Vous avez parcouru ${km} km! Continuez comme ça!`,
          sound: 'default',
        },
        trigger: null, // Show immediately
      });
    }
  } catch (e) {
    console.warn('Failed to send distance milestone notification:', e);
  }
}

export async function sendDurationMilestoneNotification(
  duration: number,
  milestone: number
): Promise<void> {
  try {
    const minutes = Math.floor(duration / 60);
    if (minutes > 0 && minutes % milestone === 0) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '⏱️ Durée atteinte',
          body: `${minutes} minutes d'activité! Vous êtes en forme!`,
          sound: 'default',
        },
        trigger: null, // Show immediately
      });
    }
  } catch (e) {
    console.warn('Failed to send duration milestone notification:', e);
  }
}

export async function sendActivityCompletedNotification(
  activityType: string,
  distance: number,
  duration: number
): Promise<void> {
  try {
    const km = (distance / 1000).toFixed(2);
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '✅ Activité enregistrée',
        body: `${activityType}: ${km}km en ${minutes}m${seconds}s`,
        sound: 'default',
      },
      trigger: null, // Show immediately
    });
  } catch (e) {
    console.warn('Failed to send activity completed notification:', e);
  }
}

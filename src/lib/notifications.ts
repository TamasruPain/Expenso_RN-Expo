import { scheduleNotificationAsync } from "expo-notifications/build/scheduleNotificationAsync";
import { cancelAllScheduledNotificationsAsync } from "expo-notifications/build/cancelAllScheduledNotificationsAsync";
import { getPermissionsAsync, requestPermissionsAsync } from "expo-notifications/build/NotificationPermissions";
import { setNotificationHandler } from "expo-notifications/build/NotificationsHandler";
import { addNotificationResponseReceivedListener } from "expo-notifications/build/NotificationsEmitter";
import { setNotificationChannelAsync } from "expo-notifications/build/setNotificationChannelAsync";
import { AndroidImportance } from "expo-notifications/build/NotificationChannelManager.types";
import { AndroidNotificationPriority } from "expo-notifications/build/Notifications.types";
import { Platform } from "react-native";

// Configure how notifications are displayed when the app is in the foreground
setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Request notification permissions from the OS.
 * On Android, also registers the default notification channel.
 */
export async function requestPermissions(): Promise<boolean> {
  if (Platform.OS === "web") return false;

  try {
    const existing = (await getPermissionsAsync()) as any;
    let finalGranted = existing.granted;

    if (!existing.granted) {
      const requested = (await requestPermissionsAsync()) as any;
      finalGranted = requested.granted;
    }

    if (!finalGranted) {
      return false;
    }

    // Android-specific channel configurations
    if (Platform.OS === "android") {
      try {
        await setNotificationChannelAsync("default", {
          name: "default",
          importance: AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#7C5CFC",
        });
      } catch (channelError) {
        console.warn("Failed to set Android notification channel (expected in Expo Go):", channelError);
      }
    }

    return true;
  } catch (error) {
    console.error("Error requesting notification permissions:", error);
    return false;
  }
}

/**
 * Schedule a recurring daily reminder.
 * @param timeStr Time format string: "HH:MM" (24h)
 */
export async function scheduleDailyReminder(timeStr: string) {
  if (Platform.OS === "web") return;

  // Clear existing scheduled notifications to prevent duplicate stacking
  await cancelAllNotifications();

  const [hoursStr, minutesStr] = timeStr.split(":");
  const hours = parseInt(hoursStr, 10);
  const minutes = parseInt(minutesStr, 10);

  if (isNaN(hours) || isNaN(minutes)) {
    console.error("Invalid daily reminder time format:", timeStr);
    return;
  }

  try {
    await scheduleNotificationAsync({
      content: {
        title: "Daily Log Reminder 📝",
        body: "Don't forget to log your daily expenses to keep your streak alive!",
        sound: true,
        priority: AndroidNotificationPriority.HIGH,
      },
      trigger: Platform.select({
        ios: {
          type: "calendar",
          hour: hours,
          minute: minutes,
          repeats: true,
        },
        default: {
          type: "daily",
          hour: hours,
          minute: minutes,
        },
      }) as any,
    });
  } catch (error) {
    console.error("Error scheduling daily reminder:", error);
  }
}

/**
 * Cancel all currently scheduled notifications.
 */
export async function cancelAllNotifications() {
  if (Platform.OS === "web") return;
  try {
    await cancelAllScheduledNotificationsAsync();
  } catch (error) {
    console.error("Error cancelling scheduled notifications:", error);
  }
}

/**
 * Instantly display a local notification to the user.
 */
export async function sendImmediateNotification(title: string, body: string) {
  if (Platform.OS === "web") return;
  try {
    await scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: true,
        priority: AndroidNotificationPriority.HIGH,
      },
      trigger: null, // Send immediately
    });
  } catch (error) {
    console.error("Error triggering immediate local notification:", error);
  }
}

/**
 * Registers a callback for notification clicks.
 * Returns an object with a remove() function to clear the listener.
 */
export function addNotificationClickResponseListener(callback: (response: any) => void) {
  if (Platform.OS === "web") {
    return { remove: () => {} };
  }

  const subscription = addNotificationResponseReceivedListener(callback);
  return {
    remove: () => {
      subscription.remove();
    },
  };
}

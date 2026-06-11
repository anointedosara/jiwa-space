import { getCollection } from "./store";

export type NotificationIcon = "discount" | "star" | "chat" | "heart";

/**
 * Record a notification for a user. Notifications are per-user: a new account
 * starts with an empty list and accrues entries as the person logs in and uses
 * the app. Failures here must never break the action that triggered them.
 */
export async function notify(
  userId: string,
  icon: NotificationIcon,
  title: string,
  body: string
): Promise<void> {
  try {
    const col = await getCollection("notifications");
    await col.insertOne({
      userId: String(userId),
      icon,
      title,
      body,
      read: false,
      createdAt: new Date().toISOString(),
    });
  } catch {
    /* notifications are best-effort */
  }
}

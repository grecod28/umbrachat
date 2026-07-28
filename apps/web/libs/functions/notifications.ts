let permission: NotificationPermission = "default";

export async function requestPermission(): Promise<NotificationPermission> {
  if (!("Notification" in window)) return "denied";
  if (permission !== "default") return permission;
  permission = await Notification.requestPermission();
  return permission;
}

export function notifyMessage(
  roomId: string,
  roomName: string,
  content: string,
) {
  if (!("Notification" in window)) return;
  if (Notification.permission !== "granted") return;
  if (!document.hidden) return;

  const name = roomName || "UmbraChat";
  const body = content.length > 120 ? content.slice(0, 120) + "..." : content;

  const notification = new Notification(name, {
    body,
    icon: "/favicon.ico",
    tag: roomId,
  });

  notification.onclick = () => {
    window.focus();
    const locale = window.location.pathname.split("/")[1];
    window.location.href = `/${locale}/chat/${roomId}`;
    notification.close();
  };
}

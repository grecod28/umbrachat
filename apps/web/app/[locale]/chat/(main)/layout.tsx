import { ChatSidebar } from "./[id]/_views/chat-sidebar";
import { DesktopOnly } from "@/components/ui/desktop-only";

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen flex">
      <DesktopOnly>
        <ChatSidebar />
      </DesktopOnly>

      {children}
    </div>
  );
}

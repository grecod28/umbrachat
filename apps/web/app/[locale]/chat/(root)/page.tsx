"use client";

export default function ChatListPage() {
  const storedChats = JSON.parse(localStorage.getItem("rooms") || "[]");
  console.log(storedChats);

  return (
    <main>
      <section>
        <header>
          <h1 className="text-primary"></h1>
          <p className="text-text-muted"></p>
        </header>
      </section>
    </main>
  );
}

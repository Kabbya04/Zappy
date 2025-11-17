
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import ChatComponent from "./chat-component";

export default async function ChatSessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/auth/signin");
  }

  // Get session details including recommendations
  const { data: session } = await supabase
    .from("sessions")
    .select("category, recommendations")
    .eq("id", id)
    .single();

  if (!session) {
    return redirect("/profile");
  }

  // Get messages for this session
  const { data: messages, error } = await supabase
    .from("messages")
    .select("id, content, created_at, role")
    .eq("session_id", id)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching messages:", error);
  } else {
    console.log(`Fetched ${messages?.length || 0} messages for session ${id}`);
    console.log("Messages data:", messages);
  }

  // Get session count to check if limit is reached
  const { count } = await supabase
    .from('messages')
    .select('*', { count: 'exact', head: true })
    .eq('session_id', id)
    .eq('role', 'user');

  const queryLimitReached = (count || 0) >= 10;

  // Render chat component directly instead of redirecting
  return (
    <ChatComponent
      sessionId={id}
      category={session.category}
      messages={messages || []}
      queryLimitReached={queryLimitReached}
      userId={user.id}
      recommendations={session.recommendations || []}
    />
  );
}
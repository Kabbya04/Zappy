
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";

interface Session {
  id: string;
  created_at: string;
  category: string;
  summary: string;
}

export default async function Profile() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/auth/signin");
  }

  const { data: sessions, error } = await supabase
    .from("sessions")
    .select("id, created_at, category, summary")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching sessions:", error);
    // Handle error appropriately
  }

  return (
    <div className="flex-1 w-full max-w-4xl mx-auto py-12 md:py-16 lg:py-20">
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold">Welcome, {user.email}</h1>
            <p className="text-gray-500 dark:text-gray-400">
              View your past sessions and recommendations.
            </p>
          </div>
        </div>
        <Separator />
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Session History</h2>
          <div className="grid gap-6">
            {sessions && sessions.length > 0 ? (
              sessions.map((session: Session) => (
                <div
                  key={session.id}
                  className="bg-white dark:bg-gray-950 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="p-6 grid gap-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="font-semibold">{session.category}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(session.created_at).toLocaleString()}
                        </div>
                      </div>
                      <Link
                        href={`/chat/${session.id}`}
                        className={buttonVariants({ variant: "outline" })}
                        prefetch={false}
                      >
                        View
                      </Link>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400">
                      {session.summary}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p>No sessions found.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
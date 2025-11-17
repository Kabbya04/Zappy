
"use client";

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/hooks/use-auth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { ChevronsUpDown } from 'lucide-react';

interface Session {
  id: string;
  category: string;
  created_at: string;
}

interface SessionSwitcherProps {
  onSessionSelect: (sessionId: string) => void;
}

export function SessionSwitcher({ onSessionSelect }: SessionSwitcherProps) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [currentUser, setCurrentUser] = useState<{ id: string } | null>(null);
  const supabase = createClient();
  const { getUser } = useAuth();

  useEffect(() => {
    const fetchUser = async () => {
      const user = await getUser();
      setCurrentUser(user);
    };
    fetchUser();
  }, [getUser]);

  useEffect(() => {
    const fetchSessions = async () => {
      if (!currentUser) return;

      const { data, error } = await supabase
        .from('sessions')
        .select('id, category, created_at')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching sessions:', error);
        return;
      }

      if (data) {
        setSessions(data);
        if (data.length > 0) {
          setSelectedSession(data[0]);
        }
      }
    };

    fetchSessions();
  }, [currentUser, supabase]);

  const handleSelect = (session: Session) => {
    setSelectedSession(session);
    onSessionSelect(session.id);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-full justify-between">
          {selectedSession ? (
            <>
              <span>{selectedSession.category}</span>
              <span className="text-xs text-muted-foreground">
                {new Date(selectedSession.created_at).toLocaleDateString()}
              </span>
            </>
          ) : (
            'Select a session'
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-full">
        <DropdownMenuLabel>Recent Sessions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {sessions.map((session) => (
          <DropdownMenuItem key={session.id} onClick={() => handleSelect(session)}>
            <div className="flex justify-between w-full">
              <span>{session.category}</span>
              <span className="text-xs text-muted-foreground">
                {new Date(session.created_at).toLocaleDateString()}
              </span>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
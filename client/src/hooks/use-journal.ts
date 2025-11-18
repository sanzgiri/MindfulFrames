import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { JournalEntry, InsertJournalEntry } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

export function useJournal(pauseId?: number) {
  const queryClient = useQueryClient();

  const queryKey = pauseId ? ["/api/journal", pauseId] : ["/api/journal"];
  const endpoint = pauseId ? `/api/journal?pauseId=${pauseId}` : "/api/journal";

  const { data: entries = [], isLoading } = useQuery<JournalEntry[]>({
    queryKey,
    queryFn: async () => {
      const response = await fetch(endpoint, { credentials: "include" });
      if (!response.ok) throw new Error("Failed to fetch journal entries");
      return response.json();
    },
  });

  const createEntryMutation = useMutation({
    mutationFn: async (entry: Omit<InsertJournalEntry, "userId">) => {
      return await apiRequest("POST", "/api/journal", entry);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/journal"] });
    },
  });

  const updateEntryMutation = useMutation({
    mutationFn: async ({ id, content }: { id: number; content: string }) => {
      return await apiRequest("PUT", `/api/journal/${id}`, { content });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/journal"] });
    },
  });

  const createEntry = async (entry: Omit<InsertJournalEntry, "userId">) => {
    await createEntryMutation.mutateAsync(entry);
  };

  const updateEntry = async (id: number, content: string) => {
    await updateEntryMutation.mutateAsync({ id, content });
  };

  return {
    entries,
    isLoading,
    createEntry,
    updateEntry,
    isCreating: createEntryMutation.isPending,
    isUpdating: updateEntryMutation.isPending,
  };
}

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { UserProgress } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

export function useProgress() {
  const queryClient = useQueryClient();

  const { data: progress = [], isLoading } = useQuery<UserProgress[]>({
    queryKey: ["/api/user/progress"],
  });

  const updateProgressMutation = useMutation({
    mutationFn: async ({ activityId, completed }: { activityId: number; completed: boolean }) => {
      return await apiRequest("PUT", "/api/user/progress", { activityId, completed });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/progress"] });
    },
  });

  const toggleActivity = async (activityId: number, completed: boolean) => {
    await updateProgressMutation.mutateAsync({ activityId, completed });
  };

  const isActivityCompleted = (activityId: number): boolean => {
    const item = progress.find((p) => p.activityId === activityId);
    return item?.completed ?? false;
  };

  const getCompletedCount = (activityIds: number[]): number => {
    return progress.filter((p) => activityIds.includes(p.activityId!) && p.completed).length;
  };

  return {
    progress,
    isLoading,
    toggleActivity,
    isActivityCompleted,
    getCompletedCount,
    isUpdating: updateProgressMutation.isPending,
  };
}

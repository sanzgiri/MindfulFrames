import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Photo, InsertPhoto } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

export function usePhotos(pauseId?: number) {
  const queryClient = useQueryClient();

  const queryKey = pauseId ? ["/api/photos", pauseId] : ["/api/photos"];
  const endpoint = pauseId ? `/api/photos?pauseId=${pauseId}` : "/api/photos";

  const { data: photos = [], isLoading } = useQuery<Photo[]>({
    queryKey,
    queryFn: async () => {
      const response = await fetch(endpoint, { credentials: "include" });
      if (!response.ok) throw new Error("Failed to fetch photos");
      return response.json();
    },
  });

  const uploadPhotoMutation = useMutation({
    mutationFn: async (file: File) => {
      const uploadUrlResponse = await apiRequest("POST", "/api/objects/upload");
      const { uploadURL } = await uploadUrlResponse.json();

      await fetch(uploadURL, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });

      return uploadURL;
    },
  });

  const createPhotoMutation = useMutation({
    mutationFn: async (photo: Omit<InsertPhoto, "userId">) => {
      return await apiRequest("POST", "/api/photos", photo);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/photos"] });
    },
  });

  const deletePhotoMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("DELETE", `/api/photos/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/photos"] });
    },
  });

  const uploadAndCreatePhoto = async (
    file: File,
    pauseId: number,
    activityId?: number,
    caption?: string
  ) => {
    const uploadURL = await uploadPhotoMutation.mutateAsync(file);

    await createPhotoMutation.mutateAsync({
      objectPath: uploadURL,
      pauseId,
      activityId: activityId ?? null,
      caption: caption ?? null,
    });
  };

  const deletePhoto = async (id: number) => {
    await deletePhotoMutation.mutateAsync(id);
  };

  return {
    photos,
    isLoading,
    uploadAndCreatePhoto,
    deletePhoto,
    isUploading: uploadPhotoMutation.isPending || createPhotoMutation.isPending,
    isDeleting: deletePhotoMutation.isPending,
  };
}

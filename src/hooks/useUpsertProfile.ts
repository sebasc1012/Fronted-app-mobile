import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { Gender } from "../../types/genders";


type ProfileInput = {
  fullName?: string;
  gender?: Gender;
  country?: string;
  phone?: string;
  avatarUrl?: string;
  notificationsEnabled?: boolean;
};

export function useUpsertProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: ProfileInput) => api.post("/users/profile", input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}

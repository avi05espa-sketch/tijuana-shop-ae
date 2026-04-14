import { useActor, useInternetIdentity } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createActor } from "../backend";
import type { Notification } from "../backend";

function useActorInstance() {
  return useActor(createActor);
}

export function useMyNotifications() {
  const { actor, isFetching } = useActorInstance();
  const { identity } = useInternetIdentity();

  return useQuery<Notification[]>({
    queryKey: ["myNotifications"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyNotifications();
    },
    enabled: !!actor && !isFetching && !!identity,
    refetchInterval: 30_000,
    staleTime: 15_000,
  });
}

export function useUnreadNotificationCount() {
  const { actor, isFetching } = useActorInstance();
  const { identity } = useInternetIdentity();

  return useQuery<bigint>({
    queryKey: ["unreadNotificationCount"],
    queryFn: async () => {
      if (!actor) return BigInt(0);
      return actor.getUnreadNotificationCount();
    },
    enabled: !!actor && !isFetching && !!identity,
    refetchInterval: 30_000,
  });
}

export function useMarkNotificationRead() {
  const { actor } = useActorInstance();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      if (!actor) throw new Error("No autenticado");
      return actor.markNotificationRead(notificationId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myNotifications"] });
      queryClient.invalidateQueries({ queryKey: ["unreadNotificationCount"] });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const { actor } = useActorInstance();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("No autenticado");
      return actor.markAllNotificationsRead();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myNotifications"] });
      queryClient.invalidateQueries({ queryKey: ["unreadNotificationCount"] });
    },
  });
}

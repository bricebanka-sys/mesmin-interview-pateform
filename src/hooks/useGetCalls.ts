import { useEffect, useMemo, useState } from "react";
import type { Call } from "@stream-io/video-react-sdk";
import { useStreamVideoClient } from "@stream-io/video-react-sdk";
import { useUser } from "@clerk/nextjs";

export const useGetCalls = () => {
  const [calls, setCalls] = useState<Call[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const client = useStreamVideoClient();
  const { user, isLoaded } = useUser();

  useEffect(() => {
    let isCancelled = false;

    const loadCalls = async () => {
      // le hook doit attendre que Clerk soit prêt
      if (!isLoaded) return;

      // si l'utilisateur n'est plus connecté => stop proprement
      if (!user?.id || !client) {
        if (!isCancelled) {
          setCalls([]);
          setIsLoading(false);
        }
        return;
      }

      try {
        setIsLoading(true);

        const { calls: fetchedCalls } = await client.queryCalls({
          sort: [{ field: "starts_at", direction: -1 }],
          filter_conditions: {
            $or: [
              { created_by_user_id: user.id },
              { members: { $in: [user.id] } },
            ],
          },
        });

        if (!isCancelled) {
          setCalls(Array.isArray(fetchedCalls) ? fetchedCalls : []);
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des appels :", error);
        if (!isCancelled) {
          setCalls([]);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    loadCalls();

    return () => {
      isCancelled = true;
    };
  }, [client, user?.id, isLoaded]);




  type MaybeCallState = {
    startsAt?: string | number | Date | null;
    endedAt?: string | number | Date | null;
  };


  // helper pour normaliser une valeur de date (string | number | Date | null) => Date | undefined
  function parseMaybeDate(value?: string | number | Date | null): Date | undefined {
    if (value == null) return undefined;
    if (value instanceof Date) return value;
    if (typeof value === "number" && Number.isFinite(value)) return new Date(value);
    if (typeof value === "string" && value.trim() !== "") {
      const d = new Date(value);
      if (!Number.isNaN(d.getTime())) return d;
    }
    return undefined;
  }



  const now = useMemo(() => new Date(), []);


  // endedCalls
  const endedCalls = useMemo(() => {
    return calls.filter((call) => {
      const state = (call.state ?? {}) as MaybeCallState;
      const startsAt = parseMaybeDate(state.startsAt);
      const endedAt = parseMaybeDate(state.endedAt);

      // Un appel est terminé si endedAt existe OU si startsAt est dans le passé
      if (endedAt) return true;
      if (startsAt && startsAt < now) return true;
      return false;
    });
  }, [calls, now]);

  // upcomingCalls
  const upcomingCalls = useMemo(() => {
    return calls.filter((call) => {
      const state = (call.state ?? {}) as MaybeCallState;
      const startsAt = parseMaybeDate(state.startsAt);
      if (!startsAt) return false;
      return startsAt > now;
    });
  }, [calls, now]);


  // liveCalls
  const liveCalls = useMemo(() => {
    return calls.filter((call) => {
      const state = (call.state ?? {}) as MaybeCallState;
      const startsAt = parseMaybeDate(state.startsAt);
      const endedAt = parseMaybeDate(state.endedAt);
      if (!startsAt) return false;
      return startsAt <= now && !endedAt;
    });
  }, [calls, now]);

  return {
    calls,
    endedCalls,
    upcomingCalls,
    liveCalls,
    isLoading,
  };
};

export default useGetCalls;
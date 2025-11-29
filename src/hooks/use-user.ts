import { useSession } from "@/lib/auth-client";

const useUser = () => {
  const { data, isRefetching: isLoading, error } = useSession();

  return {
    user: data?.user || null,
    session: data?.session || null,
    isLoading,
    isAuthenticated: !!data?.user,
    error,
  };
};

export default useUser;

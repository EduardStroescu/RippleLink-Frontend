import userApi from "@/api/modules/user.api";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "./ui/use-toast";
import { useUserStoreActions } from "@/stores/useUserStore";
import { useRouter, useRouterState } from "@tanstack/react-router";
import { useLocalStorage } from "@/lib/hooks/useLocalStorage";
import { User } from "@/types/user";

const users = ["One", "Two", "Three"];

export function DemoAccountLoginPanel() {
  const { setUser } = useUserStoreActions();
  const { setItem } = useLocalStorage<User>("user");
  const router = useRouter();
  const { toast } = useToast();
  const redirectUrl = useRouterState({
    select: (state) => state.location.search.redirect,
  });

  const loginMutation = useMutation({
    mutationFn: (formData: { email: string; password: string }) =>
      userApi.login(formData),
  });

  const handleUserClick = (userName: string) => {
    const email = import.meta.env[
      `VITE_DEMO_ACC_${userName.toUpperCase()}_EMAIL`
    ];
    const password = import.meta.env[
      `VITE_DEMO_ACC_${userName.toUpperCase()}_PASSWORD`
    ];

    loginMutation.mutateAsync(
      { email, password },
      {
        onSuccess: (response) => {
          setItem(response);
          setUser(response);
          router.history.push(redirectUrl ? redirectUrl : "/chat");
        },
        onError: (error: unknown) => {
          toast({
            variant: "destructive",
            title: "Error",
            description: error as string,
          });
        },
      }
    );
  };

  return (
    <div className="shadow-xl shadow-cyan-500/50 border-[1px] border-slate-600 flex flex-col gap-4 bg-cyan-900/60 px-4 py-4 rounded-lg w-auto">
      <h3 className="text-center">- Demo Accounts -</h3>
      <div className="flex gap-2 flex-wrap justify-center">
        {users.map((userName) => (
          <button
            key={userName}
            onClick={() => handleUserClick(userName)}
            className="min-w-[93px] shadow-lg shadow-cyan-500/50 text-neutral-300 hover:text-white bg-neutral-950 hover:bg-neutral-900 rounded px-2 py-2 text-md"
          >
            User {userName}
          </button>
        ))}
      </div>
    </div>
  );
}

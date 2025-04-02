import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useRouter, useRouterState } from "@tanstack/react-router";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";

import { userApi } from "@/api/modules/user.api";
import { toast } from "@/components/ui/use-toast";
import { LoginSchema } from "@/lib/zodSchemas/auth.schemas";
import { useUserStoreActions } from "@/stores/useUserStore";

export function LoginForm() {
  const { setUser } = useUserStoreActions();
  const router = useRouter();
  const redirectUrl = useRouterState({
    select: (state) => state.location.search.redirect,
  });
  const queryClient = useQueryClient();

  const { mutateAsync: loginMutation, isPending } = useMutation({
    mutationFn: (formData: z.infer<typeof LoginSchema>) =>
      userApi.login(formData),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<z.infer<typeof LoginSchema>>({
    mode: "onSubmit",
    resolver: zodResolver(LoginSchema),
    defaultValues: { email: "", password: "" },
  });

  const handleLogin: SubmitHandler<z.infer<typeof LoginSchema>> = async (
    formData
  ) => {
    await loginMutation(formData, {
      onSuccess: (response) => {
        setUser(response);
        queryClient.invalidateQueries();
        reset();
        router.history.push(redirectUrl ? redirectUrl : "/chat");
      },
      onError: (error: unknown) => {
        toast({
          variant: "destructive",
          title: "Error",
          description: error as string,
        });
      },
    });
  };

  return (
    <form
      onSubmit={handleSubmit(handleLogin)}
      className="flex flex-col gap-8 w-[calc(min(500px,100vw))] px-8 sm:px-0"
    >
      <div className="flex flex-col gap-1">
        {errors.email && (
          <p className="text-xs text-red-600">{errors.email.message}</p>
        )}
        <input
          {...register("email")}
          autoFocus
          type="email"
          placeholder="Email"
          className="rounded p-1.5
           transition-colors ease-in-out duration-700 text-center shadow-lg shadow-cyan-500/50 text-white bg-neutral-950 focus-within:bg-black hover:bg-black text-xl outline-none"
          autoComplete="email"
        />
      </div>
      <div className="flex flex-col gap-1">
        {errors.password && (
          <p className="text-xs text-red-600">{errors.password.message}</p>
        )}
        <input
          {...register("password")}
          type="password"
          placeholder="Password"
          autoComplete="password"
          className="rounded p-1.5
           transition-colors ease-in-out duration-700 text-center shadow-lg shadow-cyan-500/50 text-white bg-neutral-950 focus-within:bg-black hover:bg-black text-xl outline-none"
        />
      </div>
      <div className="flex flex-col gap-4">
        <button
          type="submit"
          disabled={isPending}
          className="px-2 py-1 transition-colors ease-in-out duration-700 min-w-[140px] place-self-center text-center shadow-lg shadow-cyan-500/50 text-neutral-300 hover:text-white bg-cyan-800 hover:bg-cyan-600 hover:shadow-cyan-400/50 rounded text-xl"
        >
          {isPending ? "Logging In..." : "Log In"}
        </button>
        <div className="w-full flex gap-2">
          <p>Don't have an account?</p>{" "}
          <Link to="/register" className="text-blue-500 hover:text-blue-400">
            Sign Up
          </Link>
        </div>
      </div>
    </form>
  );
}

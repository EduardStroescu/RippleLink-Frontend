import { useUserStoreActions } from "../stores/useUserStore";
import { useLocalStorage } from "@/lib/hooks/useLocalStorage";
import { Link, useRouter, useRouterState } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import userApi from "@/api/modules/user.api";
import { SubmitHandler, useForm } from "react-hook-form";
import { LoginSchema } from "@/lib/formSchemas/auth.schemas";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "./ui/use-toast";
import { User } from "@/types/user";

export function LoginForm() {
  const { setUser } = useUserStoreActions();
  const { setItem } = useLocalStorage<User>("user");
  const router = useRouter();
  const redirectUrl = useRouterState({
    select: (state) => state.location.search.redirect,
  });
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const loginMutation = useMutation({
    mutationFn: (formData: { email: string; password: string }) =>
      userApi.login(formData),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof LoginSchema>>({
    mode: "onSubmit",
    resolver: zodResolver(LoginSchema),
    defaultValues: { email: "", password: "" },
  });

  const handleLogin: SubmitHandler<z.infer<typeof LoginSchema>> = async (
    formData
  ) => {
    await loginMutation.mutateAsync(formData, {
      onSuccess: (response) => {
        setItem(response);
        setUser(response);
        queryClient.invalidateQueries();
        reset();
        router.history.push(redirectUrl ? redirectUrl : "/chat");
      },
      onError: (error) => {
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message,
        });
      },
    });
  };

  return (
    <form
      onSubmit={handleSubmit(handleLogin)}
      className="flex flex-col gap-8 min-w-[320px] sm:min-w-[500px]"
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
          className="rounded p-1.5 bg-black shadow-custom-multi"
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
          className="rounded p-1.5 bg-black shadow-custom-multi"
        />
      </div>
      <div className="my-4 flex flex-col gap-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-2 py-1 rounded border-4 border-double border-blue-800 bg-black transition-colors ease-in-out duration-700 hover:bg-slate-950 w-full max-w-[50%] place-self-center"
        >
          {isSubmitting ? "Logging In..." : "Log In"}
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

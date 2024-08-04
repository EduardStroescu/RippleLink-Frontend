import { useUserStoreActions } from "../stores/useUserStore";
import { useLocalStorage } from "@/lib/hooks/useLocalStorage";
import { Link, useRouter, useRouterState } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import userApi from "@/api/modules/user.api";
import { SubmitHandler, useForm } from "react-hook-form";
import { LoginSchema } from "@/lib/formSchemas/auth.schemas";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

export function LoginForm() {
  const { setUser } = useUserStoreActions();
  const { setItem } = useLocalStorage("user");
  const router = useRouter();
  const redirectUrl = useRouterState({
    select: (state) => state.location.search.redirect,
  });

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
    mode: "onChange",
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
        reset();
        router.history.push(redirectUrl ? redirectUrl : "/chat");
      },
      onError: (error) => {
        console.log(error);
      },
    });
  };

  return (
    <form
      onSubmit={handleSubmit(handleLogin)}
      className="flex flex-col gap-10 min-w-[500px]"
    >
      <input
        {...register("email")}
        autoFocus
        type="email"
        placeholder="Email"
        className="rounded p-1.5 bg-black shadow-custom-multi"
        autoComplete="email"
      />
      {errors.email && <p>{errors.email.message}</p>}
      <input
        {...register("password")}
        type="password"
        placeholder="Password"
        autoComplete="password"
        className="rounded p-1.5 bg-black shadow-custom-multi"
      />
      {errors.password && <p>{errors.password.message}</p>}
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
    </form>
  );
}

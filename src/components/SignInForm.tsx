import { FormEvent, useState } from "react";
import { useUserStoreActions } from "../stores/useUserStore";
import { useLocalStorage } from "@/lib/hooks/useLocalStorage";
import { useRouter, useRouterState } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import userApi from "@/api/modules/user.api";

export function SignInForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { setUser } = useUserStoreActions();
  const { setItem } = useLocalStorage("user");
  const router = useRouter();
  const redirectUrl = useRouterState({
    select: (state) => state.location.search.redirect,
  });

  const signInMutation = useMutation({
    mutationFn: (values) => userApi.signin(values),
  });

  const handleSignIn = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { response, error } = await signInMutation.mutateAsync({
      email,
      password,
    });

    if (response) {
      setItem(response);
      setUser(response);
    } else {
      console.log(error);
    }

    router.history.push(redirectUrl ? redirectUrl : "/chat");
  };

  return (
    <form onSubmit={handleSignIn} className="flex flex-col gap-4 min-w-[400px]">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        className="rounded p-1.5 bg-black"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="rounded p-1.5 bg-black"
      />
      <button
        type="submit"
        className="px-2 py-1 rounded border-4 border-double border-blue-800 bg-black w-full max-w-[50%] place-self-center"
      >
        Log In
      </button>
    </form>
  );
}

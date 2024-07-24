import { FormEvent, useState } from "react";
import { useUserStoreActions } from "../stores/useUserStore";
import { useLocalStorage } from "@/lib/hooks/useLocalStorage";
import { useRouter, useRouterState } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import userApi from "@/api/modules/user.api";

export function SignUpForm() {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const { setUser } = useUserStoreActions();
  const { setItem } = useLocalStorage("user");
  const router = useRouter();
  const redirectUrl = useRouterState({
    select: (state) => state.location.search.redirect,
  });

  const signUpMutation = useMutation({
    mutationFn: (values) => userApi.signup(values),
  });

  const handleSignUp = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const values = {
      email,
      password,
      confirmPassword,
      firstName,
      lastName,
      displayName,
    };
    const { response, error } = await signUpMutation.mutateAsync(values);

    if (response) {
      setItem(response);
      setUser(response);
      router.history.push(redirectUrl ? redirectUrl : "/chat");
    } else {
      console.log(error);
    }
  };

  return (
    <form onSubmit={handleSignUp} className="flex flex-col gap-4 min-w-[400px]">
      <input
        type="text"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="rounded p-1.5 bg-black"
      />
      <input
        type="text"
        value={firstName}
        onChange={(e) => setFirstName(e.target.value)}
        placeholder="First Name"
        className="rounded p-1.5 bg-black"
      />
      <input
        type="text"
        value={lastName}
        onChange={(e) => setLastName(e.target.value)}
        placeholder="Last Name"
        className="rounded p-1.5 bg-black"
      />
      <input
        placeholder="Display Name"
        value={displayName}
        onChange={(e) => setDisplayName(e.target.value)}
        className="rounded p-1.5 bg-black"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="rounded p-1.5 bg-black"
      />
      <input
        type="password"
        placeholder="Confirm Password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        className="rounded p-1.5 bg-black"
      />
      <button
        type="submit"
        className="px-2 py-1 rounded border-4 border-double border-blue-800 bg-black w-full max-w-[50%] place-self-center"
      >
        Register
      </button>
    </form>
  );
}

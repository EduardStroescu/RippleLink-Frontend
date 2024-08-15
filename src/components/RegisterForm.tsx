import { useUserStoreActions } from "../stores/useUserStore";
import { useLocalStorage } from "@/lib/hooks/useLocalStorage";
import { Link, useRouter, useRouterState } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import userApi from "@/api/modules/user.api";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { RegisterSchema } from "@/lib/formSchemas/auth.schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { placeholderAvatar } from "@/lib/const";
import { ChangeEvent, useState } from "react";
import { AvatarCoin } from "@/components/ui/AvatarCoin";
import { useToast } from "./ui/use-toast";
import { User } from "@/types/user";

export function RegisterForm() {
  const { setUser } = useUserStoreActions();
  const { setItem } = useLocalStorage<User>("user");
  const [avatarImage, setAvatarImage] = useState<string | null>(null);
  const router = useRouter();
  const redirectUrl = useRouterState({
    select: (state) => state.location.search.redirect,
  });
  const { toast } = useToast();

  const registerMutation = useMutation({
    mutationFn: (formData: {
      email: string;
      password: string;
      confirmPassword: string;
      firstName: string;
      lastName: string;
      displayName?: string;
      avatarUrl: string;
    }) => userApi.register(formData),
  });

  const {
    handleSubmit,
    register,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof RegisterSchema>>({
    mode: "onSubmit",
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
      displayName: "",
      avatarUrl: "",
    },
  });

  const handleRegister: SubmitHandler<z.infer<typeof RegisterSchema>> = async (
    formData
  ) => {
    await registerMutation.mutateAsync(formData, {
      onSuccess: (response) => {
        setItem(response);
        setUser(response);
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

  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const fileReader = new FileReader();
    const file = e.target.files[0];
    fileReader.readAsDataURL(file);

    fileReader.onloadend = () => {
      const content = fileReader.result;
      if (content && typeof content === "string") {
        setAvatarImage(content);
        setValue("avatarUrl", content, { shouldDirty: true });
      }
    };
  };

  return (
    <form
      onSubmit={handleSubmit(handleRegister)}
      className="flex flex-col gap-8 min-w-[320px] sm:min-w-[500px]"
    >
      <label
        htmlFor="avatar"
        className="self-center max-w-[200px] sm:max-w-[300px] cursor-pointer"
        aria-label="Upload Avatar"
      >
        <AvatarCoin
          source={avatarImage || placeholderAvatar}
          width={50}
          className="w-full aspect-square object-cover"
          alt="User Avatar"
        />
      </label>
      <input
        type="file"
        accept="image/*"
        id="avatar"
        onChange={handleAvatarChange}
        className="hidden"
      />
      <div className="flex flex-col gap-1">
        {errors?.email && (
          <p className="text-xs text-red-600">{errors.email.message}</p>
        )}
        <input
          {...register("email")}
          autoFocus
          type="text"
          placeholder="Email"
          className="w-full rounded p-1.5 bg-black shadow-custom-multi"
        />
      </div>
      <div className="flex flex-col gap-1">
        {errors?.firstName && (
          <p className="text-xs text-red-600">{errors.firstName.message}</p>
        )}
        <input
          {...register("firstName")}
          type="text"
          placeholder="First Name"
          className="rounded p-1.5 bg-black shadow-custom-multi"
        />
      </div>
      <div className="flex flex-col gap-1">
        {errors?.lastName && (
          <p className="text-xs text-red-600">{errors.lastName.message}</p>
        )}
        <input
          {...register("lastName")}
          type="text"
          placeholder="Last Name"
          className="rounded p-1.5 bg-black shadow-custom-multi"
        />
      </div>
      <div className="flex flex-col gap-1">
        {errors?.displayName && (
          <p className="text-xs text-red-600">{errors.displayName.message}</p>
        )}
        <input
          {...register("displayName", { required: false })}
          placeholder="Display Name"
          type="text"
          className="rounded p-1.5 bg-black shadow-custom-multi"
        />
      </div>
      <div className="flex flex-col gap-1">
        {errors?.password && (
          <p className="text-xs text-red-600">{errors.password.message}</p>
        )}
        <input
          {...register("password")}
          type="password"
          placeholder="Password"
          className="rounded p-1.5 bg-black shadow-custom-multi"
        />
      </div>
      <div className="flex flex-col gap-1">
        {errors?.confirmPassword && (
          <p className="text-xs text-red-600">
            {errors.confirmPassword.message}
          </p>
        )}
        <input
          {...register("confirmPassword")}
          type="password"
          placeholder="Confirm Password"
          className="rounded p-1.5 bg-black shadow-custom-multi"
        />
      </div>
      <div className="my-4 flex flex-col gap-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-2 py-1 rounded border-4 border-double border-blue-800 bg-black w-full max-w-[50%] place-self-center"
        >
          {isSubmitting ? "Registering..." : "Register"}
        </button>
        <div className="w-full flex gap-2">
          <p>Already have an account?</p>{" "}
          <Link to="/login" className="text-blue-500 hover:text-blue-400">
            Log In
          </Link>
        </div>
      </div>
    </form>
  );
}

import { useState } from "react";
import { Link, useRouter, useRouterState } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useUserStoreActions } from "../stores/useUserStore";
import { useLocalStorage } from "@/lib/hooks/useLocalStorage";
import userApi from "@/api/modules/user.api";
import { RegisterSchema } from "@/lib/formSchemas/auth.schemas";
import { AvatarCoin, useToast } from "@/components/ui";
import { placeholderAvatar } from "@/lib/const";
import { User } from "@/types/user";
import { bytesToMegabytes } from "@/lib/utils";

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
      onError: (error: unknown) => {
        toast({
          variant: "destructive",
          title: "Error",
          description: error as string,
        });
      },
    });
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const fileReader = new FileReader();
    const file = e.target.files[0];
    const fileSize = bytesToMegabytes(file.size);

    // Check if the file size is greater than 10 MB
    if (fileSize > 10) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "File size exceeds 10 MB",
      });
      return;
    }

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
      className="flex flex-col gap-8 w-[calc(min(500px,100vw))] px-8 sm:px-0"
    >
      <label
        htmlFor="avatar"
        aria-label="Select Avatar"
        className="relative group self-center max-w-[200px] sm:max-w-[300px] cursor-pointer"
      >
        <p className="group-hover:opacity-100 opacity-0 absolute inset-0 bg-black/80 flex flex-col items-center justify-center rounded-full pointer-events-none text-cyan-500 font-bold text-2xl transition-all ease-in-out text-center">
          Select Avatar
        </p>
        <AvatarCoin
          source={avatarImage || placeholderAvatar}
          width={300}
          className="w-full max-w-[300px] self-center object-contain object-center"
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
          className="rounded p-1.5
           transition-colors ease-in-out duration-700 text-center shadow-lg shadow-cyan-500/50 text-white bg-neutral-950 focus-within:bg-black hover:bg-black text-xl outline-none"
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
          className="rounded p-1.5
           transition-colors ease-in-out duration-700 text-center shadow-lg shadow-cyan-500/50 text-white bg-neutral-950 focus-within:bg-black hover:bg-black text-xl outline-none"
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
          className="rounded p-1.5
           transition-colors ease-in-out duration-700 text-center shadow-lg shadow-cyan-500/50 text-white bg-neutral-950 focus-within:bg-black hover:bg-black text-xl outline-none"
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
          className="rounded p-1.5
           transition-colors ease-in-out duration-700 text-center shadow-lg shadow-cyan-500/50 text-white bg-neutral-950 focus-within:bg-black hover:bg-black text-xl outline-none"
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
          className="rounded p-1.5
           transition-colors ease-in-out duration-700 text-center shadow-lg shadow-cyan-500/50 text-white bg-neutral-950 focus-within:bg-black hover:bg-black text-xl outline-none"
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
          className="rounded p-1.5
           transition-colors ease-in-out duration-700 text-center shadow-lg shadow-cyan-500/50 text-white bg-neutral-950 focus-within:bg-black hover:bg-black text-xl outline-none"
        />
      </div>
      <div className="my-4 flex flex-col gap-4">
        <button
          type="submit"
          aria-label="Register"
          disabled={isSubmitting}
          className="px-2 py-1 transition-colors ease-in-out duration-700 min-w-[140px] place-self-center text-center shadow-lg shadow-cyan-500/50 text-neutral-300 hover:text-white bg-cyan-800 hover:bg-cyan-600 hover:shadow-cyan-400/50 rounded text-xl"
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

import { useEffect, useState } from "react";
import { AvatarCoin } from "./ui/AvatarCoin";
import { placeholderAvatar } from "@/lib/const";
import { useUserStore, useUserStoreActions } from "@/stores/useUserStore";
import { useMutation } from "@tanstack/react-query";
import userApi from "@/api/modules/user.api";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "./ui/use-toast";
import { AvatarUpdateSchema } from "@/lib/formSchemas/user.schemas";
import { User } from "@/types/user";
import { useLocalStorage } from "@/lib/hooks/useLocalStorage";
import { bytesToMegabytes } from "@/lib/utils";

export function ChangeAvatarForm() {
  const user = useUserStore((state) => state.user);
  const { setUser } = useUserStoreActions();
  const [avatar, setAvatar] = useState<string | null>(null);
  const { toast } = useToast();
  const { setItem } = useLocalStorage<User>("user");

  useEffect(() => {
    if (user?.avatarUrl) {
      setAvatar(user.avatarUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        setAvatar(content);
        setValue("avatar", content, { shouldDirty: true });
      }
    };
  };

  const changeAvatarMutation = useMutation({
    mutationFn: (formData: { avatar: string }) =>
      userApi.avatarUpdate(formData),
  });

  const {
    handleSubmit,
    setValue,
    formState: { isSubmitting },
  } = useForm<z.infer<typeof AvatarUpdateSchema>>({
    mode: "onSubmit",
    resolver: zodResolver(AvatarUpdateSchema),
    defaultValues: {
      avatar: "",
    },
  });

  const handleSubmitAvatar: SubmitHandler<
    z.infer<typeof AvatarUpdateSchema>
  > = async (formData) => {
    await changeAvatarMutation.mutateAsync(formData, {
      onSuccess: (response) => {
        setUser((prevUser) => {
          const updatedUser = prevUser && {
            ...prevUser,
            avatarUrl: response.avatarUrl,
          };
          updatedUser && setItem(updatedUser);
          return updatedUser;
        });
        toast({
          variant: "default",
          title: "Success",
          description: "Avatar updated.",
        });
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
      onSubmit={handleSubmit(handleSubmitAvatar)}
      className="w-full flex flex-col gap-4 items-center p-4"
    >
      <label
        htmlFor="avatar"
        aria-label="Select Avatar"
        className="relative group self-center max-w-[200px] sm:max-w-[300px] cursor-pointer"
      >
        <p className="group-hover:opacity-100 opacity-0 absolute inset-0 bg-black/80 flex flex-col items-center justify-center rounded-full pointer-events-none text-cyan-500 font-bold text-2xl text-center transition-all ease-in-out">
          Select Avatar
        </p>
        <AvatarCoin
          source={avatar || placeholderAvatar}
          width={300}
          alt={`${user?.displayName}'s avatar`}
        />
      </label>
      <input
        type="file"
        accept="image/*"
        id="avatar"
        onChange={handleAvatarChange}
        className="hidden"
      />
      <button
        type="submit"
        disabled={isSubmitting}
        aria-label="Save New Avatar"
        className="border-[1px] hover:bg-cyan-700 border-slate-600 rounded self-center py-1 px-4 text-slate-300 hover:text-white"
      >
        {isSubmitting ? "Saving..." : "Save New Avatar"}
      </button>
    </form>
  );
}

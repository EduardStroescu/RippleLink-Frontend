import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";

import { userApi } from "@/api/modules/user.api";
import { AvatarCoin } from "@/components/ui/AvatarCoin";
import { toast } from "@/components/ui/use-toast";
import { placeholderAvatar } from "@/lib/const";
import { bytesToMegabytes } from "@/lib/utils";
import { AvatarUpdateSchema } from "@/lib/zodSchemas/user.schemas";
import { useUserStore, useUserStoreActions } from "@/stores/useUserStore";

export function ChangeAvatarForm() {
  const user = useUserStore((state) => state.user);
  const { setUser } = useUserStoreActions();

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
    watch,
    formState: { isSubmitting },
  } = useForm<z.infer<typeof AvatarUpdateSchema>>({
    mode: "onSubmit",
    resolver: zodResolver(AvatarUpdateSchema),
    defaultValues: {
      avatar: user?.avatarUrl ?? "",
    },
    values: {
      avatar: user?.avatarUrl ?? "",
    },
  });
  const avatar = watch("avatar");

  const handleSubmitAvatar: SubmitHandler<
    z.infer<typeof AvatarUpdateSchema>
  > = async (formData) => {
    await changeAvatarMutation.mutateAsync(formData, {
      onSuccess: (response) => {
        setUser((prevUser) => {
          if (!prevUser) return prevUser;
          return {
            ...prevUser,
            avatarUrl: response.avatarUrl,
          };
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

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";

import { userApi } from "@/api/modules/user.api";
import { toast } from "@/components/ui/use-toast";
import { ChangePasswordSchema } from "@/lib/zodSchemas/user.schemas";
import { useUserStoreActions } from "@/stores/useUserStore";

export function ChangePasswordForm() {
  const { removeUser } = useUserStoreActions();
  const router = useRouter();

  const { mutateAsync: changePasswordMutation, isPending } = useMutation({
    mutationFn: (formData: z.infer<typeof ChangePasswordSchema>) =>
      userApi.changePassword(formData),
  });

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<z.infer<typeof ChangePasswordSchema>>({
    mode: "onSubmit",
    resolver: zodResolver(ChangePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
  });

  const handleChangePassword: SubmitHandler<
    z.infer<typeof ChangePasswordSchema>
  > = async (formData) => {
    await changePasswordMutation(formData, {
      onSuccess: () => {
        removeUser();
        router.navigate({ to: "/login" });
        toast({
          title: "Success",
          description: "Password changed successfully",
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
      onSubmit={handleSubmit(handleChangePassword)}
      className="w-full h-fit px-10 py-6 flex flex-col items-center gap-2 rounded-lg border-[1px] border-slate-600 bg-cyan-800/40"
    >
      <div className="flex flex-row flex-wrap gap-2">
        <div className="flex flex-col flex-1 min-w-full gap-1">
          <label htmlFor="currentPassword">Current Password</label>
          <input
            {...register("currentPassword")}
            type="password"
            placeholder="Current Password"
            className="w-full rounded p-1.5 bg-black"
          />
          {errors.currentPassword && (
            <p className="text-xs text-red-600">
              {errors.currentPassword.message}
            </p>
          )}
        </div>
        <div className="flex flex-col flex-1 min-w-full sm:min-w-[calc(50%-0.5rem)] gap-1">
          <label htmlFor="newPassword">New Password</label>
          <input
            {...register("newPassword")}
            type="password"
            placeholder="New Password"
            className="w-full rounded p-1.5 bg-black"
          />
          {errors.newPassword && (
            <p className="text-xs text-red-600">{errors.newPassword.message}</p>
          )}
        </div>
        <div className="flex flex-col flex-1 min-w-full sm:min-w-[calc(50%-0.5rem)] gap-1">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            {...register("confirmNewPassword")}
            type="password"
            placeholder="Confirm Password"
            className="w-full rounded p-1.5 bg-black"
          />
          {errors.confirmNewPassword && (
            <p className="text-xs text-red-600">
              {errors.confirmNewPassword.message}
            </p>
          )}
        </div>
      </div>
      <button
        type="submit"
        disabled={isPending}
        aria-label="Change Password"
        className="border-[1px] hover:bg-cyan-700 border-slate-600 rounded self-center py-1 px-4 text-slate-300 hover:text-white mt-4"
      >
        Change Password
      </button>
    </form>
  );
}

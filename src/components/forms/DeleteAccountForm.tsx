import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";

import { userApi } from "@/api/modules/user.api";
import { toast } from "@/components/ui/use-toast";
import { DeleteAccountSchema } from "@/lib/zodSchemas/user.schemas";
import { useUserStoreActions } from "@/stores/useUserStore";

export function DeleteAccountForm() {
  const { removeUser } = useUserStoreActions();
  const router = useRouter();

  const { mutateAsync: deleteAccountMutation, isPending } = useMutation({
    mutationFn: (formData: z.infer<typeof DeleteAccountSchema>) =>
      userApi.deleteAccount(formData),
  });

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<z.infer<typeof DeleteAccountSchema>>({
    mode: "onSubmit",
    resolver: zodResolver(DeleteAccountSchema),
    defaultValues: {
      currentPassword: "",
      confirmCurrentPassword: "",
    },
  });

  const handleDeleteAccount: SubmitHandler<
    z.infer<typeof DeleteAccountSchema>
  > = async (formData) => {
    await deleteAccountMutation(formData, {
      onSuccess: () => {
        removeUser();
        router.navigate({ to: "/" });
        toast({
          title: "Success",
          description: "Account deleted successfully",
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
    <div className="w-full h-fit px-10 py-6 flex flex-col gap-4 rounded-lg border-[1px] border-slate-600 bg-red-950/40">
      <h3 className="font-bold text-xl text-center">
        We're sad to see you go! 🙁
      </h3>
      <form
        onSubmit={handleSubmit(handleDeleteAccount)}
        className="w-full flex flex-col items-center gap-2"
      >
        <div className="min-w-[40%] flex flex-row flex-wrap gap-2">
          <div className="flex flex-col flex-1 min-w-full sm:min-w-[calc(50%-0.5rem)] gap-1">
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
            <label htmlFor="confirmCurrentPassword">Confirm Password</label>
            <input
              {...register("confirmCurrentPassword")}
              type="password"
              placeholder="Confirm Password"
              className="w-full rounded p-1.5 bg-black"
            />
            {errors.confirmCurrentPassword && (
              <p className="text-xs text-red-600">
                {errors.confirmCurrentPassword.message}
              </p>
            )}
          </div>
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="bg-red-900 hover:bg-red-800 text-white py-2 px-4 rounded mt-4"
          aria-label="Delete Account"
        >
          Delete Account
        </button>
        <p className="text-center text-xs font-bold">
          Warning: This action is irreversible.
        </p>
      </form>
    </div>
  );
}

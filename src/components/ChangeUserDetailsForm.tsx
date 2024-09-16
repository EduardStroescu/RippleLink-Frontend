import userApi from "@/api/modules/user.api";
import { UpdateAccountSchema } from "@/lib/formSchemas/user.schemas";
import { useUserStore, useUserStoreActions } from "@/stores/useUserStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useEffect } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { useToast } from "./ui/use-toast";

export function ChangeUserDetailsForm() {
  const user = useUserStore((state) => state.user);
  const { setUser } = useUserStoreActions();
  const { toast } = useToast();

  const updateUserMutation = useMutation({
    mutationFn: (formData: {
      email?: string;
      displayName?: string;
      firstName?: string;
      lastName?: string;
    }) => userApi.accountUpdate(formData),
  });

  useEffect(() => {
    if (user) {
      setValue("email", user.email);
      setValue("displayName", user.displayName);
      setValue("firstName", user.firstName);
      setValue("lastName", user.lastName);
    }
  }, []);

  const {
    handleSubmit,
    register,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof UpdateAccountSchema>>({
    mode: "onSubmit",
    resolver: zodResolver(UpdateAccountSchema),
    defaultValues: {
      email: "",
      displayName: "",
      firstName: "",
      lastName: "",
    },
  });

  const handleAccountUpdate: SubmitHandler<
    z.infer<typeof UpdateAccountSchema>
  > = async (formData) => {
    const updateObj = {
      email: formData.email,
      displayName: formData.displayName,
      firstName: formData.firstName,
      lastName: formData.lastName,
    };

    Object.keys(updateObj).forEach(
      (key) =>
        (updateObj[key as keyof typeof updateObj] ===
          user?.[key as keyof typeof updateObj] ||
          updateObj[key as keyof typeof updateObj] === "") &&
        delete updateObj[key as keyof typeof updateObj]
    );
    if (!Object.keys(updateObj).length) return;

    await updateUserMutation.mutateAsync(updateObj, {
      onSuccess: (response) => {
        setUser((prevUser) => prevUser && { ...prevUser, response });
        toast({
          title: "Success",
          description: "User details updated successfully",
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
      onSubmit={handleSubmit(handleAccountUpdate)}
      className="w-full h-fit px-10 py-6 flex flex-col items-center gap-2 rounded-lg border-[1px] border-slate-600 bg-cyan-800/40"
    >
      <div className="flex flex-wrap gap-4">
        <div className="flex flex-col flex-1 min-w-full sm:min-w-[calc(50%-0.5rem)] gap-1">
          <label htmlFor="Email">Email</label>
          <input
            {...register("email")}
            type="text"
            placeholder="Email"
            className="w-full rounded p-1.5 bg-black"
          />
          {errors.email && (
            <p className="text-xs text-red-600">{errors.email.message}</p>
          )}
        </div>
        <div className="flex flex-col flex-1 min-w-full sm:min-w-[calc(50%-0.5rem)] gap-1">
          <label htmlFor="Display Name">Display Name</label>
          <input
            {...register("displayName")}
            type="text"
            placeholder="Display Name"
            className="w-full rounded p-1.5 bg-black"
          />
          {errors.displayName && (
            <p className="text-xs text-red-600">{errors.displayName.message}</p>
          )}
        </div>
        <div className="flex flex-col flex-1 min-w-full sm:min-w-[calc(50%-0.5rem)] gap-1">
          <label htmlFor="First Name">First Name</label>
          <input
            {...register("firstName")}
            type="text"
            placeholder="First Name"
            className="w-full rounded p-1.5 bg-black"
          />
          {errors.firstName && (
            <p className="text-xs text-red-600">{errors.firstName.message}</p>
          )}
        </div>
        <div className="flex flex-col flex-1 min-w-full sm:min-w-[calc(50%-0.5rem)] gap-1">
          <label htmlFor="Last Name">Last Name</label>
          <input
            {...register("lastName")}
            type="text"
            placeholder="Last Name"
            className="w-full rounded p-1.5 bg-black"
          />
          {errors.lastName && (
            <p className="text-xs text-red-600">{errors.lastName.message}</p>
          )}
        </div>
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        aria-label="Change User Details"
        className="border-[1px] hover:bg-cyan-700 border-slate-600 rounded self-center py-1 px-4 text-slate-300 hover:text-white mt-4"
      >
        {isSubmitting ? "Saving..." : "Save"}
      </button>
      <p className="text-center text-xs font-bold">
        *Some changes will be reflected in about 1hr.
      </p>
    </form>
  );
}

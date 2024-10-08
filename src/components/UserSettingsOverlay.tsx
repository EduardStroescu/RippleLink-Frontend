import React from "react";
import { useRouter } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useUserStoreActions } from "@/stores/useUserStore";
import userApi from "@/api/modules/user.api";
import { useLocalStorage } from "@/lib/hooks";
import {
  useToast,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui";
import {
  CustomDialogTrigger,
  ChangeAvatarForm,
  ChangeStatusForm,
} from "@/components";
import { User } from "@/types/user";

interface UserSettingsOverlayProps {
  children: React.ReactNode;
}

export const UserSettingsOverlay: React.FC<UserSettingsOverlayProps> = ({
  children,
}) => {
  const queryClient = useQueryClient();
  const { setUser } = useUserStoreActions();
  const { removeItem } = useLocalStorage<User | null>("user");
  const router = useRouter();
  const { toast } = useToast();

  const logoutMutation = useMutation({
    mutationFn: userApi.logout,
    onSettled: () => {
      removeItem();
      setUser(null);
      queryClient.cancelQueries();
      router.navigate({ to: "/" });
      router.invalidate();
    },
    onError: (error: unknown) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error as string,
      });
    },
  });

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
  };

  const avatarFunctions = [
    {
      name: "Change Avatar",
      component: (
        <CustomDialogTrigger
          header="Change Avatar"
          content={<ChangeAvatarForm />}
        >
          <p className="hover:text-white">Change Avatar</p>
        </CustomDialogTrigger>
      ),
    },
    {
      name: "Change Status",
      component: (
        <CustomDialogTrigger
          header="Change Status"
          content={<ChangeStatusForm />}
          contentClassName="h-[80%]
        block
        sm:h-[440px]"
        >
          <p className="hover:text-white">Change Status</p>
        </CustomDialogTrigger>
      ),
    },
    {
      name: "Log Out",
      fn: handleLogout,
      component: (
        <button onClick={handleLogout} className="hover:text-white">
          Log Out
        </button>
      ),
    },
  ];

  return (
    <div className="flex items-center">
      <Popover>
        <PopoverTrigger className="cursor-pointer">{children}</PopoverTrigger>
        <PopoverContent className="p-0 border-none" align="start">
          <ul className="bg-black/60 backdrop-blur-xl flex flex-col gap-2 py-2 px-4 rounded">
            {avatarFunctions.map((item) => (
              <li key={item.name} className="flex w-full justify-center">
                {item.component}
              </li>
            ))}
          </ul>
        </PopoverContent>
      </Popover>
    </div>
  );
};

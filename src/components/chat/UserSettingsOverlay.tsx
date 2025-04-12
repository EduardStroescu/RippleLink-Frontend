import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import React from "react";

import { userApi } from "@/api/modules/user.api";
import { ChangeAvatarForm } from "@/components/forms/ChangeAvatarForm";
import { ChangeStatusForm } from "@/components/forms/ChangeStatusForm";
import { CustomDialogTrigger } from "@/components/ui/CustomDialogTrigger";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/Popover";
import { useUserStoreActions } from "@/stores/useUserStore";

interface UserSettingsOverlayProps {
  children: React.ReactNode;
}

export const UserSettingsOverlay: React.FC<UserSettingsOverlayProps> = ({
  children,
}) => {
  const queryClient = useQueryClient();
  const { removeUser } = useUserStoreActions();
  const router = useRouter();

  const logoutMutation = useMutation({
    mutationFn: userApi.logout,
    onSettled: () => {
      removeUser();
      queryClient.cancelQueries();
      router.navigate({ to: "/" });
      router.invalidate();
    },
  });

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
  };

  const userFunctions = [
    {
      name: "Change Avatar",
      component: (
        <CustomDialogTrigger
          header="Change Avatar"
          dialogContent={<ChangeAvatarForm />}
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
          dialogContent={<ChangeStatusForm />}
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
            {userFunctions.map((item) => (
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

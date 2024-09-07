import React from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/Popover";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useUserStoreActions } from "@/stores/useUserStore";
import { useLocalStorage } from "@/lib/hooks/useLocalStorage";
import { useRouter } from "@tanstack/react-router";
import { useToast } from "./ui/use-toast";
import userApi from "@/api/modules/user.api";
import { User } from "@/types/user";
import {
  CustomDialogTrigger,
  ChangeAvatarForm,
  ChangeStatusForm,
} from "@/components";

interface UserSettingsOverlayProps {
  children: React.ReactNode;
}

export const UserSettingsOverlay: React.FC<UserSettingsOverlayProps> = ({
  children,
}) => {
  const queryClient = useQueryClient();
  const { setUser } = useUserStoreActions();
  const { setItem } = useLocalStorage<User | null>("user");
  const router = useRouter();
  const { toast } = useToast();

  const logoutMutation = useMutation({
    mutationFn: userApi.logout,
    onSettled: () => {
      setItem(null);
      setUser(null);
      queryClient.cancelQueries();
      router.navigate({ to: "/" });
      router.invalidate();
    },
    onError: (err) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: err?.message,
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

import React from "react";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/Popover";
import { useQueryClient } from "@tanstack/react-query";
import { useUserStoreActions } from "@/stores/useUserStore";
import { useLocalStorage } from "@/lib/hooks/useLocalStorage";
import { useRouter } from "@tanstack/react-router";
import { useToast } from "./ui/use-toast";
import userApi from "@/api/modules/user.api";
import { User } from "@/types/user";

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

  const handleLogout = async () => {
    try {
      await userApi.logout();
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message,
      });
    } finally {
      setItem(null);
      setUser(null);
      queryClient.removeQueries();
      router.navigate({ to: "/" });
    }
  };

  const avatarFunctions = [
    { name: "Change Avatar", fn: () => console.log("change avatar") },
    { name: "Change Status", fn: () => console.log("change status") },
    {
      name: "Log Out",
      fn: handleLogout,
    },
  ];
  return (
    <div className="flex items-center">
      <Popover>
        <PopoverTrigger className="cursor-pointer">{children}</PopoverTrigger>
        <PopoverContent
          className="p-0
          border-none
        "
        >
          <div className="bg-black/60 backdrop-blur-xl flex flex-col gap-2 py-2 px-4 rounded">
            {avatarFunctions.map((item, index) => {
              return (
                <button
                  key={index}
                  onClick={item.fn}
                  className="hover:text-white"
                >
                  {item.name}
                </button>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

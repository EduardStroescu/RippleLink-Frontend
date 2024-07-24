import React from "react";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/Popover";
import { useUserStoreActions } from "@/stores/useUserStore";
import userApi from "@/api/modules/user.api";
import { useRouter } from "@tanstack/react-router";
import { useLocalStorage } from "@/lib/hooks/useLocalStorage";

interface SettingsOverlayProps {
  children: React.ReactNode;
}

export const SettingsOverlay: React.FC<SettingsOverlayProps> = ({
  children,
}) => {
  const { setUser } = useUserStoreActions();
  const { setItem } = useLocalStorage("user");
  const router = useRouter();
  const handleLogout = async () => {
    await userApi.logout();
    setItem(null);
    setUser(null);
    router.navigate({ to: "/" });
  };
  const hamburgerFunctions = [
    { name: "Change Password", fn: () => console.log("change password") },
    {
      name: "Change Background",
      fn: () => {
        setUser((prevUser) =>
          prevUser
            ? {
                ...prevUser,
                background:
                  "https://r4.wallpaperflare.com/wallpaper/175/524/956/digital-digital-art-artwork-fantasy-art-drawing-hd-wallpaper-d8562dc820d0acd8506c415eb8e2a49a.jpg",
              }
            : prevUser
        );
      },
    },
    {
      name: "Log Out",
      fn: handleLogout,
    },
  ];
  return (
    <div className="flex items-center">
      <Popover>
        <PopoverTrigger className="cursor-pointer rounded-full p-1 text-xl group">
          {children}
        </PopoverTrigger>
        <PopoverContent
          className="p-0
          border-none
        "
        >
          <div className="bg-black/60 backdrop-blur-xl  flex flex-col gap-2 py-2 px-4 rounded">
            <h3 className="text-center font-bold text-lg border-b-[1px] py-1 border-slate-800">
              Settings
            </h3>
            {hamburgerFunctions.map((item, index) => (
              <button
                key={index}
                onClick={item.fn}
                className="hover:text-white"
              >
                {item.name}
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

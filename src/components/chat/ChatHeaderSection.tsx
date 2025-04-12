import { Link, useLocation } from "@tanstack/react-router";

import { UserSettingsOverlay } from "@/components/chat/UserSettingsOverlay";
import { SettingsIcon } from "@/components/Icons";
import { AvatarCoin } from "@/components/ui/AvatarCoin";
import { placeholderAvatar } from "@/lib/const";
import { useUserStore } from "@/stores/useUserStore";

export const ChatHeaderSection = () => {
  const user = useUserStore((state) => state.user);
  const location = useLocation();

  return (
    <div className="flex flex-row justify-between text-white py-1 sm:py-2 px-4 items-center">
      <div className="flex items-center gap-2">
        <UserSettingsOverlay>
          <AvatarCoin
            source={user?.avatarUrl || placeholderAvatar}
            width={50}
            alt=""
          />
        </UserSettingsOverlay>
        <p className="font-bold">{user?.displayName}</p>
      </div>
      <div className="flex flex-row gap-2">
        <Link
          to={
            !/\/chat\/settings/.test(location.pathname)
              ? "/chat/settings"
              : "/chat"
          }
          className="group flex items-center gap-2"
          title="Toggle Settings"
          aria-label="Toggle Settings"
        >
          <SettingsIcon />
        </Link>
      </div>
    </div>
  );
};

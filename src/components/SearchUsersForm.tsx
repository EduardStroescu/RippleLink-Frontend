import { Dispatch, useEffect, useMemo, useState } from "react";

import userApi from "@/api/modules/user.api";
import { useRouter } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/Input";
import { AvatarCoin } from "@/components/ui/AvatarCoin";
import { placeholderAvatar } from "@/lib/const";
import { User } from "@/types/user";
import { CheckIcon } from "./Icons";

export const SearchUsersForm = ({
  existingChatUsersIds,
  setOpen,
}: {
  existingChatUsersIds?: User["_id"][];
  setOpen?: Dispatch<React.SetStateAction<boolean>>;
}) => {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  const { data: users } = useQuery({
    enabled: displayName.length > 0,
    queryKey: ["users", displayName],
    queryFn: () => userApi.getUsersByDisplayName(displayName),
  });

  const filteredUsers = useMemo(
    () => users?.filter((user) => !existingChatUsersIds?.includes(user._id)),
    [users, existingChatUsersIds]
  );

  useEffect(() => {
    if (existingChatUsersIds) {
      setSelectedUsers(existingChatUsersIds);
    }
  }, []);

  const handleUserClick = (userId: string) => {
    setSelectedUsers((prev) => {
      if (prev.includes(userId)) {
        return prev.filter((id) => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };

  const handleCreate = () => {
    router.navigate({ to: `/chat/create-chat?userIds=${selectedUsers}` });
    !!setOpen && setOpen(false);
  };

  return (
    <div className="flex flex-col gap-4 py-4 h-full">
      <Input
        type="search"
        id="search"
        onChange={(e) => setDisplayName(e.target.value)}
        placeholder="Search Users"
        className="w-full bg-black/60 py-1 px-2"
        autoComplete="off"
      />
      <div
        className="flex flex-col items-start gap-2 min-h-[180px] max-h-[200px]
        sm:min-h-[240px] sm:max-h-[240px] overflow-y-auto"
      >
        {filteredUsers?.map((user) => (
          <button
            key={user._id}
            className="flex flex-row gap-2 items-center hover:bg-slate-950 w-full rounded"
            onClick={() => handleUserClick(user._id)}
          >
            <AvatarCoin
              source={user.avatarUrl || placeholderAvatar}
              shouldInvalidate
              width={50}
              alt=""
            />
            <p className="flex-1 text-start">{user.displayName}</p>
            {selectedUsers.includes(user._id) && (
              <div className="px-2">
                <CheckIcon fill="#00fff2" width="15px" height="15px" />
              </div>
            )}
          </button>
        ))}
      </div>
      <button
        onClick={handleCreate}
        className="mt-auto rounded bg-green-800 hover:bg-green-700 p-2 hover:text-white text-slate-200"
      >
        Create {selectedUsers.length > 1 ? "Group" : "Chat"}
      </button>
    </div>
  );
};

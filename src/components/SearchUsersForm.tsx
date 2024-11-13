import { Dispatch, useEffect, useMemo, useState } from "react";
import { useRouter } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import userApi from "@/api/modules/user.api";
import { placeholderAvatar } from "@/lib/const";
import { PublicUser } from "@/types/user";
import { Input, AvatarCoin } from "@/components/ui";
import { CheckIcon } from "./Icons";

export const SearchUsersForm = ({
  existingChatUsers,
  setOpen,
}: {
  existingChatUsers?: Pick<PublicUser, "_id" | "displayName">[];
  setOpen?: Dispatch<React.SetStateAction<boolean>>;
}) => {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<
    { _id: string; displayName: string }[]
  >([]);

  const { data: users } = useQuery({
    enabled: displayName.length > 0,
    queryKey: ["users", displayName],
    queryFn: () => userApi.getUsersByDisplayName(displayName),
  });

  const filteredUsers = useMemo(
    () =>
      users?.filter(
        (user) =>
          !existingChatUsers?.some(
            (existingUser) => existingUser._id === user._id
          )
      ),
    [users, existingChatUsers]
  );

  useEffect(() => {
    if (existingChatUsers) {
      setSelectedUsers(existingChatUsers);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUserClick = (user: { _id: string; displayName: string }) => {
    setSelectedUsers((prev) => {
      const userIndex = prev.findIndex(
        (selectedUser) => selectedUser._id === user._id
      );
      if (prev[userIndex]) {
        return prev.filter((selectedUser) => selectedUser._id !== user._id);
      } else {
        return [...prev, user];
      }
    });
  };

  const handleCreate = () => {
    const selectedUsersIds = selectedUsers.map((user) => user._id);
    router.navigate({ to: `/chat/create-chat?userIds=${selectedUsersIds}` });
    !!setOpen && setOpen(false);
  };

  return (
    <div className="flex flex-col gap-4 py-2 h-full">
      <div className="flex flex-col flex-wrap w-full gap-2">
        <p className="text-md">Selected Users:</p>
        <div className="flex gap-1">
          {selectedUsers.map((user, idx) => (
            <button
              key={user._id}
              className="text-sm hover:text-red-500"
              onClick={() => handleUserClick(user)}
              aria-label="Remove user"
              title="Remove user"
            >
              {user.displayName}
              {idx < selectedUsers.length - 1 ? ", " : ""}
            </button>
          ))}
        </div>
      </div>
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
            onClick={() => handleUserClick(user)}
          >
            <AvatarCoin
              source={user.avatarUrl || placeholderAvatar}
              shouldInvalidate
              width={50}
              alt=""
            />
            <p className="flex-1 text-start">{user.displayName}</p>
            {selectedUsers.includes(user) && (
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

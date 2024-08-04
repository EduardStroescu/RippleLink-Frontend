import { Dispatch, useState } from "react";

import userApi from "@/api/modules/user.api";
import { useRouter } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Input } from "./Input";
import { AvatarCoin } from "./AvatarCoin";
import { placeholderAvatar } from "@/lib/const";

export const SearchUsersForm = ({
  setOpen,
}: {
  setOpen?: Dispatch<React.SetStateAction<boolean>>;
}) => {
  const [displayName, setDisplayName] = useState("");
  const router = useRouter();
  const { data: users } = useQuery({
    enabled: displayName.length > 0,
    queryKey: ["users", displayName],
    queryFn: () => userApi.getUsersByDisplayName(displayName),
  });

  const handleClick = (userId: string) => {
    router.navigate({ to: `/chat/create-chat?userId=${userId}` });
    !!setOpen && setOpen(false);
  };

  return (
    <div className="flex flex-col gap-4 my-4">
      <Input
        type="search"
        id="search"
        onChange={(e) => setDisplayName(e.target.value)}
        placeholder="Search Users"
        className="w-full bg-black/60 py-1 px-2"
        autoComplete="off"
      />
      <div className="flex flex-col items-start gap-2">
        {users?.map((user, idx) => (
          <button
            key={user._id}
            className="flex flex-row gap-2 items-center hover:bg-slate-950 w-full rounded"
            onClick={() => handleClick(user._id)}
          >
            <AvatarCoin
              source={user.avatarUrl || placeholderAvatar}
              width={50}
              alt=""
            />
            <p>{user.displayName}</p>
          </button>
        ))}
      </div>
    </div>
  );
};

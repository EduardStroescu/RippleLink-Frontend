import { FormEvent, useState } from "react";

import userApi from "@/api/modules/user.api";
import { Link, useRouter } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Input } from "./Input";
import { AvatarCoin } from "./AvatarCoin";
import { placeholderAvatar } from "@/lib/const";

export const SearchUsersForm = () => {
  const [displayName, setDisplayName] = useState("");
  const router = useRouter();
  const { data } = useQuery({
    enabled: displayName.length > 0,
    queryKey: ["users", displayName],
    queryFn: () => userApi.getUsersByDisplayName(displayName),
  });
  const handleSearch = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setDisplayName(e.target.search.value);
  };

  return (
    <div className="flex flex-col gap-4 my-4">
      <form onSubmit={handleSearch}>
        <Input
          type="search"
          id="search"
          placeholder="Search Users"
          className="w-full bg-black/60 py-1 px-2"
        />
      </form>
      <div className="flex flex-col items-start gap-2">
        {data?.response?.map((user, idx) => (
          <button
            key={user._id}
            className="flex flex-row gap-2 items-center hover:bg-slate-950 w-full rounded"
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

import React from "react";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/Popover";

interface ChangeAvatarOverlayProps {
  children: React.ReactNode;
}

export const ChangeAvatarOverlay: React.FC<ChangeAvatarOverlayProps> = ({
  children,
}) => {
  const avatarFunctions = [
    { name: "Change Avatar", fn: () => console.log("change avatar") },
    { name: "Change Status", fn: () => console.log("change status") },
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

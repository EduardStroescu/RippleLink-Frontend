import React from "react";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui";
import { MediaDevicesInfo } from "./MediaDevicesInfo";

interface MediaDevicesPickerProps {
  children: React.ReactNode;
  getValue?: (selectedDevice: MediaDeviceInfo) => void;
}

export const MediaDevicesPicker: React.FC<MediaDevicesPickerProps> = ({
  children,
  getValue,
}) => {
  const onClick = (selectedDevice: MediaDeviceInfo) => {
    if (getValue) getValue(selectedDevice);
  };
  return (
    <div className="flex items-center">
      <Popover>
        <PopoverTrigger className="group text-[25px] origin-center hover:animate-spin-slow cursor-pointer absolute right-2 bottom-2">
          {children}
        </PopoverTrigger>
        <PopoverContent
          align="end"
          sideOffset={25}
          className="p-0
          border-none mx-2
        "
        >
          <MediaDevicesInfo onDeviceClick={onClick} />
        </PopoverContent>
      </Popover>
    </div>
  );
};

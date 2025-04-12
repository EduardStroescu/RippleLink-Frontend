import React from "react";

import { MediaDevicesInfo } from "@/components/call/MediaDevicesInfo";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/Popover";

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
    <Popover>
      <PopoverTrigger
        title="Device Settings"
        aria-label="Device Settings"
        className="group text-[25px] origin-center hover:animate-spin-slow cursor-pointer absolute right-2 bottom-2"
      >
        {children}
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={15}
        className="p-0 border-none mx-2 max-h-[50dvh]"
      >
        <MediaDevicesInfo onDeviceClick={onClick} />
      </PopoverContent>
    </Popover>
  );
};

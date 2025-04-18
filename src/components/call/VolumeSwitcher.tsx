import React from "react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/Popover";
import { Slider } from "@/components/ui/Slider";

interface VolumeSwitcherProps {
  children: React.ReactNode;
  volume: number;
  setVolume: (newVolume: number) => void;
}

export const VolumeSwitcher: React.FC<VolumeSwitcherProps> = ({
  children,
  volume,
  setVolume,
}) => {
  return (
    <div className="flex items-center">
      <Popover>
        <PopoverTrigger
          title={"Adjust Volume. Current is " + volume * 100 + "%"}
          aria-label={"Adjust Volume. Current is " + volume}
          className="text-[25px] cursor-pointer"
        >
          {children}
        </PopoverTrigger>
        <PopoverContent
          align="center"
          sideOffset={25}
          className="h-[150px] w-fit py-2 px-4 bg-black/60 backdrop-blur rounded border-slate-600 border-[1px]"
        >
          <Slider
            min={0}
            max={1}
            step={0.01}
            value={[volume]}
            onValueChange={(val) => setVolume(val[0])}
            orientation="vertical"
            data-orientation="vertical"
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};

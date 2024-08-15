import React from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/Popover";
import { RgbaColor, RgbaColorPicker } from "react-colorful";

interface ColorPickerProps {
  children: React.ReactNode;
  color: RgbaColor | undefined;
  onChange: (color: RgbaColor) => void;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({
  children,
  color,
  onChange,
}) => {
  return (
    <div className="flex items-center">
      <Popover>
        <PopoverTrigger className="text-[25px]  cursor-pointer">
          {children}
        </PopoverTrigger>
        <PopoverContent
          className="p-0
          border-none
        "
        >
          <RgbaColorPicker color={color} onChange={onChange} />
        </PopoverContent>
      </Popover>
    </div>
  );
};

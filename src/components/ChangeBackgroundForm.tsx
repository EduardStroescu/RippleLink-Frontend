import { AvatarCoin } from "./ui/AvatarCoin";
import { RgbaColor } from "react-colorful";
import { ColorPicker } from "./ColorPicker";
import { ObjectToRgbaString, rgbaStringToObject } from "@/lib/utils";
import { useAppStore, useAppStoreActions } from "@/stores/useAppStore";
import { useShallow } from "zustand/react/shallow";

export function ChangeBackgroundForm() {
  const { appBackground, appTint, appGlow } = useAppStore(
    useShallow((state) => ({
      appBackground: state.appBackground,
      appTint: state.appTint,
      appGlow: state.appGlow,
    }))
  );
  const { setAppBackground, setAppTint, setAppGlow } = useAppStoreActions();

  const handleBackgroundChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const fileReader = new FileReader();
    const file = e.target.files[0];
    fileReader.readAsDataURL(file);

    fileReader.onloadend = () => {
      const content = fileReader.result;
      if (content && typeof content === "string") {
        setAppBackground(content);
      }
    };
  };

  const handleTintColorChange = (color: RgbaColor) => {
    setAppTint(ObjectToRgbaString(color));
  };
  const handleGlowColorChange = (color: RgbaColor) => {
    setAppGlow(ObjectToRgbaString(color));
  };

  return (
    <div className="w-full h-fit flex flex-col gap-4 px-10 py-6 rounded-lg border-[1px] border-slate-600 bg-cyan-800/40">
      <label
        htmlFor="avatar"
        className="self-center max-w-[200px] cursor-pointer"
        aria-label="Upload Avatar"
      >
        <AvatarCoin
          source={appBackground || "/background.png"}
          width={100}
          className="w-full aspect-square object-cover"
          alt="User Avatar"
        />
      </label>
      <input
        type="file"
        accept="image/*"
        id="avatar"
        onChange={handleBackgroundChange}
        className="hidden"
      />
      <div className="flex gap-4 py-2 px-6 justify-center">
        <label>Tint:</label>
        <ColorPicker
          color={rgbaStringToObject(appTint)}
          onChange={handleTintColorChange}
        >
          <div
            className="w-[20px] aspect-square"
            style={{
              backgroundColor: appTint,
            }}
          />
        </ColorPicker>
        <label>Glow:</label>
        <ColorPicker
          color={rgbaStringToObject(appGlow)}
          onChange={handleGlowColorChange}
        >
          <div
            className="w-[20px] aspect-square"
            style={{
              backgroundColor: appGlow,
            }}
          />
        </ColorPicker>
      </div>
      <button className="border-[1px] border-slate-600 rounded self-center py-1 px-4">
        Save
      </button>
    </div>
  );
}

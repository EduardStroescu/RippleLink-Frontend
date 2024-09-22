import { AvatarCoin } from "./ui/AvatarCoin";
import { RgbaColor } from "react-colorful";
import { ColorPicker } from "./ColorPicker";
import {
  bytesToMegabytes,
  ObjectToRgbaString,
  rgbaStringToObject,
} from "@/lib/utils";
import { useAppStore, useAppStoreActions } from "@/stores/useAppStore";
import { useShallow } from "zustand/react/shallow";
import { useMutation } from "@tanstack/react-query";
import userApi from "@/api/modules/user.api";
import { useToast } from "./ui/use-toast";
import { useUserStore, useUserStoreActions } from "@/stores/useUserStore";
import { useLocalStorage } from "@/lib/hooks/useLocalStorage";
import { User } from "@/types/user";

export function ChangeBackgroundForm() {
  const { toast } = useToast();
  const user = useUserStore((state) => state.user);
  const { setItem } = useLocalStorage<User>("user");
  const { appBackground, appTint, appGlow } = useAppStore(
    useShallow((state) => ({
      appBackground: state.appBackground,
      appTint: state.appTint,
      appGlow: state.appGlow,
    }))
  );
  const { setUser } = useUserStoreActions();
  const { setAppBackground, setAppTint, setAppGlow } = useAppStoreActions();

  const handleBackgroundChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const fileReader = new FileReader();
    const file = e.target.files[0];
    const fileSize = bytesToMegabytes(file.size);

    // Check if the file size is greater than 10 MB
    if (fileSize > 10) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "File size exceeds 10 MB",
      });
      return;
    }

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

  const updateSettingsMutation = useMutation({
    mutationFn: (updatedSettings: {
      backgroundImage?: string;
      glowColor?: string;
      tintColor?: string;
    }) => userApi.updateSettings(updatedSettings),
  });

  const handleUpdateSettings = async () => {
    const updatedSettings = {
      backgroundImage: appBackground,
      glowColor: appGlow,
      tintColor: appTint,
    };
    if (!updatedSettings.backgroundImage?.startsWith("data:image")) {
      delete updatedSettings.backgroundImage;
    }
    Object.keys(updatedSettings).forEach(
      (key) =>
        updatedSettings[key as keyof typeof updatedSettings] ===
          user?.settings?.[key as keyof typeof updatedSettings] &&
        delete updatedSettings[key as keyof typeof updatedSettings]
    );
    if (!Object.values(updatedSettings).length) return;

    await updateSettingsMutation.mutateAsync(updatedSettings, {
      onSuccess: (response) => {
        setUser((prevUser) => {
          const updatedUser = prevUser && {
            ...prevUser,
            settings: prevUser.settings && {
              ...prevUser.settings,
              ...response,
            },
          };
          updatedUser && setItem(updatedUser);
          return updatedUser;
        });
        toast({
          title: "Success",
          description: "Theme updated successfully",
        });
      },
      onError: (error: unknown) => {
        toast({
          variant: "destructive",
          title: "Error",
          description: error as string,
        });
      },
    });
  };

  return (
    <div className="w-full h-fit flex flex-col gap-4 px-10 py-6 rounded-lg border-[1px] border-slate-600 bg-cyan-800/40">
      <label
        htmlFor="background"
        aria-label="Select App Background"
        className="relative group self-center max-w-[200px] cursor-pointer"
      >
        <p className="group-hover:opacity-100 opacity-0 absolute inset-0 bg-black/80 flex flex-col items-center justify-center rounded-full pointer-events-none text-cyan-500 font-bold text-2xl text-center transition-all ease-in-out">
          Select Background
        </p>
        <AvatarCoin
          source={appBackground || "/background.jpg"}
          width={100}
          className="w-full aspect-square object-cover"
          alt="User Avatar"
        />
      </label>
      <input
        type="file"
        accept="image/*"
        id="background"
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
      <button
        onClick={handleUpdateSettings}
        disabled={updateSettingsMutation.isPending}
        className="border-[1px] hover:bg-cyan-700 border-slate-600 rounded self-center py-1 px-4 text-slate-300 hover:text-white"
      >
        {updateSettingsMutation.isPending ? "Saving..." : "Save"}
      </button>
    </div>
  );
}

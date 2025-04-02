import { useEffect, useState } from "react";

import { getUserDevices } from "@/lib/utils";
import { useStreamsStore } from "@/stores/useStreamsStore";

export function MediaDevicesInfo({
  onDeviceClick,
}: {
  onDeviceClick: (device: MediaDeviceInfo) => void;
}) {
  const selectedDevices = useStreamsStore((state) => state.selectedDevices);
  const [devices, setDevices] = useState<{
    defaultDevices: MediaDeviceInfo[];
    inputDevices: MediaDeviceInfo[];
    outputDevices: MediaDeviceInfo[];
  }>();

  useEffect(() => {
    const fetchDevices = async () => {
      const defaultDevices = await getUserDevices();
      if (!defaultDevices) return;
      setDevices(defaultDevices);
    };
    fetchDevices();
  }, []);

  function isSelectedDevice(device: MediaDeviceInfo) {
    // Normalize the kind to match the selectedDevices keys
    let normalizedKind = "";
    if (device.kind === "audioinput") normalizedKind = "audioInput";
    else if (device.kind === "audiooutput") normalizedKind = "audioOutput";
    else if (device.kind === "videoinput") normalizedKind = "videoInput";

    // Check if the device is selected in selectedDevices
    const selectedDevice = selectedDevices[normalizedKind];

    // If selectedDevices are set, prioritize them
    if (selectedDevice) {
      return selectedDevice.deviceId === device.deviceId;
    }

    // Fallback to checking default devices if selectedDevices is not set
    return devices?.defaultDevices.find(
      (defaultDevice) => defaultDevice.label === device.label
    );
  }

  return (
    <div className="flex flex-col gap-2 py-2 px-2 bg-black/60 backdrop-blur rounded border-slate-600 border-[1px]">
      <div className="flex flex-col gap-2 px-2">
        <p className="text-blue-500 font-bold">Input Devices</p>
        <ol className="list-disc pl-4">
          {devices?.inputDevices?.map((device) => (
            <li
              onClick={() => onDeviceClick(device)}
              key={device.label}
              className={`${isSelectedDevice(device) ? "text-green-500" : ""} hover:text-green-500 cursor-pointer text-sm`}
            >
              {device.label}
            </li>
          ))}
        </ol>
      </div>
      <div className="flex flex-col gap-2 px-2">
        <p className="text-blue-500 font-bold">Output Devices</p>
        <ol className="list-disc pl-4">
          {devices?.outputDevices?.map((device) => (
            <li
              onClick={() => onDeviceClick(device)}
              key={device.label}
              className={`${isSelectedDevice(device) ? "text-green-500" : ""} hover:text-green-500 cursor-pointer text-sm`}
            >
              {device.label}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

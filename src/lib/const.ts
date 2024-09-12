export const placeholderAvatar =
  "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Default_pfp.svg/340px-Default_pfp.svg.png";

export const groupAvatar = "/groupAvatar.png";

export const videoConstraints: MediaTrackConstraints = {
  width: { min: 640, ideal: 1920, max: 3840 },
  height: { min: 480, ideal: 1080, max: 2160 },
};

export const audioConstraints: MediaTrackConstraints = {
  autoGainControl: false,
  channelCount: 2,
  echoCancellation: false,
  noiseSuppression: false,
  sampleRate: 48000,
  sampleSize: 16,
};

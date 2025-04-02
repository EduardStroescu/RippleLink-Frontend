import { AudioIcon, FileIcon, ImageIcon, VideoIcon } from "@/components/Icons";
import { FileType } from "@/lib/hooks/useCreateMessage";

export function FileUploadOverlayContent({
  setOpen,
  handleInsertFileByType,
}: {
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  handleInsertFileByType: (
    e: React.ChangeEvent<HTMLInputElement>,
    fileType: FileType,
    setOpen: React.Dispatch<React.SetStateAction<boolean>>
  ) => void;
}) {
  if (!setOpen) return null;

  const fileUploadTypes = [
    {
      text: "Add Image",
      id: "Upload Image",
      icon: <ImageIcon />,
      fileType: "image",
    },
    {
      text: "Add Video",
      id: "Upload Video",
      icon: <VideoIcon />,
      fileType: "video",
    },
    {
      text: "Add Audio",
      id: "Upload Audio",
      icon: <AudioIcon />,
      fileType: "audio",
    },
    {
      text: "Add File",
      id: "Upload File",
      icon: <FileIcon width="25px" height="25px" />,
      fileType: "file",
    },
  ];

  return (
    <div className="flex flex-col gap-4 py-3 px-4 bg-black/60 backdrop-blur rounded border-slate-600 border-[1px]">
      {fileUploadTypes.map((type) => {
        return (
          <div key={type.id}>
            <label
              className="flex gap-2 cursor-pointer items-center group group/file text-sm"
              htmlFor={type.id}
            >
              {type.icon}
              {type.text}
            </label>
            <input
              type="file"
              id={type.id}
              accept={`${type.fileType}/*`}
              className="hidden"
              multiple
              onChange={(e) =>
                handleInsertFileByType(e, type.fileType as FileType, setOpen)
              }
            />
          </div>
        );
      })}
    </div>
  );
}

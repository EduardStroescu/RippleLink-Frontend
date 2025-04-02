import { Message } from "@/types/message";

export const DateTag = ({
  shouldDisplay,
  message,
}: {
  shouldDisplay: boolean;
  message: Message;
}) => {
  if (!shouldDisplay || !message?.createdAt) return null;
  return (
    <p className="text-sm text-slate-200 self-center bg-cyan-900/60 py-2 px-3 rounded-sm text-center mt-6">
      {new Date(message.createdAt).toLocaleDateString("en-US", {
        dateStyle: "full",
        timeZone: "Europe/Bucharest",
      })}
    </p>
  );
};

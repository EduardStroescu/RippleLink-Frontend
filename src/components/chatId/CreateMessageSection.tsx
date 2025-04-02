import { memo } from "react";

import { CreateMessageForm } from "@/components/forms/CreateMessageForm";
import { useCreateMessage } from "@/lib/hooks/useCreateMessage";

export const CreateMessageSection = memo(() => {
  const {
    handleSubmitMessage,
    message,
    contentPreview,
    messageType,
    setMessage,
    setGif,
    setContentPreview,
    setMessageType,
  } = useCreateMessage();

  return (
    <CreateMessageForm
      handleSubmitMessage={handleSubmitMessage}
      message={message}
      contentPreview={contentPreview}
      messageType={messageType}
      setMessage={setMessage}
      setGif={setGif}
      setContentPreview={setContentPreview}
      setMessageType={setMessageType}
    />
  );
});

CreateMessageSection.displayName = "CreateMessageSection";

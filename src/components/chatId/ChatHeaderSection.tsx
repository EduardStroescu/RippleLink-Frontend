import { getRouteApi, Link } from "@tanstack/react-router";
import { memo } from "react";

import { ChatHeaderDetails } from "@/components/chatId/ChatHeaderDetails";
import { CustomDialogTrigger } from "@/components/CustomDialogTrigger";
import { SearchUsersForm } from "@/components/forms/SearchUsersForm";
import {
  AddUsersIcon,
  CallIcon,
  InfoIcon,
  VideoCallIcon,
} from "@/components/Icons";
import { groupAvatar, placeholderAvatar } from "@/lib/const";
import { useChatName } from "@/lib/hooks/useChatName";
import { useIsInterlocutorOnline } from "@/lib/hooks/useIsInterlocutorOnline";
import { useCallStoreActions } from "@/stores/useCallStore";
import { Chat } from "@/types/chat";
import { PublicUser } from "@/types/user";

const Route = getRouteApi("/chat/$chatId");

export const ChatHeaderSection = memo(function ChatHeaderSection({
  isDmChat,
  interlocutors,
  currentChat,
  isAbleToCall,
}: {
  isDmChat: boolean;
  interlocutors: PublicUser[];
  currentChat: Chat | undefined;
  isAbleToCall: boolean;
}) {
  const { chatId } = Route.useParams();
  const { startCall } = useCallStoreActions();

  const {
    isEditingChatName,
    chatName,
    setChatName,
    handleResetInput,
    handleEditChatName,
  } = useChatName({ currentChat, isDmChat, interlocutors });
  const { isInterlocutorOnline, lastSeen } = useIsInterlocutorOnline({
    interlocutor: interlocutors[0],
    chatId,
    isDmChat,
  });

  const handleStartCall = (videoEnabled?: boolean) => {
    if (!currentChat || !isAbleToCall) return;
    startCall(currentChat, videoEnabled);
  };

  return (
    <div className="flex justify-between p-2 items-center">
      {isDmChat ? (
        <ChatHeaderDetails
          avatarUrl={interlocutors[0]?.avatarUrl || placeholderAvatar}
          name={interlocutors[0]?.displayName || "User"}
          lastSeen={lastSeen}
          isInterlocutorOnline={isInterlocutorOnline}
        />
      ) : (
        <ChatHeaderDetails
          avatarUrl={currentChat?.avatarUrl || groupAvatar}
          name={chatName}
          handleEditChatName={handleEditChatName}
          isEditingChatName={isEditingChatName}
          setChatName={setChatName}
          handleResetInput={handleResetInput}
        />
      )}
      <div className="mr-0.5 sm:mr-4 flex gap-2 sm:gap-4">
        {isAbleToCall && (
          <>
            <button
              onClick={() => handleStartCall()}
              className="group"
              title="Start Call"
              aria-label="Start Call"
            >
              <CallIcon />
            </button>
            <button
              onClick={() => handleStartCall(true)}
              className="group"
              title="Start Video Call"
              aria-label="Start Video Call"
            >
              <VideoCallIcon />
            </button>
          </>
        )}
        <CustomDialogTrigger
          header="Create Group Chat"
          dialogContent={
            <SearchUsersForm
              existingChatUsers={interlocutors.map((person) => ({
                _id: person._id,
                displayName: person.displayName,
              }))}
            />
          }
          className="group"
          title="Add Users to Chat"
          aria-label="Add Users to Chat"
        >
          <AddUsersIcon />
        </CustomDialogTrigger>
        <Link
          to="/chat/$chatId/details"
          preload={false}
          params={{ chatId }}
          className="group"
          title="Toggle Chat Details"
          aria-label="Toggle Chat Details"
        >
          <InfoIcon />
        </Link>
      </div>
    </div>
  );
});

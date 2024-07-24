import { AddIcon } from "./Icons";

export function CreateChatButton() {
  const handleCreateChat = () => {
    console.log("Create chat");
  };
  return (
    <button onClick={handleCreateChat} aria-label="add-chat" className="group">
      <AddIcon />
    </button>
  );
}

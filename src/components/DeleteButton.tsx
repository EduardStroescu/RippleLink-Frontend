import { TrashIcon } from "./Icons";

export function DeleteButton({
  onClick,
  className,
}: {
  onClick: () => void;
  className?: string;
}) {
  return (
    <button className={className} onClick={onClick}>
      <TrashIcon />
    </button>
  );
}

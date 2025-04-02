import { TrashIcon } from "@/components/Icons";

type DeleteButtonProps = JSX.IntrinsicElements["button"];

export function DeleteButton({
  onClick,
  className,
  ...props
}: DeleteButtonProps) {
  return (
    <button className={className} onClick={onClick} {...props}>
      <TrashIcon />
    </button>
  );
}

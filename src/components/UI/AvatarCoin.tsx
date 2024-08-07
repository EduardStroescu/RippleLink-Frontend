import { cn } from "@/lib/utils";

export function AvatarCoin({
  source,
  width = 50,
  alt,
  className,
}: {
  source: string;
  width: number;
  alt: string;
  className?: string;
}) {
  return (
    <img
      src={source}
      width={width}
      alt={`${alt}'s avatar`}
      className={cn("p-1 aspect-square object-cover rounded-full", className)}
    />
  );
}

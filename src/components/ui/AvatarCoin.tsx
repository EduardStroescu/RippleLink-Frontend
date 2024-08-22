import { cn } from "@/lib/utils";

export function AvatarCoin({
  source,
  width = 50,
  alt,
  className,
  shouldInvalidate = false,
}: {
  source: string;
  width?: number;
  alt: string;
  className?: string;
  shouldInvalidate?: boolean;
}) {
  function invalidateInterval() {
    return new Date().getHours();
  }
  const src = shouldInvalidate ? `${source}?v=${invalidateInterval()}` : source;
  return (
    <img
      src={src}
      width={width}
      alt={`${alt}'s avatar`}
      className={cn("p-1 aspect-square object-cover rounded-full", className)}
    />
  );
}

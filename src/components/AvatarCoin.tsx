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
      alt={`${alt} avatar`}
      className={`${className} p-1 rounded-full`}
    />
  );
}

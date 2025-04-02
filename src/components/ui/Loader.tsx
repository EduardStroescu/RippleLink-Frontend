export const Loader = ({ active = true }: { active?: boolean }) => {
  if (!active) return null;

  return (
    <div className="p-1 animate-spin bg-gradient-to-bl from-pink-400 via-purple-400 to-indigo-600 w-14 h-14 aspect-square rounded-full">
      <div className="rounded-full h-full w-full bg-gray-950/95" />
    </div>
  );
};

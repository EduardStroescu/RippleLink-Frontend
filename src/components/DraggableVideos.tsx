import { useAppStore } from "@/stores/useAppStore";
import { useCallStore } from "@/stores/useCallStore";
import { useUserStore } from "@/stores/useUserStore";
import { User } from "@/types/user";
import { useCallback, useRef, useState, useEffect } from "react";

interface Position {
  x: number;
  y: number;
}

interface PositionMap {
  [key: string]: Position;
}

export function DraggableVideos() {
  const appGlow = useAppStore((state) => state.appGlow);
  const user = useUserStore((state) => state.user);
  const streams = useCallStore((state) => state.streams);
  const currentStreamsExceptUser = Object.entries(streams)
    .filter(([userId]) => userId !== user?._id)
    .map(([userId, stream]) => ({ userId, source: stream }));

  const [dragging, setDragging] = useState<User["_id"] | null>(null);
  const [positions, setPositions] = useState<PositionMap>({});
  const divRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const startDrag = useCallback(
    (e: React.MouseEvent<HTMLDivElement>, id: string) => {
      setDragging(id);
      e.preventDefault();
    },
    []
  );

  const onDrag = useCallback(
    (e: MouseEvent) => {
      if (dragging) {
        const element = divRefs.current[dragging];
        if (element) {
          const parentElement = element.parentElement;
          if (parentElement) {
            const parentRect = parentElement.getBoundingClientRect();
            const elementRect = element.getBoundingClientRect();

            const mouseXRelativeToParent = e.clientX - parentRect.left;
            const mouseYRelativeToParent = e.clientY - parentRect.top;

            const newX = Math.max(
              -elementRect.width,
              Math.min(
                mouseXRelativeToParent - elementRect.width / 2,
                parentRect.width - elementRect.width + elementRect.width
              )
            );
            const newY = Math.max(
              -elementRect.height / 2,
              Math.min(
                mouseYRelativeToParent - elementRect.height / 2,
                parentRect.height - elementRect.height + elementRect.height / 2
              )
            );

            setPositions((prev) => ({
              ...prev,
              [dragging]: { x: newX, y: newY },
            }));
          }
        }
      }
    },
    [dragging]
  );

  const stopDrag = useCallback(() => {
    setDragging(null);
  }, []);

  useEffect(() => {
    if (dragging) {
      window.addEventListener("mousemove", onDrag);
      window.addEventListener("mouseup", stopDrag);
      return () => {
        window.removeEventListener("mousemove", onDrag);
        window.removeEventListener("mouseup", stopDrag);
      };
    }
  }, [dragging, onDrag, stopDrag]);

  // Adjust div to remain in the viewport after resize
  useEffect(() => {
    const adjustPositionsOnResize = () => {
      Object.keys(divRefs.current).forEach((key) => {
        const element = divRefs.current[key];
        if (element) {
          const parentElement = element.parentElement;
          if (parentElement) {
            const parentRect = parentElement.getBoundingClientRect();
            const elementRect = element.getBoundingClientRect();

            let newX = positions[key]?.x || 0;
            let newY = positions[key]?.y || 0;

            // Adjust X position
            if (newX + elementRect.width > parentRect.width) {
              newX = parentRect.width - elementRect.width;
            }
            if (newX < 0) {
              newX = 0;
            }

            // Adjust Y position
            if (newY + elementRect.height > parentRect.height) {
              newY = parentRect.height - elementRect.height;
            }
            if (newY < 0) {
              newY = 0;
            }

            setPositions((prev) => ({
              ...prev,
              [key]: { x: newX, y: newY },
            }));
          }
        }
      });
    };

    window.addEventListener("resize", adjustPositionsOnResize);
    return () => {
      window.removeEventListener("resize", adjustPositionsOnResize);
    };
  }, [positions]);

  const isParticipantSharingVideo = (userId: string | undefined) => {
    if (!userId) return false;
    const stream = streams[userId];

    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack && videoTrack.readyState === "live") {
        return true;
      }
    }

    return false;
  };
  if (!streams) return null;
  return (
    <>
      {currentStreamsExceptUser.map((stream, idx) => {
        const { userId, source } = stream;
        const position = positions[userId] || { x: 0, y: 5 + idx * 2 };
        if (!isParticipantSharingVideo(userId)) {
          return null;
        } else
          return (
            <div
              ref={(el) => (divRefs.current[userId] = el)}
              onMouseDown={(e) => startDrag(e, userId)}
              key={userId}
              className="absolute shadow-lg shadow-cyan-500 top-0 left-0 aspect-square w-[150px] h-[150px] rounded-[50%] cursor-grab"
              style={{
                top: `${position.y}px`,
                left: `${position.x}px`,
                boxShadow: `0 10px 15px -3px ${appGlow}, 0 4px 6px -2px ${appGlow}`,
              }}
            >
              <video
                className="aspect-square object-cover object-center rounded-[50%]"
                ref={(el) => {
                  if (el) {
                    if (el.srcObject !== source) {
                      el.srcObject = source;
                      el.play();
                    }
                  }
                }}
              />
            </div>
          );
      })}
    </>
  );
}

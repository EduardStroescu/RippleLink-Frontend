import { useAppStore } from "@/stores/useAppStore";
import { useCallStore } from "@/stores/useCallStore";
import { useUserStore } from "@/stores/useUserStore";
import { PublicUser } from "@/types/user";
import { useCallback, useRef, useState, useEffect, useMemo, memo } from "react";
import { CloseIcon } from "./Icons";
import { useLocation } from "@tanstack/react-router";
import {
  useStreamsStore,
  useStreamsStoreActions,
} from "@/stores/useStreamsStore";

interface Position {
  x: number;
  y: number;
}

interface PositionMap {
  [key: string]: Position;
}

export const DraggableVideos = memo(() => {
  const location = useLocation();
  const appGlow = useAppStore((state) => state.appGlow);
  const user = useUserStore((state) => state.user);
  const streams = useStreamsStore((state) => state.streams);
  const currentCall = useCallStore((state) => state.currentCall);
  const { toggleStreamPopUp } = useStreamsStoreActions();
  const displayedStreams = useMemo(
    () =>
      Object.entries(streams)
        .filter(
          ([userId]) =>
            userId !== user?._id && streams[userId].shouldDisplayPopUp !== false
        )
        .map(([userId, content]) => ({ userId, source: content.stream })),

    [streams, user?._id]
  );

  const [dragging, setDragging] = useState<PublicUser["_id"] | null>(null);
  const [positions, setPositions] = useState<PositionMap>({});
  const divRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const removeDivRef = useRef<HTMLDivElement | null>(null);
  const videoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({});

  const startDrag = useCallback(
    (
      e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>,
      id: string
    ) => {
      setDragging(id);
      e.preventDefault();
    },
    []
  );

  const onDrag = useCallback(
    (e: MouseEvent | TouchEvent) => {
      if (dragging) {
        const element = divRefs.current[dragging];
        if (element) {
          const parentElement = element.parentElement;
          if (parentElement) {
            const parentRect = parentElement.getBoundingClientRect();
            const elementRect = element.getBoundingClientRect();
            const removeDivRect =
              removeDivRef?.current?.getBoundingClientRect();

            const mouseXRelativeToParent =
              e instanceof MouseEvent
                ? e.clientX - parentRect.left
                : e.touches[0].clientX - parentRect.left;
            const mouseYRelativeToParent =
              e instanceof MouseEvent
                ? e.clientY - parentRect.top
                : e.touches[0].clientY - parentRect.top;

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

            if (!removeDivRef?.current) return;
            if (
              elementRect &&
              removeDivRect &&
              removeDivRect.left < elementRect.right &&
              removeDivRect.right > elementRect.left &&
              removeDivRect.top < elementRect.bottom &&
              removeDivRect.bottom > elementRect.top
            ) {
              element.style.opacity = "0.5";
              removeDivRef.current.style.backgroundColor =
                "rgba(127, 29, 29,0.7)";
            } else {
              element.style.opacity = "1";
              removeDivRef.current.style.backgroundColor = "rgba(0,0,0,0.7)";
            }
          }
        }
      }
    },
    [dragging]
  );

  const stopDrag = useCallback(() => {
    if (dragging && removeDivRef.current) {
      const element = divRefs.current[dragging];
      if (!element) return;
      const removeDivRect = removeDivRef.current.getBoundingClientRect();
      const elementRect = element?.getBoundingClientRect();

      if (
        elementRect &&
        removeDivRect.left < elementRect.right &&
        removeDivRect.right > elementRect.left &&
        removeDivRect.top < elementRect.bottom &&
        removeDivRect.bottom > elementRect.top
      ) {
        // Remove the stream from the list
        element.style.transform = "scale(0)";
        setTimeout(() => {
          toggleStreamPopUp(dragging);
          delete displayedStreams[dragging];
          videoRefs.current[dragging]?.pause();
          videoRefs.current[dragging] = null;
        }, 500);
      }
    }
    setDragging(null);
  }, [displayedStreams, dragging, toggleStreamPopUp]);

  useEffect(() => {
    if (dragging) {
      window.addEventListener("mousemove", onDrag);
      window.addEventListener("touchmove", onDrag);
      window.addEventListener("mouseup", stopDrag);
      window.addEventListener("touchend", stopDrag);
      return () => {
        window.removeEventListener("mousemove", onDrag);
        window.removeEventListener("touchmove", onDrag);
        window.removeEventListener("mouseup", stopDrag);
        window.removeEventListener("touchend", stopDrag);
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
    const stream = streams[userId]?.stream;

    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack && videoTrack.readyState === "live") {
        return true;
      }
    }

    return false;
  };

  if (
    !streams ||
    !currentCall ||
    location.pathname === `/chat/${currentCall.chatId._id}`
  )
    return null;
  return (
    <>
      {displayedStreams.map((stream, idx) => {
        const { userId, source } = stream;
        const position = positions[userId] || { x: 0, y: 5 + idx * 2 };
        if (!isParticipantSharingVideo(userId)) {
          return null;
        } else
          return (
            <div
              ref={(el) => (divRefs.current[userId] = el)}
              onMouseDown={(e) => startDrag(e, userId)}
              onTouchStart={(e) => startDrag(e, userId)}
              key={userId}
              className="absolute z-[999] shadow-lg shadow-cyan-500 top-0 left-0 aspect-square w-[120px] h-[120px] sm:w-[150px] sm:h-[150px] rounded-[50%] cursor-grab animate-in zoom-in-0 transition-transform duration-500 ease-in-out bg-black/70"
              style={{
                top: `${position.y}px`,
                left: `${position.x}px`,
                boxShadow: `0 10px 15px -3px ${appGlow}, 0 4px 6px -2px ${appGlow}`,
              }}
            >
              <video
                className="w-full h-full object-cover object-center rounded-[50%]"
                playsInline
                muted
                ref={(el) => {
                  if (el) {
                    videoRefs.current[userId] = el;
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
      {dragging && (
        <div
          ref={removeDivRef}
          className="absolute bottom-2 left-1/2 -translate-x-[50%] bg-black/70 flex justify-center items-center w-[40px] h-[40px] md:w-[80px] md:h-[80px] rounded-[50%]"
        >
          <CloseIcon className="w-[20px] h-[20px] md:w-[30px] md:h-[30px]" />
        </div>
      )}
    </>
  );
});

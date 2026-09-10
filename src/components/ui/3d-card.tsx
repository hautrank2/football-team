"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { cn } from "@/lib/utils";

const MouseEnterContext = createContext<
  [boolean, React.Dispatch<React.SetStateAction<boolean>>] | undefined
>(undefined);

export interface CardContainerProps {
  children?: React.ReactNode;
  className?: string;
  containerClassName?: string;
}

// Tilts its contents toward the pointer. Purely decorative: it carries no role
// and no tab stop, so the links and buttons inside keep their own semantics and
// keyboard order. Touch devices never fire mousemove, so they just get a flat card.
export const CardContainer = ({
  children,
  className,
  containerClassName,
}: CardContainerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMouseEntered, setIsMouseEntered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const { left, top, width, height } =
      containerRef.current.getBoundingClientRect();
    const x = (e.clientX - left - width / 2) / 25;
    const y = (e.clientY - top - height / 2) / 25;
    containerRef.current.style.transform = `rotateY(${x}deg) rotateX(${-y}deg)`;
  };

  const handleMouseLeave = () => {
    setIsMouseEntered(false);
    if (containerRef.current)
      containerRef.current.style.transform = "rotateY(0deg) rotateX(0deg)";
  };

  return (
    <MouseEnterContext.Provider value={[isMouseEntered, setIsMouseEntered]}>
      <div
        className={cn("flex items-center justify-center py-20", containerClassName)}
        style={{ perspective: "1000px" }}
      >
        <div
          className={cn(
            "relative flex items-center justify-center transition-all duration-200 ease-linear",
            className,
          )}
          onMouseEnter={() => setIsMouseEntered(true)}
          onMouseLeave={handleMouseLeave}
          onMouseMove={handleMouseMove}
          ref={containerRef}
          style={{ transformStyle: "preserve-3d" }}
        >
          {children}
        </div>
      </div>
    </MouseEnterContext.Provider>
  );
};

export interface CardBodyProps {
  children: React.ReactNode;
  className?: string;
}

export const CardBody = ({ children, className }: CardBodyProps) => (
  <div
    className={cn(
      "h-96 w-96 [transform-style:preserve-3d] [&>*]:[transform-style:preserve-3d]",
      className,
    )}
  >
    {children}
  </div>
);

export type CardItemProps = {
  as?: React.ElementType;
  children: React.ReactNode;
  className?: string;
  translateX?: number;
  translateY?: number;
  translateZ?: number;
  rotateX?: number;
  rotateY?: number;
  rotateZ?: number;
} & Record<string, unknown>;

// One layer of the card. Every ancestor up to the perspective root must keep
// `transform-style: preserve-3d` (and must NOT be `overflow-hidden`, which
// silently flattens it) or translateZ renders as nothing.
export const CardItem = ({
  as: Tag = "div",
  children,
  className,
  translateX = 0,
  translateY = 0,
  translateZ = 0,
  rotateX = 0,
  rotateY = 0,
  rotateZ = 0,
  ...rest
}: CardItemProps) => {
  const ref = useRef<HTMLElement>(null);
  const [isMouseEntered] = useMouseEnter();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = isMouseEntered
      ? `translateX(${translateX}px) translateY(${translateY}px) translateZ(${translateZ}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) rotateZ(${rotateZ}deg)`
      : "translateX(0px) translateY(0px) translateZ(0px) rotateX(0deg) rotateY(0deg) rotateZ(0deg)";
  }, [
    isMouseEntered,
    translateX,
    translateY,
    translateZ,
    rotateX,
    rotateY,
    rotateZ,
  ]);

  // Children are SPREAD, not passed as one array argument. JSX siblings arrive
  // here already collected into an array; handing that array to createElement as
  // a single child makes React treat static siblings as a dynamic list and warn
  // that each needs a `key`. Spreading restores them as separate arguments.
  return React.createElement(
    Tag,
    {
      ref,
      className: cn("w-fit transition duration-200 ease-linear", className),
      ...rest,
    },
    ...(Array.isArray(children) ? children : [children]),
  );
};

export const useMouseEnter = () => {
  const context = useContext(MouseEnterContext);
  if (context === undefined)
    throw new Error("useMouseEnter must be used within a <CardContainer>");
  return context;
};

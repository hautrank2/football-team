"use client";

import type { ReactNode } from "react";
import { CardContainer } from "@/components/ui/3d-card";
import { cn } from "@/lib/utils";

// The 3D shell every player card sits in: a perspective root that tilts the card
// toward the pointer, sized to fill its grid cell instead of the library's
// default fixed 24rem box and 5rem of padding.
//
// Deliberately no <CardBody>/<CardItem> layers. Giving the portrait its own
// translateZ magnifies it (perspective 1000px turns 50px into ~5% bigger), which
// pushed it past the card frame and left the border showing behind it. The card
// tilts as one piece instead, so it stays clipped and keeps a single edge.
export const TiltCard = ({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) => (
  <CardContainer
    containerClassName="h-full py-0"
    className={cn("h-full w-full", className)}
  >
    {children}
  </CardContainer>
);

"use client";

import type { ComponentType, SVGProps } from "react";
import {
  FacebookIcon,
  InstagramIcon,
  LinkedinIcon,
  LinkIcon,
} from "@/components/player/social-icons";
import { socialTypeLabel } from "@/lib/player-meta";
import { cn } from "@/lib/utils";

export type SocialItem = { type: string; link: string };

// Brand icon for a social platform (falls back to a link glyph for OTHER/unknown).
export const socialIcon = (
  type: string,
): ComponentType<SVGProps<SVGSVGElement>> => {
  switch (type) {
    case "FACEBOOK":
      return FacebookIcon;
    case "INSTAGRAM":
      return InstagramIcon;
    case "LINKEDIN":
      return LinkedinIcon;
    default:
      return LinkIcon;
  }
};

// A row of social links rendered as clickable icons, each opening the platform in
// a new tab. `stopPropagation` so it works even inside a clickable card.
export const SocialLinks = ({
  socials,
  className,
  size = "sm",
}: {
  socials?: SocialItem[] | null;
  className?: string;
  size?: "sm" | "md";
}) => {
  const items = socials?.filter((s) => s.link) ?? [];
  if (items.length === 0) return null;

  return (
    <div className={cn("flex flex-wrap items-center gap-1.5", className)}>
      {items.map((s, i) => {
        const Icon = socialIcon(s.type);
        return (
          <a
            key={i}
            href={s.link}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            title={socialTypeLabel(s.type)}
            aria-label={socialTypeLabel(s.type)}
            className={cn(
              "flex items-center justify-center text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary",
            )}
          >
            <Icon className={size === "md" ? "size-5" : "size-4"} />
          </a>
        );
      })}
    </div>
  );
};

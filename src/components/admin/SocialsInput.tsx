"use client";

import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { socialIcon } from "@/components/player/social-links";
import { SOCIAL_TYPE_OPTIONS } from "@/lib/player-meta";

export type SocialItem = { type: string; link: string };

const MAX_SOCIALS = 4;

// Controlled editor for a list of {type, link} social links. Add/remove rows;
// each row is a platform select + a link input.
export const SocialsInput = ({
  value,
  onChange,
}: {
  value: SocialItem[];
  onChange: (v: SocialItem[]) => void;
}) => {
  const update = (i: number, patch: Partial<SocialItem>) =>
    onChange(value.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));
  const add = () => onChange([...value, { type: "FACEBOOK", link: "" }]);
  const remove = (i: number) => onChange(value.filter((_, idx) => idx !== i));

  return (
    <div className="flex flex-col gap-2">
      {value.map((s, i) => {
        return (
          <div key={i} className="flex gap-2">
            <Select
              value={s.type}
              onValueChange={(v) => update(i, { type: v })}
            >
              <SelectTrigger className="w-40 shrink-0">
                {/* SelectValue already renders the selected option's icon + label
                    (from its ItemText) — don't add another icon here. */}
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SOCIAL_TYPE_OPTIONS.map((o) => {
                  const OptIcon = socialIcon(o.value);
                  return (
                    <SelectItem key={o.value} value={o.value}>
                      <span className="flex items-center gap-2">
                        <OptIcon className="size-4 shrink-0 text-muted-foreground" />
                        {o.label}
                      </span>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            <Input
              value={s.link}
              onChange={(e) => update(i, { link: e.target.value })}
              placeholder="https://…"
              className="flex-1"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="shrink-0"
              aria-label="Xóa"
              onClick={() => remove(i)}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        );
      })}
      {value.length < MAX_SOCIALS ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="self-start"
          onClick={add}
        >
          <Plus className="size-4" />
          Thêm mạng xã hội
        </Button>
      ) : (
        <p className="text-xs text-muted-foreground">Tối đa {MAX_SOCIALS} mạng xã hội.</p>
      )}
    </div>
  );
};

"use client";

import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useUpsertAttribute } from "@/hooks";
import { ATTRIBUTE_GROUPS, ATTR_KEYS, type AttrField, type AttrKey } from "@/lib/attribute-meta";
import { cn } from "@/lib/utils";
import type { AttributeUpsertDto, PlayerAttributeModel } from "@/types";

type Values = Record<AttrKey, number>;

// Every field has a concrete numeric default so the range thumbs land correctly
// (a range input with no value would otherwise jump to its midpoint).
const minOf = (f: AttrField) => (f.max === 5 ? 1 : 0);

const FIELD_BY_KEY = new Map<AttrKey, AttrField>(
  ATTRIBUTE_GROUPS.flatMap((g) => g.fields).map((f) => [f.key, f])
);

const toValues = (attr?: PlayerAttributeModel | null): Values =>
  ATTR_KEYS.reduce((acc, key) => {
    const v = attr?.[key];
    acc[key] = v == null ? minOf(FIELD_BY_KEY.get(key)!) : Number(v);
    return acc;
  }, {} as Values);

export type AttributeFormProps = {
  playerId: string;
  initial?: PlayerAttributeModel | null;
};

// Grid of 0–99 rating sliders grouped by category (GK ratings included). Values
// are dragged, never typed.
export const AttributeForm = ({ playerId, initial }: AttributeFormProps) => {
  const form = useForm<Values>({ defaultValues: toValues(initial) });
  const mutation = useUpsertAttribute();
  const values = form.watch();

  const onSubmit = form.handleSubmit((v) => {
    const dto = ATTR_KEYS.reduce((acc, key) => {
      acc[key] = Number(v[key]);
      return acc;
    }, {} as Record<AttrKey, number>);

    mutation.mutate(
      { id: playerId, body: dto as unknown as AttributeUpsertDto },
      {
        onSuccess: () => toast.success("Đã lưu chỉ số"),
        onError: () => toast.error("Có lỗi xảy ra, vui lòng thử lại"),
      }
    );
  });

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      <fieldset disabled={mutation.isPending} className="grid gap-4 sm:grid-cols-2">
        {ATTRIBUTE_GROUPS.map((group) => (
          <Card key={group.title}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">
                {group.title}
                {group.gk ? (
                  <span className="ml-2 text-xs font-normal text-muted-foreground">
                    (chỉ thủ môn)
                  </span>
                ) : null}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {group.fields.map((f) => {
                const min = minOf(f);
                const val = Number(values[f.key] ?? min);
                return (
                  <div key={f.key} className="space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <Label htmlFor={f.key} className="text-xs text-muted-foreground">
                        {f.label}
                      </Label>
                      <span
                        className={cn(
                          "min-w-8 rounded px-1.5 text-center text-xs font-semibold tabular-nums",
                          val >= 80
                            ? "bg-primary/15 text-primary"
                            : val >= 60
                              ? "bg-muted text-foreground"
                              : "text-muted-foreground"
                        )}
                      >
                        {val}
                      </span>
                    </div>
                    <input
                      id={f.key}
                      type="range"
                      min={min}
                      max={f.max}
                      step={1}
                      className="h-2 w-full cursor-pointer accent-primary"
                      {...form.register(f.key, { valueAsNumber: true })}
                    />
                  </div>
                );
              })}
            </CardContent>
          </Card>
        ))}
      </fieldset>

      <div className="flex justify-end">
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? "Đang lưu…" : "Lưu chỉ số"}
        </Button>
      </div>
    </form>
  );
};

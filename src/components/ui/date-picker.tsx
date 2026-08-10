"use client";

import { format, isValid, parse } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export type DatePickerProps = {
  value?: string; // yyyy-MM-dd
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  // Month the calendar opens at when nothing is selected yet. Defaults to today;
  // pass e.g. `new Date(2000, 0)` for birthday fields so they don't open decades off.
  defaultMonth?: Date;
};

const toDate = (v?: string): Date | undefined => {
  if (!v) return undefined;
  const d = parse(v, "yyyy-MM-dd", new Date());
  return isValid(d) ? d : undefined;
};

export const DatePicker = ({
  value,
  onChange,
  placeholder = "Chọn ngày",
  disabled,
  defaultMonth,
}: DatePickerProps) => {
  const [open, setOpen] = useState(false);
  const date = toDate(value);
  const currentYear = new Date().getFullYear();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-start font-normal",
            !date && "text-muted-foreground",
          )}
        >
          <CalendarIcon className="size-4" />
          {date ? format(date, "dd/MM/yyyy") : placeholder}
        </Button>
      </PopoverTrigger>
      {/* z-[60] keeps the calendar above the dialog (z-50) it may open inside. */}
      <PopoverContent align="start" className="z-[60] w-auto p-0">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(d) => {
            if (!d) return;
            onChange(format(d, "yyyy-MM-dd"));
            setOpen(false);
          }}
          captionLayout="dropdown"
          startMonth={new Date(1950, 0)}
          endMonth={new Date(currentYear, 11)}
          defaultMonth={date ?? defaultMonth ?? new Date()}
          autoFocus
          className="min-w-[280px]"
        />
      </PopoverContent>
    </Popover>
  );
};

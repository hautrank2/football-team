"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export type PaginationProps = {
  page: number;
  totalPage: number;
  total: number;
  onChange: (page: number) => void;
};

export const Pagination = ({ page, totalPage, total, onChange }: PaginationProps) => (
  <div className="flex items-center justify-between pt-4 text-sm text-muted-foreground">
    <span>{total} bản ghi</span>
    <div className="flex items-center gap-2">
      <Button variant="outline" size="icon" disabled={page <= 1} onClick={() => onChange(page - 1)}>
        <ChevronLeft className="size-4" />
      </Button>
      <span>
        Trang {page}/{totalPage}
      </span>
      <Button
        variant="outline"
        size="icon"
        disabled={page >= totalPage}
        onClick={() => onChange(page + 1)}
      >
        <ChevronRight className="size-4" />
      </Button>
    </div>
  </div>
);

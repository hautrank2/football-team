import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { MatchVoteModel } from "@/types";
import { voterName } from "./utils";

// The per-day detail list — one row per voter (name, guests, note) plus the
// total. Shared by the Chi tiết tooltip, the detail dialog, and the vote dialog.
export const VoterRows = ({ votes }: { votes: MatchVoteModel[] }) => {
  if (votes.length === 0)
    return <p className="text-xs text-muted-foreground">Chưa có ai vote.</p>;
  const heads = votes.reduce((s, v) => s + 1 + v.guestCount, 0);
  return (
    <Table className="text-xs">
      <TableHeader>
        <TableRow>
          <TableHead className="h-8 px-2">Cầu thủ</TableHead>
          <TableHead className="h-8 px-2 text-center">Khách</TableHead>
          <TableHead className="h-8 px-2">Ghi chú</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {votes.map((v) => (
          <TableRow key={v.id}>
            <TableCell className="px-2 py-1 font-medium">
              {voterName(v)}
            </TableCell>
            <TableCell className="px-2 py-1 text-center">
              {v.guestCount || "—"}
            </TableCell>
            <TableCell className="px-2 py-1 text-muted-foreground">
              {v.note || "—"}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell className="px-2 py-1" colSpan={3}>
            Tổng: {heads} suất
          </TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  );
};

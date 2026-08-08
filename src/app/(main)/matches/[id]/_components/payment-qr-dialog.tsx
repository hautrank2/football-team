"use client";

import { QrCode } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { formatVnd } from "@/lib/format";

// Shows the club's payment QR (public/images/pay_qr.jpg) in a popup so a player
// can scan and transfer. `amount` (the viewer's amountDue) is shown when known.
export const PaymentQrDialog = ({ amount }: { amount?: number }) => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <QrCode className="size-4" />
          Thanh toán
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Quét mã để thanh toán</DialogTitle>
          <DialogDescription>
            {amount != null && amount > 0
              ? `Số tiền cần trả: ${formatVnd(amount)}`
              : "Mở app ngân hàng và quét mã QR bên dưới."}
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-center">
          <Image
            src="/images/pay_qr.jpg"
            alt="Mã QR thanh toán"
            width={1282}
            height={1464}
            className="h-auto w-full max-w-[280px] rounded-lg border"
            priority
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

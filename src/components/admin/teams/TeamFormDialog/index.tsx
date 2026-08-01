"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ClearableInput } from "@/components/admin/ClearableInput";
import { useTeamFormDialog } from "./hook";
import type { TeamFormDialogProps } from "./type";

export type { TeamFormDialogProps };

export const TeamFormDialog = (props: TeamFormDialogProps) => {
  const { open, onOpenChange } = props;
  const { form, onSubmit, isLoading, isEdit, clear, close } = useTeamFormDialog(props);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Sửa đội" : "Thêm đội"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
            <fieldset disabled={isLoading} className="flex flex-col gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên đội *</FormLabel>
                    <FormControl>
                      <Input placeholder="Tên đội" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="shortName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên viết tắt</FormLabel>
                    <FormControl>
                      <ClearableInput placeholder="VD: MCI" {...field} onClear={() => clear("shortName")} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mô tả</FormLabel>
                    <FormControl>
                      <ClearableInput placeholder="Mô tả ngắn" {...field} onClear={() => clear("description")} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </fieldset>

            <DialogFooter>
              <Button type="button" variant="outline" disabled={isLoading} onClick={close}>
                Hủy
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Đang lưu…" : "Lưu"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

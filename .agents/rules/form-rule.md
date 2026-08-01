- Quy định về tạo Form trong Dialog cho tính năng A
- Phải có ít nhất 2 component đặt vào file index.tsx
  - Component Dialog: Phải chứa nút Close (phải góc top-right)
  - Component Form:
    - Phải có ít nhất 2 nút Cancel, Submit
    - Phải có state loading khi submit, disable hết tất cả field và buttons
    - Ưu tiên sử TanstackQuery khi call API, trong onSucess và onError, phải có toast hiển thị

```ts
export const AFormDialog = () => {
    return <Dialog>
      <AForm
        {...props}
        schema={schema}
        isRefetchRef={isRefetchRef}
        ref={wlRef}
      />
    </Dialog>
};

export const AForm = () => {
    return <Box component="form" onSubmit={form.handleSubmit(handleSubmit)} noValidate>
    <DialogTitle>
        {props.edit
        ? t("service:face:action:selectFace")
        : t("service:face:action:addFace")}
    </DialogTitle>

    <DialogContent></DialogContent>

    <DialogActions
        sx={{
            borderTop: 1,
            borderColor: "divider",
            position: "sticky",
            bottom: 0,
            backgroundColor: "background.paper",
        }}
    >
       //1 nut Cancel, 1 Nut Submit
      </DialogActions>
    </Box>
}
```

- Một số props bắt buộc đặt vào file type.ts

```ts
export type AFormProps = {
  isEdit: boolean;
  defaultValues: Partial<T>;
  onStartSubmit: () => void;
  onSuccess: (response: T) => void;
  onError: (error: unknow) => void;
};

export type AFormDialogProps = AFormProps & {};
```

- Quy định về field:
  - Với mỗi Field là optional đều phải nút Clear
  - Hiển thị màu và text (nếu có) khi có error

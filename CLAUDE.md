# FDM-FE project rules

## Error display: form/modal vs toast

- Field-level validation errors (required, format, min/max...) show **inline at the input**, via each field's `error` prop (react-hook-form `formState.errors` or a zod resolver message). This is the only case where an error message may appear inside a form or modal.
- Submit/mutation failures (API errors — e.g. "Mã vật tư đã tồn tại", network errors, 500s) must **not** render an inline error block (e.g. `ErrorState`) inside a form or modal/dialog. Show them with `toast.error(message, title)` instead, and keep the form open with the user's input intact so they can fix and retry.
- Pattern to follow in `onSubmit`:
  ```tsx
  try {
    await mutation.mutateAsync(values);
    toast.success('...');
    onClose();
  } catch (error) {
    toast.error(toAppError(error).message, 'X thất bại');
  }
  ```
- `ErrorState` (the inline banner-with-retry component) stays reserved for **read** failures — e.g. a failed query behind `StateBoundary` on a page — not for form/mutation submit failures.

## Number inputs: grouped-thousands display, raw value to BE

- For numeric fields that represent money or large counts (unit price, tree count, and similar — not small decimal measurements like quantity/height/soil moisture), use `NumberInput` (`src/components/ui/NumberInput.tsx`) instead of `Input type="number"`.
- `NumberInput` displays the value grouped by 3 digits with commas (e.g. `32,000`) as the user types, but its `onChange` always returns the raw `number | null` — no comma, no formatting. That raw number is what goes into the form state and gets sent to BE. **Never format the value before sending it to the API** — formatting is FE display-only.
- Because it needs to intercept raw digits vs. formatted display, `NumberInput` is controlled via `Controller` from react-hook-form, not `register`:
  ```tsx
  <Controller
    control={control}
    name="unitPrice"
    render={({ field }) => (
      <NumberInput label="Đơn giá (đ)" min={0} value={field.value} onChange={field.onChange} />
    )}
  />
  ```
- Small decimal fields (quantity, height, trunk diameter, soil moisture, fruit count, etc.) keep using plain `Input type="number"` with `register(...)` — thousands-grouping is not applied there since values are typically small and can include decimals.
- If a new field clearly needs grouped-thousands formatting but also needs decimals, extend `NumberInput` rather than hand-rolling another formatter.

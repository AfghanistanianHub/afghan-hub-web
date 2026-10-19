/* One content width and gutter for every authenticated directory and workspace page. */
export const catalogPageContainerClass =
  "mx-auto w-full max-w-[88rem] px-4 py-8 sm:px-6 md:px-8 lg:px-10 xl:px-12";

export const catalogFieldClass =
  "min-h-11 min-w-0 rounded-[var(--radius-control)] border border-input bg-card px-4 py-3 text-foreground outline-none transition placeholder:text-muted-foreground hover:border-primary focus:border-primary focus:ring-4 focus:ring-primary/10";

export const catalogFilterPanelClass =
  "mt-5 grid grid-cols-2 items-end gap-3 [&>label:first-child]:col-span-2 md:[&>label:first-child]:col-span-1 border-b border-border pb-5";

export const catalogSubmitClass =
  "inline-flex min-h-11 max-w-full items-center justify-center gap-2 rounded-[var(--radius-control)] bg-primary px-5 py-3 font-semibold text-primary-foreground transition hover:-translate-y-0.5 hover:bg-primary/92 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary";

export const catalogClearClass =
  "inline-flex min-h-11 max-w-full items-center justify-center gap-2 rounded-[var(--radius-control)] border border-border/80 bg-background px-4 py-3 font-semibold text-foreground transition hover:-translate-y-0.5 hover:border-primary/25 hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary";

export const catalogCheckboxLabelClass =
  "flex min-h-11 cursor-pointer items-center gap-2 px-1 py-3 text-sm font-medium text-foreground transition hover:border-primary/25 hover:bg-muted/40 focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/15";

export const catalogCheckboxInputClass =
  "size-5 shrink-0 rounded border-border accent-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";

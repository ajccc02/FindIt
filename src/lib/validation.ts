import { z } from "zod";
import { CATEGORIES, LOCATIONS } from "./constants";
import { today } from "./format";
const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((value) => value || null);
const validDate = (value: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return (
    !Number.isNaN(date.valueOf()) &&
    date.toISOString().slice(0, 10) === value &&
    value >= "1900-01-01" &&
    value <= today()
  );
};
export const reportSchema = z
  .object({
    id: z.uuid(),
    report_type: z.enum(["lost", "found"]),
    item_name: z
      .string()
      .trim()
      .min(2, "Enter an item name with at least 2 characters.")
      .max(100)
      .regex(/[\p{L}\p{N}]/u, "Enter a descriptive item name."),
    category: z.enum(CATEGORIES, { error: "Choose a category." }),
    description: z
      .string()
      .trim()
      .min(10, "Describe the item in at least 10 characters.")
      .max(2000),
    color: optionalText(50),
    location: z.enum(LOCATIONS, {
      error: "Choose a building from the campus list.",
    }),
    incident_date: z
      .string()
      .refine(validDate, "Choose a valid date on or before today."),
    image_path: z.string().max(300).nullable(),
    additional_info: optionalText(1000),
    turned_over: z.boolean(),
  })
  .strict()
  .refine((value) => value.report_type === "found" || !value.turned_over, {
    message: "Only found items can be marked as turned over.",
    path: ["turned_over"],
  });
export const filterSchema = z.object({
  q: z.string().trim().max(100).default(""),
  type: z.enum(["all", "lost", "found"]).default("all"),
  category: z.union([z.literal(""), z.enum(CATEGORIES)]).default(""),
  location: z.union([z.literal(""), z.enum(LOCATIONS)]).default(""),
  status: z.enum(["all", "active", "resolved"]).default("active"),
  sort: z.enum(["recent", "oldest"]).default("recent"),
  page: z.coerce.number().int().min(1).max(10000).default(1),
});
export function fieldErrors(error: z.ZodError): Record<string, string> {
  return Object.fromEntries(
    error.issues.map((issue) => [
      String(issue.path[0] ?? "form"),
      issue.message,
    ]),
  );
}
export type ReportInput = z.input<typeof reportSchema>;

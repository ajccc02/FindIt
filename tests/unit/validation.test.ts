import { describe, expect, it } from "vitest";
import { filterSchema, reportSchema } from "@/lib/validation";
import { today } from "@/lib/format";
const report = {
  id: "11111111-1111-4111-8111-111111111111",
  report_type: "lost",
  item_name: "Scientific calculator",
  category: "Electronics",
  description: "Black calculator with a protective sliding cover.",
  color: "",
  location: "Bldg. 23 — Learning Resource Center",
  incident_date: today(),
  image_path: null,
  additional_info: "",
  turned_over: false,
};
describe("report validation", () => {
  it("accepts optional empty fields and normalizes them", () => {
    expect(reportSchema.parse(report).color).toBeNull();
    expect(reportSchema.parse(report).additional_info).toBeNull();
  });
  it("rejects missing or invalid fields and unexpected properties", () => {
    for (const change of [
      { item_name: "" },
      { description: "short" },
      { category: "Unlisted" },
      { location: "" },
      { location: "Main Building" },
      { location: "Unlisted Building" },
      { incident_date: "2026-02-31" },
      { incident_date: "2999-01-01" },
      { is_demo: true },
      { user_id: report.id },
    ])
      expect(reportSchema.safeParse({ ...report, ...change }).success).toBe(
        false,
      );
  });
  it("allows turnover only for found items", () => {
    expect(
      reportSchema.safeParse({ ...report, turned_over: true }).success,
    ).toBe(false);
    expect(
      reportSchema.safeParse({
        ...report,
        report_type: "found",
        turned_over: true,
      }).success,
    ).toBe(true);
  });
  it("bounds filters and handles punctuation as literal search text", () => {
    expect(filterSchema.parse({ q: 'bottle,%"' }).q).toBe('bottle,%"');
    expect(filterSchema.safeParse({ page: 0 }).success).toBe(false);
    expect(filterSchema.safeParse({ q: "x".repeat(101) }).success).toBe(false);
  });
});

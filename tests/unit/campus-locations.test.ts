import { describe, expect, it } from "vitest";
import { LOCATIONS } from "@/lib/constants";
import { filterSchema } from "@/lib/validation";

describe("campus-map locations", () => {
  it("keeps the 30 numbered map entries distinct and within database field limits", () => {
    expect(LOCATIONS).toHaveLength(29);
    expect(new Set(LOCATIONS).size).toBe(29);
    for (const location of LOCATIONS) {
      expect(location.length).toBeLessThanOrEqual(100);
      expect(filterSchema.parse({ location }).location).toBe(location);
    }
    expect(
      LOCATIONS.filter((location) =>
        location.endsWith("Food Innovation Center"),
      ),
    ).toHaveLength(1);
  });
  it("rejects the retired generic locations in filters", () => {
    for (const location of [
      "Main Building",
      "Canteen",
      "Gymnasium",
      "University Library",
    ]) {
      expect(filterSchema.safeParse({ location }).success).toBe(false);
    }
  });
});

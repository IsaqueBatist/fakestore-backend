import {
  encodeCursor,
  decodeCursor,
  buildCursorResponse,
} from "../../../src/server/shared/utils/cursor";

describe("Cursor Utilities", () => {
  describe("encodeCursor", () => {
    it("should encode an id to base64 string", () => {
      const result = encodeCursor(42);
      expect(typeof result).toBe("string");
      expect(result).toBe(Buffer.from("cursor:42").toString("base64"));
    });

    it("should encode different ids to different strings", () => {
      expect(encodeCursor(1)).not.toBe(encodeCursor(2));
    });
  });

  describe("decodeCursor", () => {
    it("should reverse encodeCursor (round-trip)", () => {
      expect(decodeCursor(encodeCursor(42))).toBe(42);
      expect(decodeCursor(encodeCursor(99))).toBe(99);
      expect(decodeCursor(encodeCursor(1))).toBe(1);
    });

    it("should return 0 for invalid base64 input", () => {
      expect(decodeCursor("not-valid-base64!!!")).toBe(0);
    });

    it("should return 0 for base64 that does not contain a number", () => {
      const invalid = Buffer.from("cursor:abc").toString("base64");
      expect(decodeCursor(invalid)).toBe(0);
    });

    it("should return 0 for empty string", () => {
      expect(decodeCursor("")).toBe(0);
    });
  });

  describe("buildCursorResponse", () => {
    it("should return has_more=true when results exceed limit", () => {
      const items = [
        { id_product: 1 },
        { id_product: 2 },
        { id_product: 3 },
      ];
      const result = buildCursorResponse(items, 2, "id_product");

      expect(result.data).toHaveLength(2);
      expect(result.pagination.has_more).toBe(true);
      expect(result.pagination.next_cursor).not.toBeNull();
      // next_cursor should point to the last included item
      expect(decodeCursor(result.pagination.next_cursor!)).toBe(2);
    });

    it("should return has_more=false when results are within limit", () => {
      const items = [{ id_product: 1 }, { id_product: 2 }];
      const result = buildCursorResponse(items, 2, "id_product");

      expect(result.data).toHaveLength(2);
      expect(result.pagination.has_more).toBe(false);
      expect(result.pagination.next_cursor).toBeNull();
    });

    it("should return has_more=false when results are fewer than limit", () => {
      const items = [{ id_product: 1 }];
      const result = buildCursorResponse(items, 5, "id_product");

      expect(result.data).toHaveLength(1);
      expect(result.pagination.has_more).toBe(false);
      expect(result.pagination.next_cursor).toBeNull();
    });

    it("should handle empty results", () => {
      const result = buildCursorResponse([], 10, "id_product");

      expect(result.data).toHaveLength(0);
      expect(result.pagination.has_more).toBe(false);
      expect(result.pagination.next_cursor).toBeNull();
    });
  });
});

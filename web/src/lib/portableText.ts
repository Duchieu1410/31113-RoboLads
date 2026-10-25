// Hàm thuần (không import code server) nên dùng được cả ở client lẫn server.

type SpanLike = { _type?: string; _key?: string; text?: string; marks?: string[] };
type BlockLike = { _type?: string; _key?: string; children?: SpanLike[] };

function randomKey(): string {
  return globalThis.crypto.randomUUID().replace(/-/g, "").slice(0, 12);
}

/** Textarea (đoạn cách nhau bằng 1 dòng trống) -> Portable Text blocks của Sanity. */
export function textToBlocks(text: string) {
  return text
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => ({
      _type: "block",
      _key: randomKey(),
      style: "normal",
      markDefs: [] as unknown[],
      children: [{ _type: "span", _key: randomKey(), text: p, marks: [] as string[] }],
    }));
}

/** Portable Text blocks -> chuỗi thuần để đổ vào textarea khi sửa bài. */
export function blocksToText(blocks?: ReadonlyArray<BlockLike> | null): string {
  if (!blocks) return "";
  return blocks
    .filter((b) => b._type === "block")
    .map((b) => (b.children ?? []).map((c) => c.text ?? "").join(""))
    .join("\n\n");
}

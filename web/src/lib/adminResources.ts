import { writeClient } from "@/lib/sanity";
import { textToBlocks } from "@/lib/portableText";

export const CATEGORIES = ["CAD", "Programming", "Mechanical", "Failure Log"] as const;
export const MAX_FILE_BYTES = 100 * 1024 * 1024; // 100MB (lưu ý: Vercel giới hạn body ~4.5MB)

/** Đọc + kiểm tra FormData gửi từ form Admin. */
export function parseResourceForm(form: FormData) {
  const title = String(form.get("title") ?? "").trim();
  const category = String(form.get("category") ?? "").trim();
  const author = String(form.get("author") ?? "").trim();
  const tags = String(form.get("tags") ?? "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
  const description = String(form.get("description") ?? "");
  const removeFile = form.get("removeFile") === "true";

  const fileEntry = form.get("file");
  const file = fileEntry instanceof File && fileEntry.size > 0 ? fileEntry : null;

  const errors: string[] = [];
  if (!title) errors.push("Tiêu đề không được để trống");
  if (!(CATEGORIES as readonly string[]).includes(category)) errors.push("Chuyên mục không hợp lệ");
  if (file && file.size > MAX_FILE_BYTES) errors.push("File quá lớn (tối đa 100MB)");

  return {
    errors,
    file,
    removeFile,
    values: { title, category, author, tags, description: textToBlocks(description) },
  };
}

/** Upload file lên Sanity Assets, trả về _id của asset. */
export async function uploadResourceFile(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const asset = await writeClient.assets.upload("file", buffer, {
    filename: file.name,
    contentType: file.type || undefined,
  });
  return asset._id;
}

export function fileField(assetId: string) {
  return { _type: "file", asset: { _type: "reference", _ref: assetId } };
}

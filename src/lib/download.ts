// Tải ảnh về máy. Ảnh kết quả giờ là URL Supabase Storage (cross-origin) — thuộc tính `download`
// bị trình duyệt bỏ qua với URL cross-origin, nên phải fetch thành blob rồi mới tải để giữ đúng
// tên file. Với base64/data URL thì tải trực tiếp như cũ.
function triggerDownload(href: string, fileName: string) {
  const link = document.createElement("a");
  link.href = href;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export async function downloadImage(src: string, fileName: string): Promise<void> {
  if (/^https?:\/\//.test(src)) {
    try {
      const res = await fetch(src);
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      triggerDownload(objectUrl, fileName);
      URL.revokeObjectURL(objectUrl);
      return;
    } catch {
      // Fallback: mở thẳng URL (người dùng tự lưu) nếu fetch lỗi (CORS...).
      window.open(src, "_blank");
      return;
    }
  }
  triggerDownload(src, fileName);
}

import { redirect } from "next/navigation";

// Ứng dụng này chỉ phục vụ /admin/** — root path chuyển thẳng vào đó.
// requireAdmin() trong app/admin/layout.tsx sẽ tự xử lý việc chặn nếu không phải admin.
export default function RootPage() {
  redirect("/admin");
}

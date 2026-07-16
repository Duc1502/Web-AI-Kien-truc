// Trang 404 chung — dùng cho cả "route không tồn tại" lẫn "không có quyền truy cập /admin".
// Cố tình KHÔNG có nội dung nào gợi ý về việc phân quyền/đăng nhập, để không lộ sự tồn tại
// của khu vực quản trị cho người dùng thường.
export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0b0f19] text-slate-400">
      <div className="text-center space-y-2">
        <div className="text-4xl font-black text-slate-600">404</div>
        <p className="text-sm">Không tìm thấy trang.</p>
      </div>
    </div>
  );
}

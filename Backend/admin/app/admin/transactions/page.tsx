import { requireAdmin } from "@/lib/auth";

export default async function TransactionsPage() {
  await requireAdmin();
  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-black text-white">Giao dịch & Đối soát</h1>
      <p className="text-sm text-slate-400 max-w-xl">
        Đang chờ tích hợp thanh toán (VietQR/MoR) ở app chính trước khi có dữ liệu thật để hiển
        thị — theo đúng thứ tự ưu tiên đã thống nhất. Bảng <code>transactions</code> và policy đã
        sẵn sàng trong migration.
      </p>
    </div>
  );
}

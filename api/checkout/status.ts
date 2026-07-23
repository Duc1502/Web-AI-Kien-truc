// Vercel serverless function → POST /api/checkout/status. Trang checkout poll trạng thái đơn.
import { handleTransactionStatus } from "../../server.js";

export default handleTransactionStatus;

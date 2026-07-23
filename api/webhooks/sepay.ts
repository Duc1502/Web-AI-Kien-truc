// Vercel serverless function → POST /api/webhooks/sepay. SePay gọi khi có tiền vào tài khoản.
import { handleSepayWebhook } from "../../server.js";

export default handleSepayWebhook;

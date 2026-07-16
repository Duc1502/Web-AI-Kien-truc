import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

interface CookieToSet {
  name: string;
  value: string;
  options: CookieOptions;
}

/**
 * Chặn TẤT CẢ request tới /admin/** ở tầng request, trước khi chạm vào bất kỳ Server Component
 * hay Route Handler nào. Đây là lớp phòng thủ đầu tiên — lớp thứ hai là requireAdmin() được gọi
 * lại độc lập trong từng page/action (xem lib/auth.ts), không phụ thuộc hoàn toàn vào middleware.
 *
 * Không phải admin → trả 404 (không phải 403/redirect sang trang login), để không lộ cho người
 * dùng thường biết rằng route /admin có tồn tại.
 */
export async function middleware(request: NextRequest) {
  const response = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return new NextResponse("Not Found", { status: 404 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    return new NextResponse("Not Found", { status: 404 });
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};

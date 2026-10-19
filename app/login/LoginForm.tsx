"use client";
import Image from 'next/image';
import Link from "next/link";
import { DemoLoginFields } from "@/components/DemoFields";
import { useState } from "react";
import { getSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginForm({ next,googleEnabled }: { next:string; googleEnabled:boolean }) {
  const router = useRouter(); const [error,setError] = useState(""); const [busy,setBusy] = useState(false);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError("");
    const data = new FormData(event.currentTarget);
    const result = await signIn("credentials", { email:data.get("email"), password:data.get("password"), redirect:false });
    if (result?.error) { setError("Email hoặc mật khẩu chưa đúng"); setBusy(false); return; }
    const session = await getSession();
    const role = (session?.user as { role?: string } | undefined)?.role;
    router.push(role === "admin" ? "/admin" : next); router.refresh();
  }
  return <main className="store-auth-shell"><div className="store-auth-image"><Image width={900} height={1100} sizes="(max-width: 767px) 50vw, 33vw" src="/images/product-02.jpg" alt="Hoa tươi Mộc Hoa"/><div><span>✿</span><h2>Hoa luôn là một cách<br/>để nói yêu thương.</h2></div></div><div className="store-auth-card"><span className="store-overline">CHÀO MỪNG TRỞ LẠI</span><h1>Đăng nhập Mộc Hoa</h1><p>Theo dõi đơn hoa và lưu lại những dịp đáng nhớ.</p><form onSubmit={submit}><DemoLoginFields/><button className="store-primary-link" disabled={busy}>{busy ? "Đang đăng nhập..." : "Đăng nhập ↗"}</button>{error && <p className="store-error" role="alert">{error}</p>}</form><div className="store-auth-separator">hoặc</div><button type="button" className="store-google" disabled={!googleEnabled} onClick={() => signIn("google", { callbackUrl: next })}>G &nbsp; Tiếp tục với Google</button>{!googleEnabled && <p className="store-auth-hint">Đăng nhập Google hiện chưa khả dụng. Vui lòng dùng email và mật khẩu.</p>}<p>Chưa có tài khoản? <Link href="/register">Tạo tài khoản mới</Link></p><div className="store-demo"><strong>Tài khoản demo · dùng thử ngay</strong><div><span>Khách hàng</span><code>demo@mochoa.local</code><code>Demo1234!</code></div><div><span>Quản trị</span><code>admin@mochoa.local</code><code>Admin1234!</code></div></div></div></main>;
}

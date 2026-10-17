import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { createCredentialUser, findUserByEmail } from "@/repositories/user.repository";

const schema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.email().transform((value) => value.trim().toLowerCase()),
  password: z.string().min(8).max(72),
});

export async function POST(request: Request) {
  let data: z.infer<typeof schema>;
  try { data = schema.parse(await request.json()); }
  catch { return NextResponse.json({ error: "Tên, email hoặc mật khẩu không hợp lệ" }, { status: 400 }); }
  if (await findUserByEmail(data.email)) return NextResponse.json({ error: "Email đã được đăng ký" }, { status: 409 });
  try {
    const hash = await bcrypt.hash(data.password, 12);
    await createCredentialUser(data.name, data.email, hash);
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch { return NextResponse.json({ error: "Không thể tạo tài khoản" }, { status: 500 }); }
}

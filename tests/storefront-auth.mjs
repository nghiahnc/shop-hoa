import { config } from 'dotenv';
import pg from 'pg';
import { randomUUID } from 'node:crypto';
config({ path: '.env.local' });
const db = new pg.Client({ connectionString: process.env.DATABASE_URL });
await db.connect();
const email = `signup-test-${randomUUID()}@example.test`;
try {
  const bad = await fetch('http://127.0.0.1:3001/api/auth/register',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({name:'Tester',email,password:'short'})});
  if (bad.status !== 400) throw new Error(`Mật khẩu yếu không bị từ chối: ${bad.status}`);
  const created = await fetch('http://127.0.0.1:3001/api/auth/register',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({name:'CV Tester',email,password:'Test12345!'})});
  if (created.status !== 201) throw new Error(`Đăng ký thất bại: ${created.status} ${await created.text()}`);
  const user = (await db.query('SELECT role,password_hash FROM users WHERE email=$1',[email])).rows[0];
  if (user?.role !== 'customer' || !user.password_hash?.startsWith('$2')) throw new Error('Vai trò hoặc hash không đúng');
  const duplicate = await fetch('http://127.0.0.1:3001/api/auth/register',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({name:'CV Tester',email,password:'Test12345!'})});
  if (duplicate.status !== 409) throw new Error(`Email trùng không bị từ chối: ${duplicate.status}`);
  const admin = await fetch('http://127.0.0.1:3001/api/admin/products',{method:'POST',headers:{'content-type':'application/json'},body:'{}'});
  if (admin.status !== 403) throw new Error(`API admin thiếu phiên không bị từ chối: ${admin.status}`);
  const order = await fetch('http://127.0.0.1:3001/api/orders',{method:'POST',headers:{'content-type':'application/json'},body:'{}'});
  if (order.status !== 401) throw new Error(`API đặt đơn thiếu phiên không bị từ chối: ${order.status}`);
  console.log('Đăng ký, hash mật khẩu, email trùng và phân quyền API hợp lệ.');
} finally {
  await db.query('DELETE FROM users WHERE email=$1',[email]);
  await db.end();
}

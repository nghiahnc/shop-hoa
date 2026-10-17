import { config } from 'dotenv';
import pg from 'pg';
import bcrypt from 'bcryptjs';
config({ path: '.env.local' });
const db = new pg.Client({ connectionString: process.env.DATABASE_URL });
await db.connect();
try {
  for (const user of [
    ['demo@mochoa.local', 'Khách demo', 'Demo1234!', 'customer'],
    ['admin@mochoa.local', 'Quản trị Mộc Hoa', 'Admin1234!', 'admin'],
  ]) {
    const [email, name, password, role] = user;
    const hash = await bcrypt.hash(password, 12);
    await db.query(`INSERT INTO users(email,name,password_hash,role) VALUES($1,$2,$3,$4)
      ON CONFLICT(email) DO UPDATE SET name=EXCLUDED.name,password_hash=EXCLUDED.password_hash,role=EXCLUDED.role`, [email,name,hash,role]);
  }
  console.log('Tài khoản demo đã sẵn sàng. Xem README hoặc trang đăng nhập.');
} finally { await db.end(); }

import { db } from './server/db';
import { users } from './db/schema';
import { eq } from 'drizzle-orm';

const [user] = await db.select().from(users).where(eq(users.id, 'main-user'));
console.log('\n=== DATABASE USER ===');
console.log(JSON.stringify(user, null, 2));
console.log('\n=== KEY VALUES ===');
console.log('startDate:', user?.startDate);
console.log('locationPreference:', user?.locationPreference);
process.exit(0);

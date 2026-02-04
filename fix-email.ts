import Database from 'better-sqlite3';

const db = new Database('./prisma/dev.db');

// Update John Admin's email to match GitHub email
db.prepare(`UPDATE authUsers SET email = 's.k.verma@live.in' WHERE id = 1`).run();

console.log('Updated! Verifying:');
const users = db.prepare('SELECT id, email, firstName, lastName, role FROM authUsers').all();
console.log(users);

db.close();

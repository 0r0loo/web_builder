import postgres from "postgres";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const sql = postgres(process.env.DATABASE_URL!);

async function checkDatabase() {
	console.log("🔍 Railway DB 연결 확인 중...\n");

	try {
		// 테이블 목록 조회
		const tables = await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `;

		console.log("✅ 생성된 테이블:");
		for (const table of tables) {
			console.log(`   - ${table.table_name}`);
		}

		// projects 테이블 구조 확인
		console.log("\n📋 projects 테이블 컬럼:");
		const projectCols = await sql`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'projects'
      ORDER BY ordinal_position;
    `;
		for (const col of projectCols) {
			console.log(`   - ${col.column_name}: ${col.data_type}`);
		}

		// pages 테이블 구조 확인
		console.log("\n📋 pages 테이블 컬럼:");
		const pageCols = await sql`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'pages'
      ORDER BY ordinal_position;
    `;
		for (const col of pageCols) {
			console.log(`   - ${col.column_name}: ${col.data_type}`);
		}

		console.log("\n🎉 Railway DB 연결 성공!");
	} catch (error) {
		console.error("❌ 에러:", error);
	} finally {
		await sql.end();
	}
}

checkDatabase();
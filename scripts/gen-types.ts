/* Regenerate lib/supabase/types.ts from the self-hosted DB — tables, views,
 * functions, and enums. The app talks to the self-hosted instance, so this is
 * the single source of truth. Run: FNF_SMOKE_DB_URL=... npx tsx scripts/gen-types.ts */
import { Client } from "pg";
import { writeFileSync } from "node:fs";

const CONN = process.env.FNF_SMOKE_DB_URL;
if (!CONN) {
  console.error("Set FNF_SMOKE_DB_URL");
  process.exit(2);
}

function tsType(udt: string): string {
  const u = udt.replace(/^_/, "");
  const arr = udt.startsWith("_");
  let base: string;
  if (
    [
      "uuid", "text", "varchar", "bpchar", "char", "name", "citext",
      "time", "timetz", "date", "timestamp", "timestamptz", "interval",
      "bytea", "inet", "cidr", "macaddr",
    ].includes(u)
  )
    base = "string";
  else if (u === "bool") base = "boolean";
  else if (["int2", "int4", "int8", "float4", "float8", "numeric", "money", "oid"].includes(u))
    base = "number";
  else if (u === "json" || u === "jsonb") base = "Json";
  else if (u === "void") base = "undefined";
  else base = "string"; // enums / unknown → string (safe default)
  return arr ? `${base}[]` : base;
}

async function main() {
  const c = new Client({ connectionString: CONN });
  await c.connect();
  const q = (sql: string, p: unknown[] = []) => c.query(sql, p);

  // ---- tables + views ----
  const { rows: rels } = await q(
    `select table_name, table_type from information_schema.tables
       where table_schema='public' order by table_name`,
  );
  const { rows: cols } = await q(
    `select table_name, column_name, udt_name, is_nullable,
            (column_default is not null) as has_default, is_identity, is_generated
       from information_schema.columns where table_schema='public'
       order by table_name, ordinal_position`,
  );
  const colsByTable = new Map<string, typeof cols>();
  for (const c2 of cols) {
    const list = colsByTable.get(c2.table_name) ?? [];
    list.push(c2);
    colsByTable.set(c2.table_name, list);
  }

  const tableBlocks: string[] = [];
  const viewBlocks: string[] = [];
  for (const r of rels) {
    const list = colsByTable.get(r.table_name) ?? [];
    const row: string[] = [];
    const ins: string[] = [];
    const upd: string[] = [];
    for (const col of list) {
      const t = tsType(col.udt_name);
      const nullable = col.is_nullable === "YES";
      const tn = nullable ? `${t} | null` : t;
      const optional =
        nullable || col.has_default || col.is_identity === "YES" || col.is_generated === "ALWAYS";
      row.push(`          ${col.column_name}: ${tn};`);
      ins.push(`          ${col.column_name}${optional ? "?" : ""}: ${tn};`);
      upd.push(`          ${col.column_name}?: ${tn};`);
    }
    if (r.table_type === "VIEW") {
      viewBlocks.push(
        `      ${r.table_name}: {\n        Row: {\n${row.join("\n")}\n        };\n        Relationships: [];\n      };`,
      );
    } else {
      tableBlocks.push(
        `      ${r.table_name}: {\n        Row: {\n${row.join("\n")}\n        };\n        Insert: {\n${ins.join("\n")}\n        };\n        Update: {\n${upd.join("\n")}\n        };\n        Relationships: [];\n      };`,
      );
    }
  }

  // ---- enums ----
  const { rows: enums } = await q(
    `select t.typname as name, array_agg(e.enumlabel order by e.enumsortorder) as labels
       from pg_type t join pg_enum e on e.enumtypid=t.oid
       join pg_namespace n on n.oid=t.typnamespace
       where n.nspname='public' group by t.typname order by t.typname`,
  );
  const enumBlocks = enums.map(
    (e) => `      ${e.name}: ${(e.labels as string[]).map((l) => `"${l}"`).join(" | ")};`,
  );

  // ---- functions ----
  const { rows: typeRows } = await q(`select oid, typname from pg_type`);
  const oidToType = new Map<number, string>(
    typeRows.map((t) => [Number(t.oid), t.typname as string]),
  );
  const { rows: fns } = await q(
    `select p.proname as name,
            coalesce(p.proargnames, '{}'::text[]) as argnames,
            coalesce(string_to_array(nullif(p.proargtypes::text,''), ' ')::oid[], '{}'::oid[]) as argtypeoids,
            p.prorettype::int as rettypeoid,
            p.proretset as retset
       from pg_proc p join pg_namespace n on n.oid=p.pronamespace
       where n.nspname='public' and p.prokind in ('f','p')
       order by p.proname`,
  );
  const seen = new Set<string>();
  const fnBlocks: string[] = [];
  for (const f of fns) {
    if (seen.has(f.name)) continue; // skip overloads (take first)
    seen.add(f.name);
    const names = (f.argnames as string[]) ?? [];
    const oids = (f.argtypeoids as (string | number)[]) ?? [];
    const args: string[] = [];
    for (let i = 0; i < oids.length; i += 1) {
      const nm = names[i] ?? `arg${i + 1}`;
      const tn = tsType(oidToType.get(Number(oids[i])) ?? "text");
      args.push(`${nm}: ${tn === "undefined" ? "string" : tn}`);
    }
    const argType =
      args.length === 0 ? "Record<string, never>" : `{ ${args.join("; ")} }`;
    const retName = oidToType.get(Number(f.rettypeoid)) ?? "void";
    let ret = tsType(retName);
    if (f.retset) ret = ret === "undefined" ? "undefined" : `${ret}[]`;
    fnBlocks.push(
      `      ${f.name}: {\n        Args: ${argType};\n        Returns: ${ret};\n      };`,
    );
  }

  const out = `// Generated from the self-hosted Supabase DB (scripts/gen-types.ts).
// Tables, views, functions, and enums. Re-run when the schema changes.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
${tableBlocks.join("\n")}
    };
    Views: {
${viewBlocks.join("\n") || "      [_ in never]: never;"}
    };
    Functions: {
${fnBlocks.join("\n")}
    };
    Enums: {
${enumBlocks.join("\n") || "      [_ in never]: never;"}
    };
    CompositeTypes: Record<string, never>;
  };
};

type PublicSchema = Database["public"];

export type Tables<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Row"];
export type TablesInsert<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Insert"];
export type TablesUpdate<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Update"];
export type Enums<T extends keyof PublicSchema["Enums"]> =
  PublicSchema["Enums"][T];

export type Profile = Tables<"profiles">;
export type HistoricalPlayerStatsRow = Tables<"historical_player_stats">;
export type Announcement = Tables<"announcements">;
`;

  writeFileSync("lib/supabase/types.ts", out);
  console.log(
    `Wrote lib/supabase/types.ts — ${tableBlocks.length} tables, ${viewBlocks.length} views, ${fnBlocks.length} functions, ${enumBlocks.length} enums`,
  );
  await c.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

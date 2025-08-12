export const runtime = "nodejs";
import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

// Optional R2 via S3-compatible API
let S3Client: any;
let PutObjectCommand: any;
try {
  // lazy import to avoid bundling if not configured
  ({ S3Client, PutObjectCommand } = require("@aws-sdk/client-s3"));
} catch {}

function randomId(len = 8) {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let s = "";
  for (let i = 0; i < len; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

export async function POST(req: NextRequest) {
  const adminTokenHeader = req.headers.get("x-admin-token") || "";
  const serverToken = process.env.ADMIN_TOKEN || "";
  if (!serverToken || adminTokenHeader !== serverToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const form = await req.formData();
  const file = form.get("file");
  const locale = String(form.get("locale") || "zh");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file" }, { status: 400 });
  }
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }

  // Build common file info once
  const now = new Date();
  const yyyy = String(now.getFullYear());
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const ext = (file.name.split(".").pop() || "png").toLowerCase();
  const name = `${randomId(10)}.${ext}`;
  const arrayBuffer = await file.arrayBuffer();

  // Prefer uploading to R2 first. Only fall back to local if R2 unavailable or upload fails.
  let r2Key = `uploads/${yyyy}/${mm}/${name}`;
  let r2Url: string | undefined = undefined;
  const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID || process.env.CF_ACCOUNT_ID;
  const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID;
  const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY;
  const R2_BUCKET = process.env.R2_BUCKET || "pairusuo-top";
  const R2_PUBLIC_BASE = process.env.R2_PUBLIC_BASE; // e.g. https://r2-cdn.example.com
  const R2_ENDPOINT = process.env.R2_ENDPOINT; // optional full endpoint override

  if (S3Client && R2_ACCOUNT_ID && R2_ACCESS_KEY_ID && R2_SECRET_ACCESS_KEY) {
    try {
      const endpoint = R2_ENDPOINT || `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;
      const client = new S3Client({
        region: "auto",
        endpoint,
        forcePathStyle: true, // prefer path-style for S3-compatible endpoints
        credentials: {
          accessKeyId: R2_ACCESS_KEY_ID,
          secretAccessKey: R2_SECRET_ACCESS_KEY,
        },
      });
      const put = new PutObjectCommand({
        Bucket: R2_BUCKET,
        Key: r2Key,
        Body: Buffer.from(arrayBuffer),
        ContentType: file.type,
        ACL: undefined,
      });
      await client.send(put);
      r2Url = R2_PUBLIC_BASE ? `${R2_PUBLIC_BASE}/${r2Key}` : undefined;
    } catch (e) {
      // Ignore R2 failure; local url still returned
      console.warn("R2 upload failed", {
        err: (e as any)?.message || String(e),
        endpoint: (R2_ENDPOINT ? 'custom' : 'default')
      });
    }
  }
  // If R2 succeeded (r2Url available), return it and do NOT save locally.
  if (r2Url) {
    return NextResponse.json({
      ok: true,
      path: r2Key, // informational
      url: r2Url,
      r2Key,
      r2Url,
      locale,
    });
  }

  // R2 unavailable or failed: fall back to saving under public/uploads/yyyy/mm/
  const baseDir = path.join(process.cwd(), "public", "uploads", yyyy, mm);
  await mkdir(baseDir, { recursive: true });
  const abs = path.join(baseDir, name);
  await writeFile(abs, Buffer.from(arrayBuffer));
  const publicUrlPath = `/uploads/${yyyy}/${mm}/${name}`;

  return NextResponse.json({
    ok: true,
    path: publicUrlPath,
    url: publicUrlPath,
    r2Key,
    r2Url: undefined,
    locale,
  });
}

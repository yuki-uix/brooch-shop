import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_MIME = new Set(["image/jpeg", "image/png"]);

function extFromMime(mime: string): string | null {
  if (mime === "image/jpeg") return "jpg";
  if (mime === "image/png") return "png";
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const descRaw = formData.get("description");
    const description =
      typeof descRaw === "string" ? descRaw.trim() : "";

    if (description.length > 500) {
      return NextResponse.json(
        { error: "文字描述不能超过 500 字" },
        { status: 400 },
      );
    }

    const fileEntry = formData.get("image");
    let imageUrl: string | null = null;

    if (fileEntry && typeof fileEntry !== "string") {
      const file = fileEntry as File;
      if (file.size === 0) {
        // empty file field — treat as no image
      } else {
        if (file.size > MAX_BYTES) {
          return NextResponse.json(
            { error: "图片大小不能超过 5MB" },
            { status: 400 },
          );
        }
        const mime = file.type || "application/octet-stream";
        if (!ALLOWED_MIME.has(mime)) {
          return NextResponse.json(
            { error: "仅支持 JPG、PNG 格式的图片" },
            { status: 400 },
          );
        }
        const ext = extFromMime(mime);
        if (!ext) {
          return NextResponse.json(
            { error: "仅支持 JPG、PNG 格式的图片" },
            { status: 400 },
          );
        }

        const buf = Buffer.from(await file.arrayBuffer());
        const dir = path.join(process.cwd(), "public", "uploads", "custom");
        await mkdir(dir, { recursive: true });
        const name = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${ext}`;
        const diskPath = path.join(dir, name);
        await writeFile(diskPath, buf);
        imageUrl = `/uploads/custom/${name}`;
      }
    }

    if (!description && !imageUrl) {
      return NextResponse.json(
        { error: "请上传参考图片或填写文字描述" },
        { status: 400 },
      );
    }

    const row = await prisma.customRequest.create({
      data: {
        description: description || null,
        imageUrl,
      },
    });

    return NextResponse.json(
      {
        id: row.id,
        description: row.description,
        imageUrl: row.imageUrl,
        createdAt: row.createdAt.toISOString(),
      },
      { status: 201 },
    );
  } catch (err) {
    console.error("custom-requests POST failed:", err);
    return NextResponse.json({ error: "提交失败，请稍后重试" }, { status: 500 });
  }
}

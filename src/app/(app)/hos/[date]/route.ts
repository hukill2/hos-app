import { proxyFetch } from "@/lib/proxy";
import { NextResponse } from "next/server";

export async function GET(
  _: Request,
  { params }: { params: { date: string } }
) {
  const r = await proxyFetch(`/api/hos/${params.date}`);
  return new NextResponse(await r.text(), {
    status: r.status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function PUT(
  req: Request,
  { params }: { params: { date: string } }
) {
  const body = await req.text();
  const r = await proxyFetch(`/api/hos/${params.date}`, {
    method: "PUT",
    body,
  });
  return new NextResponse(await r.text(), {
    status: r.status,
    headers: { "Content-Type": "application/json" },
  });
}

import { NextResponse } from "next/server";

import { prisma } from "@/src/lib/prisma";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function DELETE(
  _request: Request,
  { params }: RouteContext,
): Promise<NextResponse> {
  const { id } = await params;

  let link;

  try {
    link = await prisma.link.findUnique({ where: { id }, select: { id: true } });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Database connection error." },
      { status: 500 },
    );
  }

  if (!link) {
    return NextResponse.json(
      { success: false, error: "Link not found." },
      { status: 404 },
    );
  }

  try {
    await prisma.link.delete({ where: { id } });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Unable to delete link." },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true });
}

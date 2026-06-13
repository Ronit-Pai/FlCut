import { NextResponse } from "next/server";

import { prisma } from "@/src/lib/prisma";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(
  _request: Request,
  { params }: RouteContext,
): Promise<NextResponse> {
  const { id } = await params;

  const link = await prisma.link.findUnique({
    where:  { id },
    select: { id: true, isDisabled: true },
  });

  if (!link) {
    return NextResponse.json(
      { success: false, error: "Link not found." },
      { status: 404 },
    );
  }

  const updated = await prisma.link.update({
    where: { id },
    data:  { isDisabled: !link.isDisabled },
    select: { isDisabled: true },
  });

  return NextResponse.json({ success: true, isDisabled: updated.isDisabled });
}

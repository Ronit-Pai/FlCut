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

  let link;

  try {
    link = await prisma.link.findUnique({
      where:  { id },
      select: { id: true, isDisabled: true },
    });
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

  let updated;

  try {
    updated = await prisma.link.update({
      where: { id },
      data:  { isDisabled: !link.isDisabled },
      select: { isDisabled: true },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Unable to update link." },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true, isDisabled: updated.isDisabled });
}

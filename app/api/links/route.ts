import { NextResponse } from "next/server";

import {
  createShortLink,
  AliasAlreadyTakenError,
  AliasReservedError,
  SlugCollisionError,
} from "@/src/lib/links/create-link";
import { validateAlias } from "@/src/lib/validators/alias";
import { normalizeUrl } from "@/src/lib/validators/url";
import type {
  CreateLinkErrorResponse,
  CreateLinkRequestBody,
  CreateLinkSuccessResponse,
} from "@/src/types/api";

export async function POST(
  request: Request,
): Promise<NextResponse<CreateLinkSuccessResponse | CreateLinkErrorResponse>> {
  let body: CreateLinkRequestBody;

  try {
    body = (await request.json()) as CreateLinkRequestBody;
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid JSON body." },
      { status: 400 },
    );
  }

 
  if (typeof body.url !== "string" || body.url.trim().length === 0) {
    return NextResponse.json(
      { success: false, error: "URL is required." },
      { status: 400 },
    );
  }

  const targetUrl = normalizeUrl(body.url);
  if (!targetUrl) {
    return NextResponse.json(
      { success: false, error: "URL must be a valid http or https address." },
      { status: 400 },
    );
  }

  const rawAlias = typeof body.alias === "string" ? body.alias.trim() : "";
  const alias = rawAlias.length > 0 ? rawAlias : null;

  if (alias !== null) {
    const result = validateAlias(alias);
    if (!result.valid) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 },
      );
    }
  }

 
  try {
    const shortUrl = await createShortLink(targetUrl, alias);
    return NextResponse.json({ success: true, shortUrl });
  } catch (error) {
    if (error instanceof AliasAlreadyTakenError) {
      return NextResponse.json(
        { success: false, error: "Alias has already beentaken." },
        { status: 409 },
      );
    }

    if (error instanceof AliasReservedError) {
      return NextResponse.json(
        { success: false, error: "Cannot Use This its a Reserved alias." },
        { status: 409 },
      );
    }

    if (error instanceof SlugCollisionError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 503 },
      );
    }

    console.error("[POST /api/links]", error);

    return NextResponse.json(
      { success: false, error: "Failed to create short link." },
      { status: 500 },
    );
  }
}

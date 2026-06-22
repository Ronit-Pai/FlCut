import { NextResponse } from "next/server";

import {
  createShortLink,
  AliasAlreadyTakenError,
  AliasReservedError,
  SlugCollisionError,
} from "@/src/lib/links/create-link";
import { validateAlias } from "@/src/lib/validators/alias";
import { normalizeUrl } from "@/src/lib/validators/url";
import { getBaseUrl } from "@/src/lib/env";
import {
  parseOptionalDateTime,
  requireFutureDate,
} from "@/src/lib/validators/datetime";
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

  // Prevent creating short links that point back to this app's base URL/domain.
  // To avoid infinite redirect loop.
  try {
    const targetParsed = new URL(targetUrl);
    const baseParsed = new URL(getBaseUrl());
    if (targetParsed.host === baseParsed.host) {
      return NextResponse.json(
        { success: false, error: "URL cannot point to this application's domain." },
        { status: 400 },
      );
    }
  } catch (e) {
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

  const parsedGoLiveAt = parseOptionalDateTime(body.goLiveAt);

  if (parsedGoLiveAt !== null && "error" in parsedGoLiveAt) {
    return NextResponse.json(
      { success: false, error: `Go live date: ${parsedGoLiveAt.error}` },
      { status: 400 },
    );
  }

  if (parsedGoLiveAt instanceof Date) {
    const check = requireFutureDate(parsedGoLiveAt, "Go live date");
    if (!check.valid) {
      return NextResponse.json(
        { success: false, error: check.error },
        { status: 400 },
      );
    }
  }

  const parsedExpiresAt = parseOptionalDateTime(body.expiresAt);

  if (parsedExpiresAt !== null && "error" in parsedExpiresAt) {
    return NextResponse.json(
      { success: false, error: `Expiry date: ${parsedExpiresAt.error}` },
      { status: 400 },
    );
  }

  if (parsedExpiresAt instanceof Date) {
    const check = requireFutureDate(parsedExpiresAt, "Expiry date");
    if (!check.valid) {
      return NextResponse.json(
        { success: false, error: check.error },
        { status: 400 },
      );
    }

    if (parsedGoLiveAt instanceof Date && parsedExpiresAt <= parsedGoLiveAt) {
      return NextResponse.json(
        { success: false, error: "Expiry must be after go-live date." },
        { status: 400 },
      );
    }
  }

  try {
    const shortUrl = await createShortLink(targetUrl, alias, {
      goLiveAt: parsedGoLiveAt instanceof Date ? parsedGoLiveAt : null,
      expiresAt: parsedExpiresAt instanceof Date ? parsedExpiresAt : null,
    });

    return NextResponse.json({ success: true, shortUrl });
  } catch (error) {
    if (error instanceof AliasAlreadyTakenError) {
      return NextResponse.json(
        { success: false, error: "Alias already taken." },
        { status: 409 },
      );
    }
    if (error instanceof AliasReservedError) {
      return NextResponse.json(
        { success: false, error: "Reserved alias." },
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

import { NextResponse } from "next/server";

import {
  createShortLink,
  SlugCollisionError,
} from "@/src/lib/links/create-link";
import { normalizeUrl } from "@/src/lib/validators/url";
import type {
  CreateLinkErrorResponse,
  CreateLinkRequestBody,
  CreateLinkSuccessResponse,
} from "@/src/types/api";

export async function POST(
  request: Request,
): Promise<
  NextResponse<CreateLinkSuccessResponse | CreateLinkErrorResponse>
> {
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
      {
        success: false,
        error: "URL must be a valid http or https address.",
      },
      { status: 400 },
    );
  }

  try {
    const shortUrl = await createShortLink(targetUrl);

    return NextResponse.json({ success: true, shortUrl });
  } catch (error) {
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

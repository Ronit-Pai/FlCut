export type CreateLinkRequestBody = {
  url: string;
  alias?: string;
};

export type CreateLinkSuccessResponse = {
  success: true;
  shortUrl: string;
};

export type CreateLinkErrorResponse = {
  success: false;
  error: string;
};

export type CreateLinkResponse =
  | CreateLinkSuccessResponse
  | CreateLinkErrorResponse;

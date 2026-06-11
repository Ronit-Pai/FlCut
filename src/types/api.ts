export type CreateLinkRequestBody = {
  url: string;
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

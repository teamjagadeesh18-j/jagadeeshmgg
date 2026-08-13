import { POST as contactPOST } from "../contact/route";

export async function POST(req: Request) {
  return contactPOST(req);
}

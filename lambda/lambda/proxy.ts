import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import https from "https";

const USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.3";
const UG_BASE_URL = "https://www.ultimate-guitar.com";
const UG_TABS_BASE_URL = "https://tabs.ultimate-guitar.com";

function request(url: string, method: string = "GET"): Promise<string> {
  return new Promise((resolve, reject) => {
    const req = https.request(
      url,
      {
        method,
        headers: {
          "User-Agent": USER_AGENT,
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9",
          "Accept-Encoding": "gzip, deflate, br",
          "Connection": "keep-alive",
          "Upgrade-Insecure-Requests": "1",
          "Sec-Fetch-Dest": "document",
          "Sec-Fetch-Mode": "navigate",
          "Sec-Fetch-Site": "none",
          "Sec-Fetch-User": "?1",
          "Cache-Control": "max-age=0",
        },
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => resolve(data));
      }
    );
    req.on("error", reject);
    req.setTimeout(30000, () => {
      req.destroy();
      reject(new Error("Request timeout"));
    });
    req.end();
  });
}

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const path = event.rawPath.replace(/^\/[^/]+/, ""); // Strip stage prefix (e.g., /prod)
  const query = event.rawQueryString;

  if (path.startsWith("/search")) {
    const targetUrl = query ? `${UG_BASE_URL}/search.php?${query}` : `${UG_BASE_URL}/search.php`;
    try {
      const body = await request(targetUrl);
      return { statusCode: 200, headers: { "Content-Type": "text/html", "Access-Control-Allow-Origin": "*" }, body };
    } catch (e) {
      return { statusCode: 502, body: `Upstream error: ${e}` };
    }
  }

  if (path.startsWith("/tab/")) {
    const tabPath = path.replace("/tab/", "");
    const targetUrl = query ? `${UG_TABS_BASE_URL}/tab/${tabPath}?${query}` : `${UG_TABS_BASE_URL}/tab/${tabPath}`;
    try {
      const body = await request(targetUrl);
      return { statusCode: 200, headers: { "Content-Type": "text/html", "Access-Control-Allow-Origin": "*" }, body };
    } catch (e) {
      return { statusCode: 502, body: `Upstream error: ${e}` };
    }
  }

  return { statusCode: 404, body: "Not found" };
};

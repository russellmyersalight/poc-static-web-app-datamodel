
import os
import logging
from urllib.parse import urljoin, urlencode
import azure.functions as func

# Use httpx (or requests). httpx supports async if you prefer.
import httpx

HOP_BY_HOP_HEADERS = {
    "connection",
    "keep-alive",
    "proxy-authenticate",
    "proxy-authorization",
    "te",
    "trailer",
    "transfer-encoding",
    "upgrade",
}

def _sanitize_response_headers(headers: httpx.Headers) -> dict:
    clean = {}
    for k, v in headers.items():
        kl = k.lower()
        if kl not in HOP_BY_HOP_HEADERS and kl != "x-functions-key":
            clean[k] = v
    return clean

def _sanitize_request_headers(headers: dict) -> dict:
    clean = {}
    for k, v in headers.items():
        kl = k.lower()
        if kl not in HOP_BY_HOP_HEADERS and kl not in ("host", "content-length"):
            clean[k] = v
    return clean

async def main(req: func.HttpRequest) -> func.HttpResponse:
    logging.info("Python proxy function triggered.")

    base_url = os.environ.get("FUNCTION_APP_BASE_URL")  # e.g., https://my-func.azurewebsites.net/api/
    func_key = os.environ.get("FUNCTION_APP_KEY")       # your function or host key
    print(f"Base url: {base_url}, Function key: {func_key}")

    if not base_url or not func_key:
        logging.error("Missing FUNCTION_APP_BASE_URL or FUNCTION_APP_KEY.")
        return func.HttpResponse("Server is not configured correctly.", status_code=500)

    # Build upstream URL: base + path + query
    path = req.route_params.get("path") or ""
    print(f"Path: {path}")
    # Ensure base_url ends with '/', urljoin handles joining properly
    if not base_url.endswith("/"):
        base_url += "/"
    upstream_url = urljoin(base_url, path)
    print(f"Upstream url: {upstream_url}")

    # Forward query parameters
    query_params = req.params or {}
    if query_params:
        qp = urlencode(list(query_params.items()), doseq=True)
        if "?" in upstream_url:
            upstream_url += "&" + qp
        else:
            upstream_url += "?" + qp

    method = (req.method or "GET").upper()
    body = req.get_body() if method in ("POST", "PUT", "PATCH", "DELETE") else None

    outbound_headers = _sanitize_request_headers(dict(req.headers))
    # 🔐 Inject the Azure Functions key
    outbound_headers["x-functions-key"] = func_key
    print(f"Outbound headers: {outbound_headers}")

    # Optional: set a sensible timeout
    timeout = httpx.Timeout(30.0, connect=10.0)

    if True: # rbm

      try:
          # Use a single client for connection pooling
          async with httpx.AsyncClient(timeout=timeout) as client:
              resp = await client.request(
                  method=method,
                  url= "https://func-t-weu-assistant-genai-05.azurewebsites.net/api/predictfeedback", # upstream_url,
                  headers=outbound_headers,
                  content=body,
              )

          # Prepare response back to the browser
          clean_headers = _sanitize_response_headers(resp.headers)
          # Keep content-type if present
          content_type = clean_headers.get("content-type")

          logging.info(f"resp.content: {resp.content}")
          print(f".resp.content: {resp.content}")

          return func.HttpResponse(
              body=resp.content,
              status_code=resp.status_code,
              headers=clean_headers,
              mimetype=content_type
          )
      except httpx.RequestError as e:
          logging.exception("Upstream request failed: %s", str(e))
          return func.HttpResponse("Upstream service error.", status_code=502)

    else:
      import json
      return func.HttpResponse(json.dumps({"payload": "blah", "status": "Ok"}), mimetype="application/json")


export function base64ToObjectUrl(
  base64Content: string,
  mimeType = "application/octet-stream",
): string {
  const byteCharacters = atob(base64Content);
  const byteNumbers = new Array(byteCharacters.length);

  for (let index = 0; index < byteCharacters.length; index += 1) {
    byteNumbers[index] = byteCharacters.charCodeAt(index);
  }

  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], { type: mimeType });

  return URL.createObjectURL(blob);
}

export function downloadBase64File(
  base64Content: string,
  fileName: string,
  mimeType = "application/octet-stream",
) {
  const objectUrl = base64ToObjectUrl(base64Content, mimeType);
  const anchor = document.createElement("a");

  anchor.href = objectUrl;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(objectUrl);
}

/**
 * Streams a base64 file into a tab that was already opened synchronously
 * inside the click handler (e.g. `window.open("about:blank", "_blank")`).
 *
 * Opening the tab up front and only setting its location after the async
 * work keeps the call inside the user gesture, so the browser's pop-up
 * blocker does not discard it.
 */
export function renderBase64FileInWindow(
  target: Window,
  base64Content: string,
  mimeType = "application/octet-stream",
) {
  const objectUrl = base64ToObjectUrl(base64Content, mimeType);
  target.location.href = objectUrl;

  // Revoke once the tab has had time to load the resource.
  window.setTimeout(() => {
    URL.revokeObjectURL(objectUrl);
  }, 10000);
}

// TODO: Replace these demo helpers with Firebase Storage upload/download logic.
// Uploads should validate file type, size, startup linkage, document type, and access role.

export async function uploadDocumentPlaceholder(fileMeta) {
  return {
    ok: false,
    message: "Upload is disabled in static prototype mode.",
    fileMeta
  };
}

import * as FileSystem from "expo-file-system/legacy";

function sanitizeFileName(name) {
  return String(name || "photo").replace(/[^a-zA-Z0-9._-]+/g, "_");
}

function inferExtension(asset) {
  const fileName = String(asset?.name || "").toLowerCase();

  if (fileName.endsWith(".jpg") || fileName.endsWith(".jpeg")) {
    return "jpg";
  }

  if (fileName.endsWith(".png")) {
    return "png";
  }

  if (fileName.endsWith(".webp")) {
    return "webp";
  }

  if (fileName.endsWith(".gif")) {
    return "gif";
  }

  if (String(asset?.mimeType || "").includes("png")) {
    return "png";
  }

  if (String(asset?.mimeType || "").includes("webp")) {
    return "webp";
  }

  return "jpg";
}

async function ensureProfilePhotoDirectory() {
  const base = FileSystem.documentDirectory;
  if (!base) {
    return null;
  }

  const directory = `${base}profile-photos/`;
  const info = await FileSystem.getInfoAsync(directory);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(directory, { intermediates: true });
  }

  return directory;
}

export async function storeProfilePhoto(asset, userId) {
  const directory = await ensureProfilePhotoDirectory();
  if (!directory) {
    throw new Error("Impossible de créer le dossier de la photo de profil");
  }

  const extension = inferExtension(asset);
  const fileName = sanitizeFileName(`profile-${userId || Date.now()}.${extension}`);
  const destinationUri = `${directory}${fileName}`;

  const existingInfo = await FileSystem.getInfoAsync(destinationUri);
  if (existingInfo.exists) {
    await FileSystem.deleteAsync(destinationUri, { idempotent: true });
  }

  try {
    await FileSystem.copyAsync({ from: asset.uri, to: destinationUri });
  } catch (error) {
    const base64 = await FileSystem.readAsStringAsync(asset.uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    await FileSystem.writeAsStringAsync(destinationUri, base64, {
      encoding: FileSystem.EncodingType.Base64,
    });
  }

  const verify = await FileSystem.getInfoAsync(destinationUri);
  if (!verify.exists) {
    throw new Error("La photo n'a pas pu être enregistrée");
  }

  return {
    localUri: destinationUri,
    fileName,
    mimeType: asset.mimeType || null,
    size: verify.size || asset.size || null,
  };
}
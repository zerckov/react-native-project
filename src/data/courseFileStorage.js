import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { Linking, Platform } from "react-native";

function sanitizeFileName(name) {
  return String(name || "cours").replace(/[^a-zA-Z0-9._-]+/g, "_");
}

function inferMimeTypeFromName(fileName) {
  const extension = String(fileName || "")
    .toLowerCase()
    .split(".")
    .pop();
  const mimeTypes = {
    pdf: "application/pdf",
    doc: "application/msword",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    xls: "application/vnd.ms-excel",
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ppt: "application/vnd.ms-powerpoint",
    pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    txt: "text/plain",
    csv: "text/csv",
    json: "application/json",
    zip: "application/zip",
    rar: "application/vnd.rar",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    webp: "image/webp",
    mp3: "audio/mpeg",
    m4a: "audio/mp4",
    wav: "audio/wav",
    mp4: "video/mp4",
    webm: "video/webm",
  };
  return mimeTypes[extension] || null;
}

async function ensureUploadDirectory() {
  // documentDirectory est permanent sur Android
  const base = FileSystem.documentDirectory;
  if (!base) return null;

  const uploadDir = `${base}course-uploads/`;
  const info = await FileSystem.getInfoAsync(uploadDir);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(uploadDir, { intermediates: true });
  }
  return uploadDir;
}

export async function storeCourseAttachment(asset, subjectId) {
  const uploadDir = await ensureUploadDirectory();
  const fileName = sanitizeFileName(asset.name || `cours-${Date.now()}`);
  
  // Nom unique pour éviter les collisions
  const uniqueName = `${subjectId}-${Date.now()}-${fileName}`;
  const destinationUri = uploadDir ? `${uploadDir}${uniqueName}` : null;

  if (!destinationUri) {
    throw new Error("Impossible de créer le dossier de stockage");
  }

  // Copier le fichier depuis l'URI temporaire vers le stockage permanent
  try {
    await FileSystem.copyAsync({ from: asset.uri, to: destinationUri });
  } catch (copyError) {
    
    try {
      const base64 = await FileSystem.readAsStringAsync(asset.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      await FileSystem.writeAsStringAsync(destinationUri, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });
    } catch (fallbackError) {
      throw new Error("Échec de la copie du fichier : " + fallbackError.message);
    }
  }

  // Vérifier que la copie a bien eu lieu
  const verify = await FileSystem.getInfoAsync(destinationUri);
  if (!verify.exists) {
    throw new Error("Le fichier n'a pas été copié correctement");
  }

  const resolvedMimeType =
    asset.mimeType || inferMimeTypeFromName(fileName);

  return {
    title: asset.name || fileName,
    fileName: uniqueName,
    localUri: destinationUri, // chemin permanent sauvegardé en base
    mimeType: resolvedMimeType,
    size: verify.size || asset.size || null,
  };
}

export async function openCourseAttachment(localUri, mimeType = null) {
  if (!localUri) return false;

  try {
    // Vérifier que le fichier existe toujours
    const info = await FileSystem.getInfoAsync(localUri);
    if (!info.exists) {
      console.warn("Fichier introuvable :", localUri);
      return false;
    }

    if (Platform.OS === "android") {
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) return false;

      const resolvedMimeType =
        mimeType || inferMimeTypeFromName(localUri) || "*/*";

      await Sharing.shareAsync(localUri, {
        mimeType: resolvedMimeType,
        dialogTitle: "Ouvrir avec...",
      });

      return true;
    }

    await Linking.openURL(localUri);
    return true;

  } catch (error) {
    console.warn("Impossible d'ouvrir le fichier :", error);
    return false;
  }
}

// Utilitaire pour supprimer un fichier (ex: quand on supprime un cours)
export async function deleteCourseAttachment(localUri) {
  if (!localUri) return;
  try {
    const info = await FileSystem.getInfoAsync(localUri);
    if (info.exists) {
      await FileSystem.deleteAsync(localUri, { idempotent: true });
    }
  } catch (error) {
    console.warn("Impossible de supprimer le fichier :", error);
  }
}
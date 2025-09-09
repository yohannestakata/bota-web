export type PendingPhotoFile = {
  file: File;
  id: string;
  previewUrl: string;
  menuItemId?: string | null;
  photoCategoryId?: number | null;
  altText?: string;
};

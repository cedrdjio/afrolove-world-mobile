/**
 * Image picking helpers (expo-image-picker) + multipart builders for the
 * AfriLove gateway, which uploads files to Supabase Storage server-side.
 */
import * as ImagePicker from 'expo-image-picker';

export interface PickedImage {
  uri: string;
  name: string;
  type: string;
}

function toPicked(asset: ImagePicker.ImagePickerAsset): PickedImage {
  const name = asset.fileName ?? asset.uri.split('/').pop() ?? `photo_${Date.now()}.jpg`;
  const type = asset.mimeType ?? 'image/jpeg';
  return { uri: asset.uri, name, type };
}

/** Prompt for media-library permission then let the user pick image(s). */
export async function pickImages(max = 1): Promise<PickedImage[]> {
  const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!perm.granted) return [];
  const res = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsMultipleSelection: max > 1,
    selectionLimit: max,
    quality: 0.8,
  });
  if (res.canceled) return [];
  return res.assets.map(toPicked);
}

/** Append picked images to a FormData as photo0..N with a `size` field. */
export function appendPhotos(form: FormData, images: PickedImage[]) {
  form.append('size', String(images.length));
  images.forEach((img, i) => {
    // React Native FormData file shape
    form.append(`photo${i}`, { uri: img.uri, name: img.name, type: img.type } as unknown as Blob);
  });
}

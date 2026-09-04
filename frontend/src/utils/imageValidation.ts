export type ImageValidationOptions = {
  allowedTypes: readonly string[];
  maxSize: number;
  invalidTypeMessage: string;
  maxSizeMessage: string;
};

export function validateImageFile(
  file: File,
  options: ImageValidationOptions,
): string | null {
  if (!options.allowedTypes.includes(file.type)) {
    return options.invalidTypeMessage;
  }

  if (file.size > options.maxSize) {
    return options.maxSizeMessage;
  }

  return null;
}

export function capitalizeFirstLetter(text: string | undefined): string {
  if (text == undefined) {
    return "";
  }

  return text.charAt(0).toUpperCase() + text.slice(1);
}

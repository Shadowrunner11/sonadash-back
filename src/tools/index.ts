import langMap from 'lang-map';

export const getFileExtension = (filePath: string) =>
  filePath?.split('.')?.pop() || filePath;

export function getFirstLanguageFromFile(filePath: string) {
  try {
    const [firstLanguage] = langMap.languages(getFileExtension(filePath)) ?? [];

    return firstLanguage;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
    return 'File type not identified';
  }
}

export const formatISOWithTUTCDate = (date: Date) =>
  date.toISOString().replace(/\..+Z/i, '+0000');

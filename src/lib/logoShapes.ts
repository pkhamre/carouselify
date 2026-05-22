import type { LogoShape } from "@/lib/types";

export const logoShapeOrder: LogoShape[] = [
  "blob-1",
  "blob-2",
  "blob-3",
  "blob-4",
  "blob-5",
];

export const logoShapePaths: Record<LogoShape, string> = {
  "blob-1": "M55 8C35 8 18 22 15 42C12 62 22 82 38 92C54 102 78 98 92 82C106 66 102 38 82 22C72 14 63 8 55 8Z",
  "blob-2": "M56 10C40 7 23 16 17 31C11 46 14 66 27 79C40 92 63 100 82 93C101 86 108 64 102 45C96 26 76 13 56 10Z",
  "blob-3": "M52 9C33 12 18 27 16 45C14 63 24 80 41 90C58 100 82 100 95 84C108 68 110 44 96 28C82 12 68 6 52 9Z",
  "blob-4": "M57 11C43 9 29 15 21 27C13 39 10 55 17 69C24 83 41 94 59 96C77 98 95 91 102 76C109 61 105 40 93 27C81 14 69 12 57 11Z",
  "blob-5": "M54 8C38 8 24 18 18 32C12 46 14 62 25 75C36 88 55 95 73 93C91 91 105 80 104 64C103 48 95 39 94 27C93 15 70 8 54 8Z",
};

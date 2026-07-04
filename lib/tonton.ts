export interface TontonSticker {
  id: "yuta" | "bella" | "tobi";
  label: string;
  src: string;
}

export const TONTON_STICKERS: TontonSticker[] = [
  {
    id: "yuta",
    label: "Chubby Yuta the shiba",
    src: "https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExNzVyaHRraDIxYXY0dmRpczQ5eXE0dml5cm96cHg5a3Rpa3Zsejg4aiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/HWeUBuTIJV73ybn2bd/giphy.gif",
  },
  {
    id: "bella",
    label: "Tsundere Bella the cat",
    src: "https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExNzN5YjRhdTduc2YyeTExamZod3RjYmVkdmMzaHl3dnRob2VjaWI4dyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/3i4g2nMtIXT9Y0sUUz/giphy.gif",
  },
  {
    id: "tobi",
    label: "Chubby Tobi the bunny",
    src: "https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExb3AxNTZ1ZnVyeGcxMWduODkxaXI4NzY3aDlieHJrMXR4dDRqdjU2aiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/scGLs3atZgUCevRxn1/giphy.gif",
  },
];

export function tontonById(id: TontonSticker["id"]): TontonSticker {
  const found = TONTON_STICKERS.find((s) => s.id === id);
  if (!found) throw new Error(`Unknown tonton id: ${id}`);
  return found;
}

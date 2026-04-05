export type UpdateType = "Project" | "Cert" | "Article";

export type UpdateEntry = {
  date: string;
  type: UpdateType;
  title: string;
  description: string;
  link: string;
};

export interface GenreWithoutDescription {
  id: number;
  name: string;
}

export interface Genre extends GenreWithoutDescription {
  description: string;
}

export interface StorybookResponse {
  id: number;
  title: string;
  description: string;
  authorId: number;
  authorName: string;
  categoryId: number;
  categoryName: string;
  price: number;
  audioUrl: string;
  sampleAudioUrl: string;
  coverImageUrl: string;
  createdAt: string;
}

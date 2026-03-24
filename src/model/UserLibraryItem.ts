import { StorybookResponse } from './StorybookResponse';

export interface UserLibraryItem {
  id: number;
  storybook: StorybookResponse;
  purchasedAt: string;
}

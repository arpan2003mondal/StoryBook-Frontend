import axiosInstance from '../utils/axiosConfig';
import { StorybookResponse } from '../model/StorybookResponse';

export class StoryBookService {
  
  /**
   * Get all storybooks
   */
  static getAllStorybooks(): Promise<StorybookResponse[]> {
    return axiosInstance
      .get('/storybooks')
      .then(response => response.data);
  }

  /**
   * Search storybooks by keyword
   */
  static searchStorybooks(keyword: string): Promise<StorybookResponse[]> {
    return axiosInstance
      .get('/storybooks/search', {
        params: { keyword }
      })
      .then(response => response.data);
  }

  /**
   * Get storybook by ID
   */
  static getStorybookById(id: number): Promise<StorybookResponse> {
    return axiosInstance
      .get(`/storybooks/${id}`)
      .then(response => response.data);
  }
}

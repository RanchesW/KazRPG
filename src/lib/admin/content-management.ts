// ===== src/lib/admin/content-management.ts =====
interface ContentBlock {
  id: string
  type: 'text' | 'image' | 'video' | 'carousel' | 'cta'
  title?: string
  content: any
  order: number
  isActive: boolean
  language: 'RU' | 'KK' | 'EN'
}

interface Page {
  id: string
  slug: string
  title: string
  description?: string
  blocks: ContentBlock[]
  seoTitle?: string
  seoDescription?: string
  isPublished: boolean
  language: 'RU' | 'KK' | 'EN'
}

import axios from 'axios';

export class ContentManagementService {
  private apiUrl: string;
  private apiToken: string;

  constructor(apiUrl = 'http://localhost:1337/api', apiToken = '') {
    this.apiUrl = apiUrl;
    this.apiToken = apiToken;
  }

  private get headers() {
    return {
      Authorization: `Bearer ${this.apiToken}`,
      'Content-Type': 'application/json'
    };
  }

  async createPage(pageData: Omit<Page, 'id'>): Promise<Page> {
    try {
      const response = await axios.post(
        `${this.apiUrl}/pages`, 
        { data: pageData },
        { headers: this.headers }
      );
      return this.formatPageResponse(response.data.data);
    } catch (error) {
      console.error('Error creating page:', error);
      throw new Error('Failed to create page in CMS');
    }
  }

  async updatePage(id: string, updates: Partial<Page>): Promise<Page> {
    try {
      const response = await axios.put(
        `${this.apiUrl}/pages/${id}`,
        { data: updates },
        { headers: this.headers }
      );
      return this.formatPageResponse(response.data.data);
    } catch (error) {
      console.error('Error updating page:', error);
      throw new Error('Failed to update page in CMS');
    }
  }

  async deletePage(id: string): Promise<void> {
    try {
      await axios.delete(
        `${this.apiUrl}/pages/${id}`,
        { headers: this.headers }
      );
    } catch (error) {
      console.error('Error deleting page:', error);
      throw new Error('Failed to delete page from CMS');
    }
  }

  async getPageBySlug(slug: string): Promise<Page | null> {
    try {
      const response = await axios.get(
        `${this.apiUrl}/pages?filters[slug]=${slug}`,
        { headers: this.headers }
      );
      
      if (response.data.data && response.data.data.length > 0) {
        return this.formatPageResponse(response.data.data[0]);
      }
      return null;
    } catch (error) {
      console.error('Error getting page by slug:', error);
      return null;
    }
  }

  async getAllPages(): Promise<Page[]> {
    try {
      const response = await axios.get(
        `${this.apiUrl}/pages`,
        { headers: this.headers }
      );
      
      return response.data.data.map(this.formatPageResponse);
    } catch (error) {
      console.error('Error getting all pages:', error);
      return [];
    }
  }

  // Helper to format Strapi response to match our interface
  private formatPageResponse(strapiData: any): Page {
    const attributes = strapiData.attributes;
    return {
      id: strapiData.id.toString(),
      slug: attributes.slug,
      title: attributes.title,
      description: attributes.description,
      blocks: attributes.blocks || [],
      seoTitle: attributes.seoTitle,
      seoDescription: attributes.seoDescription,
      isPublished: attributes.isPublished || false,
      language: attributes.language
    };
  }
}
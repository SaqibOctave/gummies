import { NotFoundError, ConflictError } from '../../common/errors';
import { getStorageProvider } from './storage/storageFactory';
import { mediaRepository } from './media.repository';
import { MediaRecord } from './media.types';

export const mediaService = {
  async upload(
    file: Express.Multer.File,
    altText: string | undefined,
    uploadedBy: string
  ): Promise<MediaRecord> {
    const provider = getStorageProvider();
    const { storageKey, url } = await provider.upload({
      buffer: file.buffer,
      originalName: file.originalname,
      mimeType: file.mimetype,
    });

    return mediaRepository.create({
      fileName: storageKey,
      originalName: file.originalname,
      mimeType: file.mimetype,
      sizeBytes: file.size,
      storageDriver: provider.driver,
      storageKey,
      url,
      altText,
      uploadedBy,
    });
  },

  async getById(id: string): Promise<MediaRecord> {
    const media = await mediaRepository.findById(id);
    if (!media) throw new NotFoundError('Media not found');
    return media;
  },

  async list(page: number, limit: number) {
    const offset = (page - 1) * limit;
    return mediaRepository.list(limit, offset);
  },

  async remove(id: string): Promise<void> {
    const media = await mediaRepository.findById(id);
    if (!media) throw new NotFoundError('Media not found');

    const provider = getStorageProvider();
    try {
      await mediaRepository.remove(id);
    } catch (error) {
      const pgError = error as { code?: string };
      if (pgError.code === '23503') {
        throw new ConflictError('Media is still referenced by a product or category');
      }
      throw error;
    }
    await provider.delete(media.storage_key);
  },
};

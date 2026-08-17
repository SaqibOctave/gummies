import { homepageRepository, CreateHomepageBlockInput, UpdateHomepageBlockInput } from './homepage.repository';
import { NotFoundError } from '../../common/errors';

export const homepageService = {
  async create(input: CreateHomepageBlockInput) {
    return homepageRepository.create(input);
  },

  async getPublicBlocks() {
    return homepageRepository.listActive();
  },

  async listAll() {
    return homepageRepository.listAll();
  },

  async getById(id: string) {
    const block = await homepageRepository.findById(id);
    if (!block) throw new NotFoundError('Homepage block not found');
    return block;
  },

  async update(id: string, input: UpdateHomepageBlockInput) {
    const existing = await homepageRepository.findById(id);
    if (!existing) throw new NotFoundError('Homepage block not found');
    const updated = await homepageRepository.update(id, input);
    if (!updated) throw new NotFoundError('Homepage block not found');
    return updated;
  },

  async remove(id: string) {
    const existing = await homepageRepository.findById(id);
    if (!existing) throw new NotFoundError('Homepage block not found');
    await homepageRepository.remove(id);
  },
};

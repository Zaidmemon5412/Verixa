import { BUILDERS } from '../constants/builderData';

export const builderService = {
  async getBuilders() {
    return BUILDERS;
  },

  async getBuilderById(id) {
    return BUILDERS.find((b) => b.id === String(id)) || BUILDERS[0];
  },
};

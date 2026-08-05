import { LOCALITIES } from '../constants/localityData';

export const localityService = {
  async getLocalities() {
    return LOCALITIES;
  },

  async getLocalityById(id) {
    return LOCALITIES.find((l) => l.id === String(id)) || LOCALITIES[0];
  },
};

import { config } from '@/config/env';
import { client, mockDelay } from '@/api/client';
import { endpoints } from '@/api/endpoints';

/** يُستدعى مرة واحدة بعد أول دخول لحساب أنشأه الأدمن (StudentController::update) */
export const studentAccountService = {
  async completeProfile(id, payload) {
    if (config.useMocks) {
      await mockDelay(300);
      return payload;
    }
    const { data } = await client.put(endpoints.students.update(id), payload);
    return data.data;
  },
};

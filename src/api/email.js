import api from './axios';

/** POST /api/emails/send — admin only */
export const sendEmailCampaign = async ({ subject, body, courseId }) => {
  const { data } = await api.post('/api/emails/send', {
    subject,
    body,
    courseId: Number(courseId),
  });
  return data;
};

/** GET /api/emails/ — all campaigns, newest first */
export const getCampaignHistory = async () => {
  const { data } = await api.get('/api/emails/');
  return data;
};

/** GET /api/emails/:campaignId — single campaign with recipients */
export const getCampaignById = async (campaignId) => {
  const { data } = await api.get(`/api/emails/${campaignId}`);
  return data;
};

/** GET /api/emails/:campaignId/recipients */
export const getRecipients = async (campaignId) => {
  const { data } = await api.get(`/api/emails/${campaignId}/recipients`);
  return data;
};

/** POST /api/emails/:campaignId/retry */
export const retryFailedEmails = async (campaignId) => {
  const { data } = await api.post(`/api/emails/${campaignId}/retry`);
  return data;
};

export default {
  async fetch(): Promise<Response> {
    return Response.json({ ok: true, stage: "bootstrap" });
  },
};

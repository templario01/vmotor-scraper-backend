export function getUserAgentFromHeaders(context: any) {
  return context.req.headers['user-agent'];
}

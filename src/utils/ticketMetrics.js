export function countPendingTicketClosures(tickets = []) {
  if (!Array.isArray(tickets)) return 0;
  return tickets.filter(ticket => ticket?.status === 'กำลังดำเนินการ').length;
}

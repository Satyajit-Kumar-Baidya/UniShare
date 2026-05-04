export function getNotificationTarget(type: string): string {
  switch (type) {
    case 'message':
      return '/inbox';
    case 'order_update':
      return '/profile';
    case 'group_update':
      return '/co-subs';
    default:
      return '/notifications';
  }
}

export function getNotificationActionLabel(type: string): string {
  switch (type) {
    case 'message':
      return 'Open Inbox';
    case 'order_update':
      return 'View Order Status';
    case 'group_update':
      return 'Open Group Listings';
    default:
      return 'Open';
  }
}

/**
 * Format datetime thành "time ago" format
 * VD: "2 phút trước", "1 giờ trước", "3 ngày trước"
 */
export function formatTimeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) {
    return 'Vừa xong';
  } else if (diffMinutes < 60) {
    return `${diffMinutes} phút trước`;
  } else if (diffHours < 24) {
    return `${diffHours} giờ trước`;
  } else if (diffDays < 7) {
    return `${diffDays} ngày trước`;
  } else {
    // Format as date if older than 7 days
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }
}

/**
 * Format location từ notification data
 */
export function formatNotificationLocation(data: any): string {
  if (data.location) {
    return data.location;
  }
  
  if (data.lat && data.lon) {
    return `${data.lat.toFixed(4)}, ${data.lon.toFixed(4)}`;
  }
  
  return 'Vị trí không xác định';
}

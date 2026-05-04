import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Notifications from './Notifications';

const mockUseSocket = vi.hoisted(() => vi.fn());

vi.mock('../context/SocketContext', () => ({
  useSocket: mockUseSocket,
}));

describe('Notifications page', () => {
  const markNotificationRead = vi.fn();

  beforeEach(() => {
    markNotificationRead.mockReset();
    mockUseSocket.mockReturnValue({
      notifications: [
        {
          id: 'n1',
          type: 'order_update',
          title: 'Order Confirmed',
          message: 'Your order has been placed.',
          read: false,
          timestamp: '2026-03-16T10:00:00.000Z',
        },
        {
          id: 'n2',
          type: 'message',
          title: 'New Message',
          message: 'A seller sent you a note.',
          read: true,
          timestamp: '2026-03-16T09:00:00.000Z',
        },
      ],
      markNotificationRead,
    });
  });

  it('filters notifications by category', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <Notifications />
      </MemoryRouter>
    );

    await user.click(screen.getByRole('button', { name: 'Orders' }));

    expect(screen.getByText('Order Confirmed')).toBeInTheDocument();
    expect(screen.queryByText('New Message')).not.toBeInTheDocument();
  });

  it('marks unread notification as read', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <Notifications />
      </MemoryRouter>
    );

    await user.click(screen.getByRole('button', { name: 'Mark Read' }));
    expect(markNotificationRead).toHaveBeenCalledWith('n1');
  });
});

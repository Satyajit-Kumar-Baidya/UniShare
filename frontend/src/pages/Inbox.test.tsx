import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Inbox from './Inbox';

const mockUseAuth = vi.hoisted(() => vi.fn());
const mockUseSocket = vi.hoisted(() => vi.fn());

vi.mock('../context/AuthContext', () => ({
  useAuth: mockUseAuth,
}));

vi.mock('../context/SocketContext', () => ({
  useSocket: mockUseSocket,
}));

describe('Inbox page', () => {
  const sendMessage = vi.fn();
  const markThreadRead = vi.fn();

  beforeEach(() => {
    sendMessage.mockReset();
    markThreadRead.mockReset();

    mockUseAuth.mockReturnValue({
      user: {
        id: 'u1',
        name: 'Jane',
        email: 'member@example.com',
      },
    });

    mockUseSocket.mockReturnValue({
      sendMessage,
      markThreadRead,
      messages: [
        {
          id: 'm1',
          senderId: 'u2',
          senderName: 'Alex',
          receiverId: 'u1',
          content: 'Is this still available?',
          timestamp: '2026-03-16T09:30:00.000Z',
        },
      ],
    });
  });

  it('sends a message in selected thread', async () => {
    const user = userEvent.setup();

    render(<Inbox />);

    const input = screen.getByPlaceholderText('Type your message...');
    await user.type(input, 'Yes, it is available');
    await user.keyboard('{Enter}');

    expect(sendMessage).toHaveBeenCalledWith('u2', 'Yes, it is available');
  });
});

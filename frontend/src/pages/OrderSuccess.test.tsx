import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import OrderSuccess from './OrderSuccess';

describe('OrderSuccess page', () => {
  it('renders provided order id from query params', () => {
    render(
      <MemoryRouter initialEntries={['/order-success?orderId=UNI-ABC123']}>
        <Routes>
          <Route path="/order-success" element={<OrderSuccess />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('UNI-ABC123')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Continue Shopping' })).toBeInTheDocument();
  });
});

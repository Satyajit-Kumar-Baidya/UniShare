import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import Auth from './Auth';
import { AuthProvider } from '../context/AuthContext';

describe('Auth page', () => {
  it('allows signup with any valid email and shows verification state', async () => {
    const user = userEvent.setup();

    render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/signup']}>
          <Routes>
            <Route path="/signup" element={<Auth />} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    );

    await user.type(screen.getByLabelText('Full Name'), 'Sam Student');
    await user.type(screen.getByLabelText('Institution (Optional)'), 'State University');
    await user.type(screen.getByLabelText('Email Address'), 'sam@gmail.com');
    await user.type(screen.getByLabelText('Password'), 'password123');
    await user.type(screen.getByLabelText('Confirm Password'), 'password123');

    await user.click(screen.getByRole('button', { name: 'Create account' }));

    expect(await screen.findByRole('heading', { name: 'Verify your email' })).toBeInTheDocument();
  });

  it('navigates to signup view when toggle button is clicked from login', async () => {
    const user = userEvent.setup();

    render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/login']}>
          <Routes>
            <Route path="/login" element={<Auth />} />
            <Route path="/signup" element={<Auth />} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    );

    await user.click(screen.getByRole('button', { name: "Don't have an account? Sign up" }));

    expect(await screen.findByRole('heading', { name: 'Join UniShare' })).toBeInTheDocument();
  });

  it('supports continue with Google from login screen', async () => {
    const user = userEvent.setup();

    render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/login']}>
          <Routes>
            <Route path="/login" element={<Auth />} />
            <Route path="/dashboard" element={<div>Dashboard Screen</div>} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    );

    await user.click(screen.getByRole('button', { name: 'Continue with Google' }));

    expect(await screen.findByText('Dashboard Screen')).toBeInTheDocument();
  });
});

import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders game board and pieces', () => {
  render(<App />);
  const pieceElements = screen.getAllByText(/C/i); // Check for Circle pieces
  expect(pieceElements.length).toBeGreaterThan(0);
});

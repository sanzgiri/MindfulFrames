import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './App';

describe('App', () => {
    it('renders without crashing', () => {
        render(<App />);
        // Since App redirects to Welcome or Dashboard depending on route, 
        // and we are in a test environment (likely '/'), it should render something.
        // For now, just checking if it renders is enough smoke test.
        expect(document.body).toBeInTheDocument();
    });
});

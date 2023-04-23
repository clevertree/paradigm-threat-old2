import React from 'react';
import {render, screen} from '@testing-library/react';
import App from './App';

test('renders loading screen', () => {
    render(<App/>);
    const linkElement = screen.getByText('Loading...');
    expect(linkElement).toBeInTheDocument();
});

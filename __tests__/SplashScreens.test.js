import React from 'react';
import { render, act } from '@testing-library/react-native';
import SplashScreens from '../screens/SplashScreens';

jest.useFakeTimers();

describe('SplashScreens', () => {
    it('renders and transitions after the animation', async () => {
        const onFinish = jest.fn();

        const start = Date.now();
        render(<SplashScreens onFinish={onFinish} />);

        await act(async () => {
            jest.advanceTimersByTime(3000);
        });

        const elapsed = Date.now() - start;
        console.log(`Simulated time until transition: ${elapsed}ms`);

        expect(onFinish).toHaveBeenCalled();
    });
});

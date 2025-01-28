// Import dependencies and libraries used for testing App
import React from 'react';
import { render } from '@testing-library/react-native';
import App from '../../App';

describe('<App />', () => {

    // Snapshot test for App
    it('should match snapshot of App', () => {
        // Renders the App component
        const { toJSON } = render( <App /> );
        // Verify snapshot matches
        expect(toJSON()).toMatchSnapshot();
    });
});

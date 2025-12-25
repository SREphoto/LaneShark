/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';

const Controls: React.FC = () => {
    return (
        <div className="controls-info text-sm text-gray-400 mt-4">
            <p className='my-1'>Position: <span className="key-highlight">&larr;</span> <span className="key-highlight">&rarr;</span></p>
            <p className="hit-instruction text-base font-bold text-yellow-300 mt-2">Roll: <span className="key-highlight">SPACEBAR</span></p>
        </div>
    );
};

export default Controls;
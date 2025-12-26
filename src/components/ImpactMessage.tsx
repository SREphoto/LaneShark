/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface ImpactMessageProps {
  message: string;
  isVisible: boolean;
}

const ImpactMessage: React.FC<ImpactMessageProps> = ({ message, isVisible }) => {
  if (!isVisible || !message) {
    return null;
  }

  return (
    <div className="impact-message-overlay" aria-live="assertive" role="alert">
      <div className="impact-message-text bloom chromatic-aberration">
        {message}
      </div>
    </div>
  );
};

export default ImpactMessage;

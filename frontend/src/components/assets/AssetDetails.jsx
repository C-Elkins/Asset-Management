import React from 'react';

export const AssetDetails = ({ asset }) => (
  <section>
    <h2>{asset?.name}</h2>
    <dl>
      <dt>Serial</dt><dd>{asset?.serialNumber}</dd>
    </dl>
  </section>
);

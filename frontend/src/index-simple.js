import React from 'react';
import ReactDOM from 'react-dom/client';
console.log('JavaScript is loading...');

const App = () => {
  return React.createElement('div', 
    { style: { padding: '20px', fontFamily: 'Arial' } },
    React.createElement('h1', null, 'IT Asset Management System'),
    React.createElement('p', null, 'Basic React app is working!'),
    React.createElement('button', 
      { onClick: () => alert('Button clicked!') }, 
      'Test Button'
    )
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(App));

import React from 'react';
import ReactDOM from 'react-dom';

export function App() {
  return (
    <div className="App">
      <span>React installation complete! Build something great.</span>
    </div>
  );
}

ReactDOM.render(<App />, document.getElementById('root'));

if (module.hot) {
  module.hot.accept();
}


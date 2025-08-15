import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import './App.css';

const Home = () => (
  <div className="page">
    <h1>Welcome to Test Router</h1>
    <p>This is a test of React Router v6</p>
    <Link to="/about" className="nav-link">Go to About</Link>
  </div>
);

const About = () => (
  <div className="page">
    <h1>About Page</h1>
    <p>This is the about page</p>
    <Link to="/" className="nav-link">Back to Home</Link>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <nav>
          <ul className="nav-links">
            <li><Link to="/" className="nav-link">Home</Link></li>
            <li><Link to="/about" className="nav-link">About</Link></li>
          </ul>
        </nav>
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;

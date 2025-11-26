import { useNavigate } from 'react-router-dom';
import './Home.css';

function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <div className="background-animation">
        <div className="circle circle-1"></div>
        <div className="circle circle-2"></div>
        <div className="circle circle-3"></div>
      </div>
      
      <div className="content">
        <h1 className="title">Shanify</h1>
        <p className="subtitle">Créez votre site web en quelques clics, simple nan ?</p>
        <div className="buttons-container">
          <button 
            className="btn btn-primary"
            onClick={() => navigate('/register')}
          >
            Créer un compte
          </button>
          <button 
            className="btn btn-secondary"
            onClick={() => navigate('/login')}
          >
            Se connecter
          </button>
        </div>
      </div>
    </div>
  );
}

export default Home;
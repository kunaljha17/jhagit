import { createRoot } from 'react-dom/client'
import './index.css'
import { AuthProvider } from './authContext.jsx'
import ProjectRoutes from './Routes.jsx'
import Footer from './components/Footer.jsx'

import { BrowserRouter as Router } from 'react-router-dom'

createRoot(document.getElementById('root')).render(
   <AuthProvider>
    <Router>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100%' }}>
        <div style={{ flex: 1 }}>
          <ProjectRoutes />
        </div>
        <Footer />
      </div>
    </Router>
   </AuthProvider>
);

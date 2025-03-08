import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './presentation/routes/AppRoutes';
import { AuthProvider } from './presentation/hooks/useAuth';

function App() {
  return (
      <Router>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </Router>
  );
}

export default App;
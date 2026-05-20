import { useState } from 'react';
import { ToastProvider } from './context/ToastContext';
import { Sidebar } from './components/layout/Sidebar';
import { Topbar } from './components/layout/Topbar';
import Dashboard from './pages/Dashboard';
import Insights from './pages/Insights';
import Recommendations from './pages/Recommendations';
import Agent from './pages/Agent';
import Resources from './pages/Resources';
import Goals from './pages/Goals';

function App() {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [apiConnected] = useState(true);

  const renderContent = () => {
    switch (activeTab) {
      case 'Dashboard': return <Dashboard />;
      case 'Cost Analysis': return <Insights />;
      case 'Recommendations': return <Recommendations />;
      case 'Agent': return <Agent />;
      case 'Resources': return <Resources />;
      case 'Goals': return <Goals />;
      default: return <Dashboard />;
    }
  };

  return (
    <ToastProvider>
      <div className="flex h-screen w-full overflow-hidden bg-[var(--bg)]">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          apiConnected={apiConnected}
        />
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <Topbar activeTab={activeTab} />
          <div className="flex-1 overflow-auto">
            <div className="max-w-[1200px] mx-auto px-8 py-8">
              {renderContent()}
            </div>
          </div>
        </main>
      </div>
    </ToastProvider>
  );
}

export default App;
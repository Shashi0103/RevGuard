import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './layouts/AppLayout';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { RecoveryQueuePage } from './pages/RecoveryQueuePage';
import { AgentConsolePage } from './pages/AgentConsolePage';
import { TransactionsPage } from './pages/TransactionsPage';
import { TransactionDetailPage } from './pages/TransactionDetailPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { AuditLogsPage } from './pages/AuditLogsPage';
import { SettingsPage } from './pages/SettingsPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route
          path="/*"
          element={
            <AppLayout>
              <Routes>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/recovery" element={<RecoveryQueuePage />} />
                <Route path="/agent" element={<AgentConsolePage />} />
                <Route path="/transactions" element={<TransactionsPage />} />
                <Route path="/transactions/:id" element={<TransactionDetailPage />} />
                <Route path="/analytics" element={<AnalyticsPage />} />
                <Route path="/audit" element={<AuditLogsPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </AppLayout>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default App;

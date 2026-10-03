import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './pages/Dashboard';
import { Simulator } from './pages/Simulator';
import { Audit } from './pages/Audit';
import { Agents } from './pages/Agents';
import { Policies } from './pages/Policies';
import { Sandbox } from './pages/Sandbox';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <Layout title="Security Control Plane" subtitle="Real-time Autonomous AI Agent Interception & Metrics">
              <Dashboard />
            </Layout>
          }
        />
        <Route
          path="/simulator"
          element={
            <Layout title="Live Attack Simulator" subtitle="Step-by-Step Interception, Threat Engine & Before/After Comparison">
              <Simulator />
            </Layout>
          }
        />
        <Route
          path="/audit"
          element={
            <Layout title="Immutable Audit Trail" subtitle="Tamper-Evident Security Log of All Intercepted AI Tool Invocations">
              <Audit />
            </Layout>
          }
        />
        <Route
          path="/agents"
          element={
            <Layout title="Protected Agents" subtitle="Least-Privilege Agent Whitelists, Allowed Tools & Security Bounds">
              <Agents />
            </Layout>
          }
        />
        <Route
          path="/policies"
          element={
            <Layout title="Runtime Security Policies" subtitle="Deterministic Security Rules, Egress Limits & Enforcement Actions">
              <Policies />
            </Layout>
          }
        />
        <Route
          path="/sandbox"
          element={
            <Layout title="Tool Call Sandbox" subtitle="Interactive Custom Payload Tester & Explainable Risk Scoring">
              <Sandbox />
            </Layout>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

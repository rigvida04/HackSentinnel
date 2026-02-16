
import React, { useState, useEffect, useCallback } from 'react';
import { AppMode, Tab, SecurityReport } from './types';
import { getSecurityInsights } from './services/geminiService';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.SCAN);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [userIp, setUserIp] = useState('104.198.214.223');
  const [report, setReport] = useState<SecurityReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('https://api.ipify.org?format=json')
      .then(res => res.json())
      .then(data => setUserIp(data.ip))
      .catch(() => console.log('Using fallback IP'));
  }, []);

  const handleStartScan = useCallback(async () => {
    setIsScanning(true);
    setError(null);
    setScanProgress(0);
    setReport(null);

    const interval = setInterval(() => {
      setScanProgress(prev => (prev >= 100 ? 100 : prev + 4));
    }, 80);

    try {
      const portsToScan = [22, 23, 80, 443]; 
      const result = await getSecurityInsights(portsToScan, userIp);
      
      setTimeout(() => {
        setReport(result);
        setIsScanning(false);
        setActiveTab(Tab.PORTS);
      }, 2000);
    } catch (err) {
      setError("Failed to generate security report. Please check API key/connectivity.");
      setIsScanning(false);
    } finally {
      clearInterval(interval);
    }
  }, [userIp]);

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-slate-800 pb-20">
      {/* HEADER SECTION (Screenshot 1) */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <i className="fa-solid fa-magnifying-glass text-slate-400 text-lg"></i>
            <div>
              <h1 className="text-lg font-bold tracking-tight">Port Scan & Vulnerability Assessment</h1>
              <p className="text-xs text-slate-500">Scan your network for open ports and potential security vulnerabilities</p>
            </div>
          </div>
          
          <div className="flex flex-1 max-w-2xl w-full items-center gap-2">
            <input 
              type="text" 
              value={userIp}
              onChange={(e) => setUserIp(e.target.value)}
              className="flex-1 bg-white border border-slate-200 rounded-lg px-4 py-2 font-mono text-sm shadow-sm focus:ring-2 focus:ring-slate-100 outline-none"
              placeholder="104.198.214.223"
            />
            <button 
              onClick={handleStartScan}
              disabled={isScanning}
              className="bg-[#1a1a1a] text-white px-6 py-2 rounded-lg font-bold text-sm hover:bg-black transition-all disabled:opacity-50"
            >
              Quick Scan
            </button>
            <button 
              onClick={handleStartScan}
              disabled={isScanning}
              className="bg-white border border-slate-200 text-slate-700 px-6 py-2 rounded-lg font-bold text-sm hover:bg-slate-50 transition-all disabled:opacity-50 shadow-sm"
            >
              Full Scan
            </button>
          </div>
        </div>
      </header>

      {/* NAV TABS (Screenshot 6) */}
      <nav className="bg-white border-b border-slate-100 px-6 py-1">
        <div className="max-w-7xl mx-auto flex gap-1">
          {[
            { id: Tab.SCAN, label: 'Scan', icon: 'fa-magnifying-glass' },
            { id: Tab.PORTS, label: 'Ports', icon: 'fa-wave-square' },
            { id: Tab.PROTECTION, label: 'Protection', icon: 'fa-shield-halved' },
            { id: Tab.HISTORY, label: 'History', icon: 'fa-file-lines' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 text-sm font-semibold transition-all border-b-2 ${activeTab === tab.id ? 'border-slate-800 text-slate-900' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
            >
              <i className={`fa-solid ${tab.icon}`}></i>
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-6 space-y-6">
        
        {isScanning && (
          <div className="bg-white border border-slate-200 rounded-xl p-16 text-center shadow-sm animate-pulse">
            <i className="fa-solid fa-spinner fa-spin text-3xl text-slate-300 mb-4"></i>
            <h2 className="text-xl font-bold mb-2">Analyzing Target Vulnerabilities</h2>
            <div className="max-w-xs mx-auto h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-slate-900" style={{ width: `${scanProgress}%` }}></div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 p-4 rounded-xl text-red-600 font-medium flex gap-3 items-center">
            <i className="fa-solid fa-circle-exclamation"></i>
            {error}
          </div>
        )}

        {report && activeTab === Tab.PORTS && (
          <div className="space-y-6 animate-slide-in">
            
            {/* COMPROMISED ALERT (Screenshot 1) */}
            {report.status === 'compromised' && (
              <div className="bg-[#fff9f4] border-2 border-orange-500 rounded-xl p-8 shadow-sm">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full border-2 border-red-500 flex items-center justify-center text-red-500">
                      <i className="fa-solid fa-xmark text-xl font-black"></i>
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Device Compromised</h2>
                      <p className="text-slate-500 font-medium text-sm">Threat Level: Likely Compromised</p>
                    </div>
                  </div>
                  <div className="bg-[#f25c54] text-white px-6 py-2 rounded-xl font-bold text-lg shadow-sm">
                    {report.confidence}% Confidence
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-bold text-slate-800 flex items-center gap-2">
                    <i className="fa-solid fa-triangle-exclamation text-slate-900"></i>
                    Indicators of Compromise:
                  </h4>
                  <ul className="space-y-1 list-disc list-inside text-red-600 font-medium text-sm ml-4">
                    {report.indicators.map((ind, i) => <li key={i}>{ind}</li>)}
                  </ul>
                </div>

                {/* URGENT ACTIONS BOX (Screenshot 1) */}
                <div className="mt-8 border border-red-500 rounded-xl p-5 bg-white">
                  <h4 className="text-red-600 font-bold flex items-center gap-2 text-sm uppercase mb-4">
                    <i className="fa-solid fa-shield-halved"></i>
                    URGENT: Immediate Actions Required
                  </h4>
                  <ol className="space-y-2 text-sm font-bold text-slate-900">
                    {report.remediationPlan.slice(0, 5).map((step, i) => (
                      <li key={i} className="flex gap-2">
                        <span>{i + 1}.</span> {step}
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            )}

            {/* SECURITY SCORE (Screenshot 2) */}
            <section className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-slate-600 text-sm">Security Score</h3>
                <span className="text-4xl font-black text-yellow-500">{report.score}/100</span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden mb-3">
                <div 
                  className={`h-full transition-all duration-1000 ${report.score < 50 ? 'bg-red-500' : report.score < 75 ? 'bg-slate-900' : 'bg-green-500'}`}
                  style={{ width: `${report.score}%` }}
                ></div>
              </div>
              <p className="text-xs text-slate-500">Your system needs some security improvements</p>
            </section>

            {/* OPEN PORTS (Screenshot 2) */}
            <section className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <i className="fa-solid fa-waveform-path text-slate-800"></i>
                <h3 className="font-bold text-sm">Open Ports Detected ({report.vulnerabilities.length})</h3>
              </div>
              <div className="flex gap-3">
                {report.vulnerabilities.map(v => (
                  <span key={v.port} className="bg-white border border-slate-200 px-4 py-2 rounded-lg font-bold text-sm shadow-sm">
                    Port {v.port}
                  </span>
                ))}
              </div>
            </section>

            {/* VULNERABILITY DETAILS (Screenshot 3 & 4) */}
            <section className="space-y-4">
              <div className="flex items-center gap-2 text-orange-600 font-bold py-2">
                <i className="fa-solid fa-triangle-exclamation"></i>
                <h3 className="text-sm">Vulnerability Details</h3>
              </div>
              
              {report.vulnerabilities.map((v, i) => (
                <div key={i} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col md:flex-row">
                  <div className={`w-1 ${v.risk === 'critical' || v.risk === 'high' ? 'bg-red-500' : 'bg-orange-500'}`}></div>
                  <div className="p-6 flex-1">
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="text-lg font-bold text-slate-900">Port {v.port} - {v.service}</h4>
                      <span className={`text-[10px] px-3 py-1 rounded font-black uppercase text-white ${
                        v.risk === 'critical' ? 'bg-red-500' : 
                        v.risk === 'high' ? 'bg-red-500' : 'bg-orange-500'
                      }`}>
                        {v.risk === 'critical' ? 'Critical Risk' : v.risk === 'high' ? 'High Risk' : 'Medium Risk'}
                      </span>
                    </div>
                    <p className="text-slate-500 text-xs mb-6">{v.description}</p>
                    
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-[#2bb16a] font-bold text-xs">
                        <i className="fa-solid fa-circle-check"></i>
                        Protection Methods:
                      </div>
                      <ul className="space-y-2 ml-6 text-xs text-slate-600 font-medium">
                        {v.protectionMethods.map((method, mi) => (
                          <li key={mi} className="flex gap-2">
                            <span className="text-slate-400">•</span> {method}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </section>

            {/* RECOMMENDATIONS (Screenshot 4) */}
            <section className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-6 text-blue-600 font-bold">
                <i className="fa-solid fa-chart-line"></i>
                <h3 className="text-sm">Security Recommendations</h3>
              </div>
              <ul className="space-y-4">
                {report.recommendations.map((rec, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm font-bold text-slate-700">
                    <div className="text-green-500 bg-white border border-green-500 rounded-full w-5 h-5 flex items-center justify-center">
                      <i className="fa-solid fa-check text-[10px]"></i>
                    </div>
                    {rec}
                  </li>
                ))}
              </ul>
            </section>
          </div>
        )}

        {report && activeTab === Tab.PROTECTION && (
          <div className="space-y-6 animate-slide-in">
            {/* REMEDIATION PLAN (Screenshot 5) */}
            <section className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm">
              <div className="flex items-center gap-2 mb-2 text-[#2bb16a] font-bold">
                <i className="fa-solid fa-shield-halved"></i>
                <h3 className="text-sm">Complete Remediation Plan</h3>
              </div>
              <p className="text-slate-500 text-xs mb-8">Follow these steps to secure your device</p>
              
              <div className="space-y-3">
                {report.remediationPlan.map((step, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center font-bold text-xs text-slate-400 shadow-sm">
                      {i + 1}
                    </div>
                    <span className="font-bold text-slate-700 text-sm">{step}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* PROTECTION GUIDE (Screenshot 6) */}
            <section className="space-y-4">
              <div className="py-2">
                <h3 className="font-bold text-slate-900 text-sm">Comprehensive Protection Guide</h3>
                <p className="text-xs text-slate-500">Step-by-step security hardening instructions for your devices</p>
              </div>

              {[
                { title: "Enable and Configure Firewall", tag: "Firewall" },
                { title: "Close Unnecessary Ports", tag: "Port Management" },
                { title: "Keep Systems Updated", tag: "System Updates" },
                { title: "Strengthen Authentication", tag: "Authentication" },
                { title: "Secure Your Network", tag: "Network Security" },
                { title: "Implement Real-time Monitoring", tag: "Monitoring" }
              ].map((guide, i) => (
                <div key={i} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex items-center justify-between group cursor-pointer hover:border-slate-400 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="text-[#2bb16a] opacity-60 group-hover:opacity-100">
                      <i className="fa-solid fa-shield text-lg"></i>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">{guide.title}</h4>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{guide.tag}</p>
                    </div>
                  </div>
                  <i className="fa-solid fa-chevron-down text-slate-300"></i>
                </div>
              ))}
            </section>
          </div>
        )}

        {report && activeTab === Tab.HISTORY && (
          <div className="bg-white border border-slate-200 rounded-xl p-20 text-center shadow-sm text-slate-400">
            <i className="fa-solid fa-box-open text-4xl mb-4"></i>
            <h3 className="text-sm font-bold">No History Found</h3>
            <p className="text-xs">Your scanning history will appear here once archived.</p>
          </div>
        )}

        {activeTab === Tab.SCAN && !isScanning && !report && (
          <div className="flex flex-col items-center justify-center py-20 text-center animate-slide-in">
            <div className="w-20 h-20 bg-white border border-slate-100 rounded-full flex items-center justify-center shadow-sm text-slate-200 mb-6">
              <i className="fa-solid fa-shield-virus text-4xl"></i>
            </div>
            <h2 className="text-xl font-bold mb-2">Ready for Network Analysis</h2>
            <p className="text-slate-500 text-sm max-w-sm">Enter a target IP and perform a scan to detect vulnerabilities and get remediation instructions.</p>
            <button 
              onClick={handleStartScan}
              className="mt-8 bg-[#1a1a1a] text-white px-8 py-3 rounded-lg font-bold hover:bg-black transition-all shadow-lg"
            >
              Start Diagnostic Scan
            </button>
          </div>
        )}
      </main>

      {/* Powered By Badge (Screenshot 2 bottom) */}
      <div className="fixed bottom-6 right-6 pointer-events-none">
        <div className="bg-white/90 backdrop-blur-sm border border-slate-200 px-4 py-2 rounded-lg shadow-xl flex items-center gap-2 border-b-2 border-b-slate-300">
          <div className="bg-black w-5 h-5 rounded flex items-center justify-center text-white text-[9px] font-black italic">
            e
          </div>
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">Powered by Emerald AI</span>
        </div>
      </div>
    </div>
  );
};

export default App;

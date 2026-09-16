import React, { useState } from 'react';

function AITriagePage({ BASE_URL, onBack }) {
  const [messages, setMessages] = useState([
    { 
      role: 'ai', 
      text: "👋 Hello! I am your AI Clinical Triage Assistant.\n\nPlease describe your symptoms or select a quick emergency tag below to receive instant severity assessment and specialist routing recommendations." 
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const symptomChips = [
    { label: "💔 Severe Chest Pain", query: "Severe crushing chest pain radiating to left arm with shortness of breath" },
    { label: "🫁 Breathing Difficulty", query: "Sudden onset of severe shortness of breath and wheezing" },
    { label: "🧠 Dizziness & Numbness", query: "Sudden weakness on right side of face and arm with slurred speech" },
    { label: "🩸 Deep Bleeding Wound", query: "Deep laceration on forearm with persistent heavy bleeding" },
    { label: "🦴 Fracture & Joint Trauma", query: "Severe pain and inability to bear weight after ankle twist" }
  ];

  const generateLocalClinicalAnalysis = (query) => {
    const q = query.toLowerCase();
    let severity = "MODERATE";
    let badgeColor = "text-amber-400 bg-amber-500/10 border-amber-500/30";
    let specialist = "Emergency Medicine Specialist";
    let steps = [
      "Keep the patient calm and seated comfortably.",
      "Do not give any food or liquid until evaluated by a clinician.",
      "Prepare any current prescription medications or medical history documents."
    ];

    if (q.includes("chest") || q.includes("heart") || q.includes("arm")) {
      severity = "CRITICAL / RED ALERT";
      badgeColor = "text-rose-400 bg-rose-500/20 border-rose-500/40";
      specialist = "Interventional Cardiologist & ER Trauma Team";
      steps = [
        "Call 108 Emergency Ambulance immediately.",
        "Keep patient still and seated slightly upright.",
        "Loosen tight clothing around neck and chest.",
        "If trained, have AED (Defibrillator) accessible."
      ];
    } else if (q.includes("breath") || q.includes("lung") || q.includes("wheez")) {
      severity = "HIGH PRIORITY";
      badgeColor = "text-amber-400 bg-amber-500/20 border-amber-500/40";
      specialist = "Pulmonologist & Emergency Unit";
      steps = [
        "Sit upright to optimize air intake.",
        "Use prescribed rescue inhaler if available.",
        "Maintain open ventilation and calm breathing rhythm."
      ];
    } else if (q.includes("numb") || q.includes("face") || q.includes("speech") || q.includes("head")) {
      severity = "CRITICAL / NEURO ALERT";
      badgeColor = "text-rose-400 bg-rose-500/20 border-rose-500/40";
      specialist = "Neurologist & Stroke Emergency Ward";
      steps = [
        "Note the exact time symptoms first started (Critical for Stroke protocols).",
        "Do not offer water or food.",
        "Keep patient lying flat on their side if vomiting occurs."
      ];
    } else if (q.includes("bleed") || q.includes("wound") || q.includes("cut")) {
      severity = "URGENT";
      badgeColor = "text-amber-400 bg-amber-500/20 border-amber-500/40";
      specialist = "Trauma Surgeon & Emergency Care";
      steps = [
        "Apply direct firm pressure to the wound with a clean cloth.",
        "Elevate the injured limb above heart level if possible.",
        "Do not remove embedded objects."
      ];
    }

    return `🚨 **TRIAGE SEVERITY: ${severity}**\n\n👨‍⚕️ **Recommended Specialist:** ${specialist}\n\n📋 **Immediate First-Aid Protocols:**\n${steps.map(s => `• ${s}`).join('\n')}\n\n👉 *Would you like to route directly to the nearest Trauma Center on our live Emergency Radar map?*`;
  };

  const executeTriage = async (textToSend) => {
    if (!textToSend.trim()) return;
    setMessages(prev => [...prev, { role: 'user', text: textToSend }]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch(`${BASE_URL}/api/hospitals/triage-ai`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emergencyDescription: textToSend, lat: 26.79, lng: 83.37 })
      });
      
      if (!res.ok) throw new Error("API Offline");
      const data = await res.json();
      
      let aiResponse = `🚨 **AI Clinical Analysis**\n\n`;
      if (data.specialistNeeded) aiResponse += `👨‍⚕️ **Specialist Required:** ${data.specialistNeeded}\n\n`;
      if (data.precautions?.length) {
        aiResponse += "📋 **Immediate Precautions:**\n" + data.precautions.map(p => `• ${p}`).join('\n');
      }

      setMessages(prev => [...prev, { role: 'ai', text: aiResponse }]);
    } catch (err) {
      // Fallback to rich intelligent clinical rule-engine
      const fallbackAnalysis = generateLocalClinicalAnalysis(textToSend);
      setMessages(prev => [...prev, { role: 'ai', text: fallbackAnalysis }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = (e) => {
    e.preventDefault();
    executeTriage(input);
  };

  return (
    <div className="w-full h-screen bg-slate-950 flex flex-col font-sans">
      {/* ─── HEADER ─── */}
      <div className="bg-[#030712] border-b border-white/10 px-6 py-4 flex items-center justify-between shrink-0 shadow-lg">
        <button 
          onClick={onBack} 
          className="bg-slate-900 border border-white/10 hover:border-white/30 text-slate-300 hover:text-white font-black text-xs uppercase tracking-wider px-4 py-2 rounded-full transition-all cursor-pointer flex items-center gap-1.5"
        >
          ← Exit Console
        </button>
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse shadow-[0_0_10px_#3b82f6]"></span>
          <h1 className="text-sm font-black tracking-widest uppercase text-blue-400">Gemini AI Clinical Triage</h1>
        </div>
        <div className="hidden sm:block text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
          TRIAGE GRID ACTIVE
        </div>
      </div>

      {/* ─── CHAT AREA ─── */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] sm:max-w-[75%] rounded-3xl px-6 py-5 text-sm leading-relaxed font-medium whitespace-pre-wrap ${
              msg.role === 'user' 
                ? 'bg-blue-600 text-white rounded-br-sm shadow-[0_0_20px_rgba(37,99,235,0.3)]' 
                : 'bg-[#0a1338] border border-blue-500/20 text-slate-100 rounded-bl-sm shadow-xl backdrop-blur-xl'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-[#0a1338] border border-blue-500/20 rounded-3xl rounded-bl-sm px-6 py-4 flex items-center gap-3">
              <span className="text-xs font-mono text-blue-400 animate-pulse">Evaluating Clinical Symptoms...</span>
              <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></span>
              <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-75"></span>
              <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-150"></span>
            </div>
          </div>
        )}
      </div>

      {/* ─── QUICK SYMPTOM CHIPS BAR ─── */}
      <div className="px-6 py-3 bg-[#030712] border-t border-white/5 flex items-center gap-2 overflow-x-auto scrollbar-none">
        <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 whitespace-nowrap">Quick Tags:</span>
        {symptomChips.map((chip, idx) => (
          <button
            key={idx}
            onClick={() => executeTriage(chip.query)}
            className="text-xs font-semibold px-3 py-1.5 rounded-full bg-blue-950/40 border border-blue-500/20 text-blue-300 hover:bg-blue-900/60 hover:border-blue-400 whitespace-nowrap transition-all cursor-pointer"
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* ─── INPUT AREA ─── */}
      <div className="p-4 bg-[#030712] border-t border-white/10 shrink-0">
        <form onSubmit={handleSend} className="max-w-4xl mx-auto flex gap-3">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe your symptoms in detail (e.g. chest pain, shortness of breath)..."
            className="flex-1 bg-[#091130] border border-white/10 rounded-2xl px-6 py-4 text-white text-sm font-semibold focus:outline-none focus:border-blue-500 transition-colors shadow-inner placeholder-slate-500"
          />
          <button 
            type="submit" 
            disabled={!input.trim() || loading} 
            className="px-6 py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm disabled:opacity-40 cursor-pointer shadow-[0_0_20px_rgba(59,130,246,0.35)] transition-all active:scale-95 flex items-center gap-2"
          >
            <span>Analyze</span> ➔
          </button>
        </form>
      </div>
    </div>
  );
}

export default AITriagePage;
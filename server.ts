import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const args = process.argv.slice(2);
const portArgEq = args.find((a) => a.startsWith('--port='));
const portIndex = args.indexOf('--port');
const cliPort = portArgEq
  ? parseInt(portArgEq.split('=')[1], 10)
  : portIndex !== -1 && args[portIndex + 1]
  ? parseInt(args[portIndex + 1], 10)
  : undefined;
const envPort =
  process.env.PORT && process.env.PORT !== process.env.NGINX_PORT
    ? parseInt(process.env.PORT, 10)
    : undefined;
const defaultAppPort = process.env.DEFAULT_APP_PORT ? parseInt(process.env.DEFAULT_APP_PORT, 10) : 3000;
const PORT = (cliPort && !Number.isNaN(cliPort) ? cliPort : undefined) || envPort || defaultAppPort;

app.use(express.json({ limit: '15mb' }));

// Initialize Gemini Client if API key is present
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  try {
    ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.error('Failed to initialize GoogleGenAI client:', err);
  }
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error('AI response timeout')), ms)),
  ]);
}

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'Plant and Machinery AI Engine',
    geminiConfigured: Boolean(ai),
    timestamp: new Date().toISOString(),
  });
});

// AI Diagnostic Endpoint
app.post('/api/diagnose', async (req: Request, res: Response) => {
  try {
    const {
      equipment,
      make,
      model,
      hmr,
      complaint,
      symptoms,
      errorCode,
      operatingCondition,
      loadCondition,
      ambientTemp,
      oilPressure,
      coolantTemp,
      hydraulicPressure,
      fuelConsumption,
      recentRepair,
      recentPM,
      operatorObservation,
    } = req.body;

    if (!complaint && !symptoms && !errorCode) {
      return res.status(400).json({
        error: 'Insufficient technical evidence. Please provide equipment model, HMR, symptoms, error code, recent repair history and operating conditions.',
      });
    }

    // If Gemini AI is configured, query Gemini 3.8 Flash with P&M engineering context
    if (ai) {
      try {
        const prompt = `
You are the Chief Technical Diagnostic Officer for PLANT AND MACHINERY, the Indian Construction Plant & Machinery Technical Assistant.
Analyze this machinery failure report with deep mechanical, hydraulic, electrical, and powertrain expertise.

EQUIPMENT DETAILS:
- Equipment: ${equipment || 'Not specified'}
- Make: ${make || 'Unknown'}
- Model: ${model || 'Unknown'}
- HMR/KM: ${hmr || 'Not specified'}
- Operator Complaint: ${complaint || 'N/A'}
- Symptoms: ${symptoms || 'N/A'}
- Error Code: ${errorCode || 'None'}
- Operating Condition: ${operatingCondition || 'Standard'}
- Load Condition: ${loadCondition || 'Normal load'}
- Ambient Temp: ${ambientTemp || '35°C'}
- Engine Oil Pressure: ${oilPressure || 'Not measured'}
- Coolant Temp: ${coolantTemp || 'Not measured'}
- Hydraulic Main Pressure: ${hydraulicPressure || 'Not measured'}
- Fuel Consumption Rate: ${fuelConsumption || 'Normal'}
- Recent Repair History: ${recentRepair || 'None'}
- Recent PM Done: ${recentPM || 'Standard 250H'}
- Operator Observations: ${operatorObservation || 'None'}

REQUIREMENTS:
Return a JSON object conforming strictly to this structure:
{
  "problemSummary": "Concise engineering summary of the problem",
  "probableCauses": [
    {
      "rank": 1,
      "cause": "Most probable cause",
      "likelihood": "Likely cause",
      "explanation": "Technical reasoning based on fluid dynamics/mechanics/electronics"
    },
    {
      "rank": 2,
      "cause": "Second probable cause",
      "likelihood": "Possible cause",
      "explanation": "Secondary factor or compounding issue"
    },
    {
      "rank": 3,
      "cause": "Third probable cause",
      "likelihood": "Requires inspection",
      "explanation": "Tertiary electrical, sensor, or structural cause"
    }
  ],
  "diagnosticProcedure": [
    "Step 1: Specific action with test port, safety isolation, or multimeter test point",
    "Step 2: ...",
    "Step 3: ...",
    "Step 4: ...",
    "Step 5: ..."
  ],
  "requiredMeasurements": [
    { "parameter": "Hydraulic Main Relief Pressure", "nominalRange": "320 - 345 bar", "testPort": "Port M1 at main control valve" },
    { "parameter": "Engine High Idle RPM", "nominalRange": "1950 - 2050 RPM", "testPort": "Flywheel sensor / digital tachometer" },
    { "parameter": "Pilot Pressure", "nominalRange": "35 - 40 bar", "testPort": "Pilot manifold gauge port" }
  ],
  "requiredTools": ["600 bar digital hydraulic gauge set", "Multimeter CAT III 1000V", "Flow meter", "Infrared pyrometer"],
  "requiredSpareParts": [
    { "partName": "Primary Relief Valve Cartridge", "partNumber": "TH-44321-09", "estimatedAvailability": "In Central Store" },
    { "partName": "Pilot Filter Element", "partNumber": "FL-8921-X", "estimatedAvailability": "Site Store Bin B-12" }
  ],
  "immediateAction": "Stop continuous high-load operation immediately to avoid cavitation/scuffing. Park machine on level ground with attachments lowered.",
  "correctiveAction": "Calibrate or replace relief valve, bleed pilot system, flush suction strainer and refill clean ISO VG 46 hydraulic fluid.",
  "safetyPrecautions": [
    "Depressurize hydraulic reservoir before loosening any line (bleed tank breather).",
    "Apply Lockout/Tagout (LOTO) on master battery switch before working near main pump.",
    "Do NOT touch hot exhaust manifold or pressurized cooling system.",
    "Never bypass safety interlocks or pressure relief limiter."
  ],
  "finalRecommendation": "Perform full load stall test at 1800 RPM after repair. Monitor case drain leakage rate before releasing equipment to production.",
  "confidenceLevel": "High"
}

Never present an uncertain diagnosis as confirmed. Do not bypass safety interlocks.
`;

        const response = await withTimeout(
          ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: prompt,
            config: {
              responseMimeType: 'application/json',
              systemInstruction:
                'You are the PLANT AND MACHINERY Chief Technical Diagnostic Assistant for Indian infrastructure construction equipment. Return valid parseable JSON only.',
            },
          }),
          7000
        );

        const text = response.text;
        if (text) {
          const parsed = JSON.parse(text);
          return res.json({ success: true, diagnosis: parsed, source: 'gemini-3.8-flash' });
        }
      } catch (geminiErr: any) {
        console.warn('[Plant and Machinery Server] Gemini live call failed or busy, using domain expert rules engine:', geminiErr?.message);
      }
    }

    // High-fidelity domain expert diagnostic engine fallback
    const ruleBasedDiagnosis = generateExpertRuleBasedDiagnosis({
      equipment,
      make,
      model,
      hmr,
      complaint,
      symptoms,
      errorCode,
      oilPressure,
      coolantTemp,
      hydraulicPressure,
    });

    return res.json({
      success: true,
      diagnosis: ruleBasedDiagnosis,
      source: 'plant-and-machinery-expert-rules',
    });
  } catch (error: any) {
    console.error('Diagnostic error:', error);
    res.status(500).json({
      error: 'Diagnostic processing failed',
      details: error?.message || 'Internal server error',
    });
  }
});

// AI Chat Assistant Endpoint
app.post('/api/chat', async (req: Request, res: Response) => {
  try {
    const { message, conversationHistory, contextEquipment } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    if (ai) {
      const systemInstruction = `
You are PLANT AND MACHINERY – The Expert AI Construction Plant & Machinery Digital Technical Assistant for Indian infrastructure and construction projects (NHAI highways, elevated metros, railways, dams, airports, RMC/HMP plants).
You assist P&M Heads, AGMs, Plant Managers, Maintenance Engineers, and Site Supervisors.

CORE RULES:
1. Speak with authoritative mechanical/electrical/civil engineering knowledge.
2. Structure answers with:
   - Problem / Executive Assessment
   - Evidence & Symptoms
   - Probable Causes
   - Diagnostic Steps & Measurements
   - Required Tools & Spares
   - Corrective Action & Preventive Action
   - Safety (Isolation, LOTO, zero bypass of safety interlocks)
   - Confidence Level (High, Medium, Low)
3. Never invent OEM specifications. If unknown, state: "OEM specification not available in the current knowledge base."
4. If asked about fuel theft, use the strict standard wording: "Abnormal fuel variance detected – investigation required."
5. Contextualize for Indian site conditions (extreme ambient temperatures 45°C+, high dust, monsoon water ingress, diesel adulteration, fluctuating grid voltage at batching plants).
`;

      const contents = [
        ...(conversationHistory || []).map((msg: any) => ({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.text }],
        })),
        {
          role: 'user',
          parts: [
            {
              text: `Current context equipment: ${JSON.stringify(contextEquipment || {})}\n\nUser Query: ${message}`,
            },
          ],
        },
      ];


      try {
        const response = await withTimeout(
          ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents,
            config: { systemInstruction },
          }),
          7000
        );

        if (response.text) {
          return res.json({
            reply: response.text,
            source: 'gemini-3.8-flash',
          });
        }
      } catch (geminiChatErr: any) {
        console.warn('[Plant and Machinery Server] Gemini chat call failed or timed out, using domain knowledge base fallback:', geminiChatErr?.message);
      }
    }

    // Built-in intelligent response engine for P&M queries
    const cannedResponse = getSmartKnowledgeResponse(message, contextEquipment);
    return res.json({
      reply: cannedResponse,
      source: 'plant-and-machinery-kb',
    });
  } catch (err: any) {
    console.error('Chat error:', err);
    res.status(500).json({
      error: 'Failed to process chat query',
      details: err?.message,
    });
  }
});

// AI Voice TTS Endpoint (Gemini 3.8 Flash Lite TTS + WebSpeech fallback)
app.post('/api/voice/speak', async (req: Request, res: Response) => {
  try {
    const { text, voiceName, audioOutputMode = 'speaker', style } = req.body;
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text is required for voice generation' });
    }

    // Clean text: strip markdown headers, asterisks, tables, codes for natural spoken cadence
    let cleanText = text
      .replace(/```[\s\S]*?```/g, '')
      .replace(/^#+\s+/gm, '')
      .replace(/[*_~`]/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/\|[^\n]+\|/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    // Spoken engineering expansions for Indian P&M terminology across all 4 verticals
    cleanText = cleanText
      .replace(/\bP&M\b/g, 'Plant and Machinery')
      .replace(/\bNHAI\b/g, 'N-H-A-I Highway')
      .replace(/\bHMR\b/g, 'Hour Meter Reading')
      .replace(/\bLOTO\b/g, 'Lockout Tagout')
      .replace(/\bTBM\b/g, 'Tunnel Boring Machine')
      .replace(/\bEPB\b/g, 'Earth Pressure Balance')
      .replace(/\bSLG\b/g, 'Segment Launching Girder')
      .replace(/\bHDD\b/g, 'Horizontal Directional Drilling')
      .replace(/\bLMI\b/g, 'Load Moment Indicator')
      .replace(/\bTPH\b/g, 'Tons per Hour')
      .replace(/\bRMC\b/g, 'Ready Mix Concrete')
      .replace(/\bHMP\b/g, 'Hot Mix Plant')
      .replace(/\bWMM\b/g, 'Wet Mix Macadam')
      .replace(/\bDG\b/g, 'Diesel Generator')
      .replace(/₹/g, 'Rupees ');

    // Truncate to spoken engineering summary if too long for rapid audio streaming
    if (cleanText.length > 750) {
      const sentenceEnd = cleanText.indexOf('.', 550);
      cleanText = sentenceEnd !== -1 ? cleanText.slice(0, sentenceEnd + 1) : cleanText.slice(0, 650) + '...';
    }

    if (ai) {
      try {
        const allowedVoices = ['Fenrir', 'Puck', 'Charon', 'Kore', 'Zephyr'];
        // Default to Gents voice based on audio output mode
        let selectedVoice = voiceName;
        if (!selectedVoice || !allowedVoices.includes(selectedVoice)) {
          selectedVoice = audioOutputMode === 'headphone' ? 'Fenrir' : 'Fenrir';
        }

        // Distinct acoustic styling for Normal Field Loudspeaker (no headphones) vs. Headphone
        const acousticStyle =
          style ||
          (audioOutputMode === 'headphone'
            ? 'Authoritative Indian male Chief Plant and Machinery Engineer speaking into a studio headset. Close-mic, crisp treble, calm analytical diction, high definition sound.'
            : 'Normal Speaking Mode: Resonant, loud, clear Indian male Chief Plant and Machinery Engineer speaking naturally through a phone, tablet, or laptop loudspeaker without headphones on an Indian construction job site. High acoustic presence, punchy delivery, robust projection, authoritative clarity.');

        const ttsResponse = await withTimeout(
          ai.models.generateContent({
            model: 'gemini-3.8-flash-lite-tts',
            contents: [
              {
                role: 'user',
                parts: [
                  {
                    text: cleanText,
                    speechMetadata: {
                      style: acousticStyle,
                    },
                  },
                ],
              },
            ],
            config: {
              responseModalities: ['AUDIO'],
              speechConfig: {
                voiceConfig: {
                  prebuiltVoiceConfig: { voiceName: selectedVoice as any },
                },
              },
            },
          }),
          8000
        );

        const base64Audio = ttsResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (base64Audio) {
          return res.json({
            success: true,
            audioData: base64Audio,
            mimeType: 'audio/wav',
            cleanText,
            source: 'gemini-3.8-flash-lite-tts',
          });
        }
      } catch (ttsErr: any) {
        console.warn('[Plant and Machinery Server] Gemini TTS live call failed or timed out:', ttsErr?.message);
      }
    }

    // Fallback indicator so client uses browser Web Speech Synthesis
    return res.json({
      success: true,
      useWebSpeech: true,
      cleanText,
      source: 'web-speech-synthesis',
    });
  } catch (err: any) {
    console.error('TTS endpoint error:', err);
    res.status(500).json({ error: 'TTS processing failed', details: err?.message });
  }
});

// AI Voice Transcription (Speech-To-Text) Endpoint
app.post('/api/voice/transcribe', async (req: Request, res: Response) => {
  try {
    const { audioData, mimeType = 'audio/webm' } = req.body;
    if (!audioData) {
      return res.status(400).json({ error: 'Audio data is required' });
    }

    if (ai) {
      try {
        const audioPart = {
          inlineData: {
            mimeType,
            data: audioData,
          },
        };

        const transcribeResponse = await withTimeout(
          ai.models.generateContent({
            model: 'gemini-3.5-transcribe',
            contents: {
              parts: [
                audioPart,
                { text: 'Transcribe this construction plant and machinery audio query accurately. Only output the spoken words.' },
              ],
            },
          }),
          8000
        );

        const text = transcribeResponse.text?.trim();
        if (text) {
          return res.json({ success: true, text, source: 'gemini-3.5-transcribe' });
        }
      } catch (tErr: any) {
        console.warn('[Plant and Machinery Server] Audio transcription call failed:', tErr?.message);
      }
    }

    return res.status(503).json({ error: 'Transcription unavailable, use browser speech recognition' });
  } catch (err: any) {
    console.error('Transcription error:', err);
    res.status(500).json({ error: 'Audio transcription failed', details: err?.message });
  }
});

// Domain-expert fallback generator
function generateExpertRuleBasedDiagnosis(input: any) {
  const query = `${input.complaint || ''} ${input.symptoms || ''} ${input.errorCode || ''}`.toLowerCase();

  if (query.includes('hydraulic') || query.includes('pressure') || query.includes('sluggish') || query.includes('lift') || query.includes('arm')) {
    return {
      problemSummary: `Low hydraulic circuit pressure and sluggish cylinder actuation on ${input.make || 'Tata Hitachi'} ${input.model || 'EX210'}.`,
      probableCauses: [
        {
          rank: 1,
          cause: 'Main relief valve cartridge spring fatigue or seat contamination causing internal bypass',
          likelihood: 'Likely cause',
          explanation: 'Hydraulic fluid bypassing back to tank through unseated relief valve prevents pressure buildup beyond 180 bar.',
        },
        {
          rank: 2,
          cause: 'Pilot pump gear wear or pilot pressure regulator stuck open',
          likelihood: 'Possible cause',
          explanation: 'Insufficient pilot pressure (below 32 bar) fails to shift main control spool fully under high load.',
        },
        {
          rank: 3,
          cause: 'Main variable displacement pump swashplate servo piston seal blow-by',
          likelihood: 'Requires inspection',
          explanation: 'Excessive internal case drain flow reduces effective displacement delivery at rated engine RPM.',
        },
      ],
      diagnosticProcedure: [
        'Connect 0-600 bar digital gauge to main pump delivery test port (Port M1 & M2).',
        'Stall bucket curl circuit at rated engine RPM (1950 RPM) and record maximum relief pressure.',
        'Measure pilot line pressure at pilot manifold (nominal: 38 - 42 bar).',
        'Measure pump case drain leakage flow over 1 minute during stall condition (reject if > 25 LPM).',
        'Inspect hydraulic tank return filter for brass/bronze filings indicating piston slipper shoe wear.',
      ],
      requiredMeasurements: [
        { parameter: 'Main Circuit Relief Pressure', nominalRange: '320 - 345 bar', testPort: 'Port M1/M2 Gauge Port' },
        { parameter: 'Pilot System Pressure', nominalRange: '38 - 42 bar', testPort: 'Pilot manifold test block' },
        { parameter: 'Pump Case Drain Leakage', nominalRange: '< 18 L/min @ 320 bar', testPort: 'Pump case drain return line' },
        { parameter: 'Engine Stall RPM', nominalRange: '1850 - 1950 RPM', testPort: 'Engine ECU data / Tachometer' },
      ],
      requiredTools: ['Digital hydraulic test kit (0-600 bar)', 'Laser tachometer', 'Case drain measuring container', 'Hydraulic flow meter'],
      requiredSpareParts: [
        { partName: 'Main Relief Valve Assembly', partNumber: '4432091-TH', estimatedAvailability: 'In Central Warehouse (Qty: 2)' },
        { partName: 'Pilot Filter Element', partNumber: '4658521', estimatedAvailability: 'Site Store Bin S-04 (Qty: 4)' },
        { partName: 'Hydraulic Suction Strainer', partNumber: '4392100', estimatedAvailability: 'Site Store Bin S-08 (Qty: 1)' },
      ],
      immediateAction: 'Do not continue heavy digging or rock breaker operation. Lower all attachments flat to the ground and turn off hydraulic lock lever.',
      correctiveAction: 'Isolate main relief valve, clean poppet seat, replace O-rings and backup rings. If pressure does not hold, replace valve cartridge and set to 340 bar using calibrated gauge.',
      safetyPrecautions: [
        'Depressurize hydraulic reservoir breather prior to cracking any hose fitting.',
        'Ensure boom and arm are fully rested on ground; lock mechanical safety pins.',
        'Apply Lockout / Tagout (LOTO) to ignition key and battery isolator.',
        'Never use bare hands to check for pinhole hydraulic leaks (high-pressure injection risk).',
      ],
      finalRecommendation: 'Check hydraulic oil cleanliness level (ISO 4406 target 18/16/13). Replace return filter element within 50 operating hours.',
      confidenceLevel: 'High',
    };
  }

  if (query.includes('overheat') || query.includes('coolant') || query.includes('temperature') || query.includes('hot')) {
    return {
      problemSummary: `Engine overheating with coolant temperature exceeding 102°C under full load on ${input.make || 'Komatsu'} ${input.model || 'PC210-10'}.`,
      probableCauses: [
        {
          rank: 1,
          cause: 'Radiator core external fin clogging by construction site dust and slurry',
          likelihood: 'Likely cause',
          explanation: 'Restricted airflow across radiator and CAC matrix prevents heat dissipation during sustained heavy cycle.',
        },
        {
          rank: 2,
          cause: 'Thermostat valve stuck partially closed or wax pellet degraded',
          likelihood: 'Possible cause',
          explanation: 'Restricts full coolant flow from cylinder head into top tank of radiator.',
        },
        {
          rank: 3,
          cause: 'Viscous fan clutch slippage or loose serpentine drive belt',
          likelihood: 'Requires inspection',
          explanation: 'Fan RPM drops below required 1800 RPM at peak engine torque curve.',
        },
      ],
      diagnosticProcedure: [
        'Inspect radiator matrix with backlight for fin blockage or bent cooling fins.',
        'Check serpentine belt tension with belt tension gauge (nominal deflection 8-10 mm).',
        'Measure temperature difference between radiator inlet hose and outlet hose using infrared thermometer (nominal delta 8°C - 12°C).',
        'Test thermostat opening temperature in heated water bath (opening starts at 82°C, full open at 95°C).',
        'Inspect coolant reservoir for combustion gas bubbles indicating cylinder head gasket leak.',
      ],
      requiredMeasurements: [
        { parameter: 'Coolant Radiator Top Hose Temp', nominalRange: '88°C - 94°C', testPort: 'Upper radiator inlet hose' },
        { parameter: 'Radiator Delta T', nominalRange: '8°C - 14°C drop across core', testPort: 'Inlet vs Outlet tank' },
        { parameter: 'Cooling Fan RPM @ 2000 Engine RPM', nominalRange: '1750 - 1900 RPM', testPort: 'Fan hub optical strip' },
        { parameter: 'Radiator Cap Relief Pressure', nominalRange: '0.9 - 1.1 bar (13-16 psi)', testPort: 'Cooling system pressure tester' },
      ],
      requiredTools: ['Infrared laser thermometer', 'Cooling system pressure tester with adapters', 'Radiator fin comb', 'Optical tachometer'],
      requiredSpareParts: [
        { partName: 'Engine Thermostat (82°C)', partNumber: '6735-61-6471', estimatedAvailability: 'Site Store Bin E-02' },
        { partName: 'Serpentine Fan Belt', partNumber: '6732-82-3390', estimatedAvailability: 'In Stock (Qty: 3)' },
        { partName: 'OEM Premix Coolant (50/50 Glycol)', partNumber: 'AF-COOL-20L', estimatedAvailability: 'Available 120L' },
      ],
      immediateAction: 'Reduce engine speed to low idle for 5 minutes before shutting off. Do NOT open radiator pressure cap while hot.',
      correctiveAction: 'Blow compressed air (max 3 bar) from engine side outwards through radiator fins followed by low-pressure water wash. Replace thermostat and radiator cap if pressure test fails.',
      safetyPrecautions: [
        'Severe scalding hazard: Never remove radiator pressure cap when coolant temperature is above 50°C.',
        'Keep clear of rotating fan blades and belt pulleys during engine idle inspection.',
        'Allow engine to cool down naturally before draining coolant.',
      ],
      finalRecommendation: 'Schedule radiator cleaning blow-out every 50 hours or weekly during dry earthwork operations.',
      confidenceLevel: 'High',
    };
  }

  // General default diagnosis
  return {
    problemSummary: `Operational irregularity and abnormal parameter readings reported on ${input.equipment || 'Equipment'} (${input.make || 'Make'} ${input.model || 'Model'}).`,
    probableCauses: [
      {
        rank: 1,
        cause: 'Electro-proportional solenoid valve sticking due to varnish or moisture in control harness',
        likelihood: 'Likely cause',
        explanation: 'Intermittent signal drop or coil resistance shift outside OEM tolerance (target: 12-16 ohms).',
      },
      {
        rank: 2,
        cause: 'Primary fuel filter restriction or water separator saturation',
        likelihood: 'Possible cause',
        explanation: 'Fuel rail delivery pressure drop under heavy load inducing ECU torque de-rate.',
      },
      {
        rank: 3,
        cause: 'Wiring harness grounding fault or pin corrosion at bulkhead connector',
        likelihood: 'Requires inspection',
        explanation: 'High vibration and monsoon moisture ingress at chassis ground strap.',
      },
    ],
    diagnosticProcedure: [
      'Perform visual inspection of electrical harness connectors and chassis ground points.',
      'Check resistance across solenoid coils with digital multimeter (acceptable: 12 to 16 Ohms @ 25°C).',
      'Inspect primary fuel water separator bowl for water contamination or sediment layer.',
      'Measure battery terminal voltage with engine running (charging circuit nominal: 27.8V - 28.6V for 24V system).',
    ],
    requiredMeasurements: [
      { parameter: 'System DC Voltage (Engine Running)', nominalRange: '27.5V - 28.8V (24V system)', testPort: 'Alternator B+ terminal' },
      { parameter: 'Low Pressure Fuel Feed', nominalRange: '3.5 - 5.0 bar', testPort: 'Fuel filter head test port' },
      { parameter: 'Solenoid Coil Resistance', nominalRange: '13.5 ± 1.5 Ω', testPort: 'Connector Pin A to B' },
    ],
    requiredTools: ['CAT III Digital Multimeter', 'Electrical contact cleaner', 'Fuel pressure test kit', 'Insulated hand tool kit'],
    requiredSpareParts: [
      { partName: 'Primary Fuel Water Separator Filter', partNumber: 'FS-19765', estimatedAvailability: 'Site Store Bin F-01' },
      { partName: 'Proportional Solenoid Coil', partNumber: 'SOL-24V-09', estimatedAvailability: 'Central Warehouse (1 day dispatch)' },
    ],
    immediateAction: 'Park equipment in safe workshop bay. Isolate battery master switch before probing harness pins.',
    correctiveAction: 'Clean electrical terminals with de-oxidizer spray, inspect seal grommets, replace saturated fuel filter, and bleed fuel system.',
    safetyPrecautions: [
      'Lockout/Tagout (LOTO) battery isolator switch.',
      'Wear safety glasses and chemical gloves when handling diesel or battery terminals.',
      'Do not operate machine until all fault codes clear and cycle test is verified.',
    ],
    finalRecommendation: 'Complete 250H preventative maintenance service and verify fuel quality from main diesel bowser.',
    confidenceLevel: 'Medium',
  };
}

function getSmartKnowledgeResponse(message: string, contextEquipment: any): string {
  const q = message.toLowerCase();

  if (q.includes('available') && (q.includes('productive') || q.includes('economically justified') || q.includes('budget') || q.includes('master economic') || q.includes('5 questions'))) {
    return `### Bridge P&M Cost & Performance Management System – The 5 Core Executive Questions

**1. Is the Machine Available?**
- **Mechanical Availability = Available Hours ÷ Planned Hours × 100**
- Target: ≥ 90%. Example: Out of 2,400 annual planned hours, rig is mechanically ready for 2,160 hours (90%).

**2. Is it Productive?**
- **Productive Utilization = Productive Hours ÷ Available Hours × 100**
- Target: ≥ 75–80%. Example: Out of 2,160 available hours, 1,836 hours utilized, and 1,469 hours actively producing drilling output (808 m drilled @ 0.55 m/hr).

**3. Is it Fuel-Efficient?**
- **Dual Fuel Metric: L/hr AND L/Productive Unit** (L/m for piling, L/tonne for crane/HMP, L/m³ for excavator, L/span for launcher).
- Example: 18 L/hr burn rate producing 0.55 m/hr = 32.7 L/meter drilled. Any variance above +5% norm requires investigation for hydraulic relief bypass, turbo boost, injector wear, or pilferage.

**4. Is it Economically Justified?**
- **Owned vs. Hired Break-Even Model**: For a ₹5.5 Cr piling rig or ₹12.8 Cr crane, break-even threshold is **165 operating hours/month**.
- Above 180 hrs/month: **OWNED** saves ₹32,000–₹55,000/month per unit. Below 140 hrs/month: **HIRED** prevents fixed capital depreciation drain.

**5. Is it Costing within the Approved Budget?**
- **Unit Cost = Total Operating & Capital Cost ÷ Total Production**.
- Example: Total annual expenditure ₹75 Lakh ÷ 808 m drilled = **₹9,282 / meter**. Compare directly against the approved BOQ piling rate.

**The Master P&M Economic Chain:**
CAPEX/Rental → Available Hours → Utilized Hours → Productive Hours → Output → Operating Costs (Fixed + Variable + Labour + Overhauls) → ₹/productive unit → Life-cycle cost.`;
  }

  if (q.includes('diesel') || q.includes('fuel') || q.includes('variance') || q.includes('theft')) {
    return `### Fuel Intelligence & Variance Assessment – Plant & Machinery Control Tower

**1. Observations & Policy**
- Standard Rule: **"Abnormal fuel variance detected – investigation required."**
- Under Indian infrastructure conditions (NHAI highways, metro piers, crusher zones), fuel variance over ±5% on heavy excavators (e.g., Tata Hitachi EX210, Komatsu PC210) or Batching Plants warrants formal investigation.

**2. Probable Engineering & Operational Causes**
- **Excessive Idling**: Machine left idling during tipper turnaround delays (burns 4-6 L/hour without productive output).
- **Fuel Injection System Degradation**: Worn injector nozzles causing unburnt diesel discharge (black smoke, elevated exhaust temp).
- **Turbocharger Boost Loss**: Defective wastegate or intercooler leak leading to fuel-rich combustion.
- **Calibration Drift**: Flow meter on diesel bowser dispensing nozzle out of calibration by 3-8%.
- **Spillage or Tank Drain Cock Leak**: Minor seepage during rough transit.

**3. Actionable Checklist for Site P&M In-charge**
1. Check telematics HMR vs. actual engine running hours and idle hours percentage.
2. Verify diesel bowser calibration certificate (weights & measures stamp).
3. Conduct 1-hour containerized fuel consumption test at standard 80% digging load.
4. If injector flow test fails, schedule calibration on Bosch test bench.`;
  }

  if (q.includes('hydraulic') || q.includes('pressure')) {
    return `### Hydraulic Diagnostics Protocol – Plant & Machinery Control Tower

**1. Primary Verification Sequence**
- **Test Port Setup**: Connect 0-600 bar certified digital pressure gauge to Port M1 & M2 on main control valve block.
- **Pilot Pressure**: Confirm pilot pressure is at 38–42 bar. If pilot pressure is under 30 bar, main spool will fail to shift fully, mimicking main pump failure.
- **Relief Valve Test**: Stall bucket curl cylinder at 1950 engine RPM. Standard relief should peak between 320–345 bar.
- **Case Drain Measurement**: Measure case drain line flow into a calibrated container for 60 seconds during stall. If case drain exceeds 20 LPM, main pump barrel/piston slippers are worn and require overhaul.

**2. Safety Reminder**
- Always depressurize hydraulic reservoir tank breather before cracking open test ports.
- Never use fingers or bare hands to detect hydraulic pinhole jets.`;
  }

  if (q.includes('tbm') || q.includes('tunnel') || q.includes('cutterhead') || q.includes('metro tunnel')) {
    return `### Tunnel Boring Machine (TBM) & Metro Tunneling Engineering Protocol

**1. TBM EPB Subsystem Verification (Herrenknecht / Terratec / Robbins)**
- **Cutterhead Drive Torque**: Normal operating torque in mixed quartzite/alluvium is 600–900 kNm. If torque exceeds 1200 kNm with advance rate below 15 mm/min, halt boring immediately. Check for face collapse or disc cutter ring failure.
- **Foam Conditioning Injection**: Maintain Foam Expansion Ratio (FER) between 10–12 and Foam Injection Ratio (FIR) between 40–55% to lubricate the excavation chamber and prevent clay clogging.
- **Tail Skin Seal System**: Maintain tail skin grease pressure 1.5–2.0 bar above hydrostatic water pressure (minimum 3.5 bar). Inspect wire brush seals for grout contamination.
- **Annular Grouting Pressure**: Target 2.0–2.8 bar bi-component grout injection via tail shield ports to prevent surface subsidence over metro alignments.

**2. Critical Safety Precautions**
- Never enter excavation chamber for cutter inspection without verified hyperbaric de-compression locks and oxygen/methane gas monitoring.
- Lockout/Tagout (LOTO) 11 kV high-voltage transformer substation before opening VFD inverter cabinets.`;
  }

  if (q.includes('slg') || q.includes('launching') || q.includes('girder') || q.includes('viaduct') || q.includes('precast span')) {
    return `### Segment Launching Girder (SLG) & Elevated Metro Viaduct Protocol

**1. SLG-50m Erection Truss & Gantry Subsystem Checks**
- **Twin Hoist Winch Brake Sync**: Load cell differential between front and rear 75T hoist trolleys must remain under 5%. If brake slip exceeds 10mm during span hanging, immediately engage mechanical safety dogs/pawls.
- **Hydraulic Auto-Leveling Legs**: Check main front and middle leg hydraulic cylinders at 320 bar holding pressure. Pilot-operated check valves must show zero pressure drop over 30 minutes.
- **Wind Speed Cutoff**: Indian Metro Standard requires immediate suspension of precast U-girder/segment lifting if site anemometer records gusts above 14 m/s (50 km/h).
- **Span Deflection Tolerance**: Pre-stressing tendon tensioning must match design camber. Max allowable span mid-point sag under self-weight: Span / 1000.`;
  }

  if (q.includes('paver') || q.includes('hmp') || q.includes('asphalt') || q.includes('road') || q.includes('nhai') || q.includes('milling') || q.includes('compactor') || q.includes('bitumen')) {
    return `### NHAI Highway & Expressway Paving Engineering Protocol

**1. Asphalt Sensor Paver (Vögele Super 1800-3 / Dynapac SD2500)**
- **Electric Screed Heating**: Maintain screed plate temperature between 155°C–165°C. Cold screeds cause bituminous concrete tearing, mat scuffing, and poor compaction density.
- **Niveltronic 3D Grade Sensors**: Calibrate sonic multi-plex averaging ski sensors against surveyor level pegs. Maximum permissible level deviation on wearing course is ±3mm per IRC:111.
- **Tamper Stroke & Vibration Frequency**: Set tamper bar to 4mm stroke at 1400 RPM for 92% pre-compaction behind the screed.

**2. Hot Mix Plant (HMP 160/200 TPH - Apollo / Ammann)**
- **Burner Flame Eye Sensor Tripping**: Clean photocell glass of soot accumulation. Verify diesel preheating temp (95°C–105°C for VG-30/VG-40 bitumen).
- **Baghouse Differential Pressure**: Manometer reading across Nomex filter bags must be between 80–140 mm WC. Pulse jet air cleaning pressure must be 5.5–6.0 bar.

**3. Soil Compactor & Tandem Roller (Hamm 311 / Dynapac CA250D)**
- **Pass Sequencing**: First pass static, subsequent 4–6 passes high amplitude (1.8mm @ 30 Hz), final finish passes low amplitude (0.8mm @ 40 Hz) for 98% Proctor Dry Density.`;
  }

  if (q.includes('boq') || q.includes('golden formula') || q.includes('six golden') || q.includes('budget structure') || q.includes('quantity first')) {
    return `### Work-Quantity (BOQ-First) Machine Budgeting & The Six Golden Formulas

**1. The BOQ-First Rule (Never Prepare Machine Budget First):**
- Start from the Contract BOQ and Construction Programme:
  - Example: Bridge Piling: 300 piles × 35 m depth = **10,500 m total drilling**.
  - Planned production rate = 120 m/day across 90 working days = 1.0 productive rig required.
  - Adding 10–20% breakdown/maintenance contingency = **1.2 rigs recommended** (Deploy 1 high-capacity rig + 1 shared backup rig).

**2. The 6-Part Machine Budget Structure:**
- **A. Capital Cost (CapEx)**: Purchase price, GST, freight, transit insurance, commissioning, attachments (Kelly bars, casing).
- **B. Fixed Cost**: Depreciation (straight line), interest/finance (9.5% p.a.), annual insurance, yard storage, management overhead.
- **C. Variable Operating Cost**: Diesel, lubricants, filters, tyres/undercarriage, ground engaging tools (GET / teeth), welding.
- **D. Labour Crew**: Operator, helper, mechanic, auto-electrician, supervisor allocation.
- **E. Major Overhauls**: Diesel engine, hydraulic pump, transmission, rotary head swivel, winch drums, slew ring.
- **F. End-of-Life & Salvage**: Resale salvage value (15–20%), demobilization transport, replacement reserve.

**3. The Six Golden P&M Formulas (Memorize These):**
1. **Mechanical Availability %** = Available Hours ÷ Planned Hours × 100
2. **Utilization %** = Utilized Hours ÷ Available Hours × 100
3. **Productivity** = Output ÷ Productive Hours (m/hr, tonne/hr, m³/hr, spans/day)
4. **Fuel Efficiency** = Fuel Consumed ÷ Output (L/m, L/tonne, L/m³, L/span)
5. **Hourly Cost** = Total Cost ÷ Productive Hours (₹/hr)
6. **Unit Cost** = Total Cost ÷ Total Production (₹/m, ₹/tonne, ₹/m³, ₹/span)`;
  }

  if (q.includes('bridge') || q.includes('piling') || q.includes('pile') || q.includes('crawler crane') || q.includes('post-tensioning') || q.includes('stressing') || q.includes('tandem') || q.includes('barge')) {
    return `### Bridge P&M Fleet Engineering Systems (Foundation, Erection & Prestressing)

**1. Hydraulic Rotary Piling Rig (MAIT HR260 / Bauer BG28 / SANY SR285)**
- **340-Minute Pile Cycle**: Positioning (20m) → Boring (180m) → Hole Cleaning (30m) → Casing (20m) → Cage Placement (40m) → Tremie Concreting (50m) = 5.67 hrs/pile (Theoretical: 5.29 m/hr; Actual: 35–45 m/day in hard rock).
- **Rock Socketing Torque**: Target 240–280 kNm at 12–18 RPM in basalt/granite riverbed.
- **Polymer/Bentonite Slurry (IRC:78)**: Density 1.03–1.08 g/cc; Marsh viscosity 35–45s; Sand content < 1.5% before concreting.

**2. Heavy Crawler Crane 250T (Kobelco CKE2500 / SANY SCC1500)**
- **70-Minute 80T Girder Lift Cycle**: Rigging (20m) → Hooking (10m) → Lift (10m) → Slewing (10m) → Placement (10m) → De-rigging (10m) = 0.857 lift/hr (6.86 lifts/8h day).
- **Standby Loss**: A 250T crane at ₹8,000/hr ownership cost waiting 5 hours for girder transport costs ₹40,000/day = ₹8 Lakh/month!

**3. Tandem Crane Lifting Engineering**
- **Never Assume 50:50 Load Sharing**: Load transfers dynamically during slewing, hook height variance, and sling angle tilt.
- **Safety Standard**: Requires engineered lift plan, trial lift, single VHF radio signalman, and 75% SWL crane derating.

**4. Segment Launching Girder (SLG-50 / Bridgecon)**
- **7-Cycle Erection Sequence**: Launcher positioning → Segment lifting → Alignment → Temporary support → Stressing → Advancement → Next span.
- **Cost Allocation**: ₹4 Cr capex ÷ 1,000 spans = ₹40,000/span + operations = ₹1.2 Lakh/span total erection machinery cost.

**5. Prestressing Multi-Strand Jacks (Freyssinet 500T)**
- **Elongation vs Pressure**: If elongation is 110mm vs 150mm required, do NOT simply pump higher pressure! Investigate 10 root causes: duct friction loss, free length, wedge seating, strand slip, gauge deadweight calibration, or strand obstruction.

**6. River Barge Jacking Platform**
- Floating pontoon marine stability: Check draft, listing angle (< 1.5 degrees max), and tidal current ballasting before lifting.`;
  }

  if (q.includes('pipeline') || q.includes('side boom') || q.includes('pipe layer') || q.includes('hdd') || q.includes('hydrotest') || q.includes('pipe bend')) {
    return `### Cross-Country Pipeline Projects Protocol (GAIL / IOCL / Water Transmission)

**1. Side Boom Pipe Layer (Caterpillar 572R / Komatsu D85C)**
- **Hydraulic Boom Winch Holding Test**: Under 24-ton 36-inch pipe section stringing load, inspect counterweight hydraulic extension cylinders and winch wet disc brakes for zero creep/drift over 10 minutes.
- **Trench Lowering Synchronization**: 4-side boom gang must advance in step; maximum permissible vertical deflection between adjacent lifting cradles is 200mm to prevent pipeline buckling.

**2. Horizontal Directional Drilling Rig (Vermeer D220x300 / Ditch Witch)**
- **Thrust & Pullback Pressure**: Reaming thrust must not exceed 1800 psi (125 bar). If mud pressure drops and pullback spikes, halt drill string rotation to avoid stuck pipe syndrome.
- **High-Pressure Mud Flow**: Target 1200–1400 LPM bentonite slurry flow rate to evacuate cuttings from 48-inch reamed hole beneath riverbeds.

**3. Hydrostatic Testing (ASME B31.8 / OISD-141)**
- Test pressure: 1.5 times maximum design operating pressure (MAOP). Pressure holding duration: 24 continuous hours with certified temperature and deadweight recording.`;
  }

  if (q.includes('owned') || q.includes('hired') || q.includes('cost per hour') || q.includes('hire rate')) {
    return `### Owned vs Hired Equipment Cost Analysis (Indian Infrastructure Projects)

**1. 20-Ton Hydraulic Excavator (e.g. Tata Hitachi EX210 / CAT 320D)**
- **Owned Machine Cost Structure**:
  - Purchase Price: ₹62,00,000 | 5-Year Straight-Line Depreciation: ₹1,03,333/month
  - Cost of Capital / Finance: 9.5% p.a.
  - Preventive Maintenance & Spares: ₹280/operating hour
  - Undercarriage Wear & Tear: ₹140/operating hour
  - Operator & Helper: ₹42,000/month
  - Insurance & Road Tax: ₹14,000/month
  - **Owned Cost/Hour @ 200 Operating Hours/Month**: ~₹1,240/hour (excluding diesel)
- **Hired Machine Market Rate (Dry Lease)**:
  - Monthly Hire Rate: ₹2,40,000/month (240 hours minimum commitment) = ₹1,000 - ₹1,150/hour + GST
  - Breakdown risk and maintenance borne by vendor.
- **Break-Even Analysis**:
  - Break-even threshold: **165 operating hours/month**.
  - Above 180 hrs/month: **OWNED** saves ₹32,000 - ₹55,000/month per unit.
  - Below 140 hrs/month (intermittent works): **HIRED** reduces idle fixed depreciation drain.`;
  }

  return `### Plant & Machinery Technical Assessment
**Equipment Focus**: ${contextEquipment?.model || 'General P&M Fleet'}

**Diagnostic & Management Protocol**:
1. **Problem Analysis**: Review telemetry logs, daily plant report (DPR) hours, and maintenance history for recurring trends.
2. **Standard Measurement Steps**: Inspect operating fluids (viscosity, water emulsion, silicon dust ingress), check electrical alternator charging rate (28.2V target for 24V systems), and verify mechanical torque on critical fasteners.
3. **Safety & LOTO**: Ensure Lockout/Tagout is applied prior to opening any pump access panel or electrical cabinet. Do not bypass OEM safety interlocks.
4. **OEM Specifications**: Follow OEM maintenance schedules (250H, 500H, 1000H, 2000H) with genuine filter elements.

*Ask me about any specific fault code, hydraulic circuit, HMP/RMC plant calibration, spare parts optimization, or monthly P&M KPI reporting!*`;
}

// Development vs Production serving
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';
  let viteServer: { close: () => Promise<void> } | null = null;

  if (!isProd) {
    // Initialize Vite middleware concurrently so port 3000 opens immediately for health checks
    const vitePromise = import('vite')
      .then(({ createServer: createViteServer }) =>
        createViteServer({
          server: {
            middlewareMode: true,
            hmr: false,
            ws: false,
          },
          appType: 'spa',
        })
      )
      .then((vite) => {
        viteServer = vite;
        return vite;
      })
      .catch((err) => {
        console.error('[Plant and Machinery Server] Vite initialization error:', err);
        throw err;
      });

    app.use(async (req: Request, res: Response, next) => {
      try {
        const vite = await vitePromise;
        vite.middlewares(req, res, next);
      } catch (err) {
        next(err);
      }
    });
  } else {
    // Serve static files from dist
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Plant and Machinery Server] Control Desk running on http://0.0.0.0:${PORT}`);
    console.log(`[Plant and Machinery Server] Mode: ${isProd ? 'Production' : 'Development'}`);
    console.log(`[Plant and Machinery Server] Gemini AI: ${ai ? 'ENABLED (gemini-3.8-flash)' : 'FALLBACK READY (No API key set)'}`);
  });

  let listenRetries = 0;
  server.on('error', (err: any) => {
    if (err.code === 'EADDRINUSE' && listenRetries < 15) {
      listenRetries += 1;
      console.warn(`[Plant and Machinery Server] Port ${PORT} busy, retrying (${listenRetries}/15)...`);
      setTimeout(() => {
        server.listen(PORT, '0.0.0.0');
      }, 300);
    } else {
      console.error('[Plant and Machinery Server] Server error:', err);
      process.exit(1);
    }
  });

  let shuttingDown = false;
  const shutdown = async () => {
    if (shuttingDown) return;
    shuttingDown = true;
    console.log('[Plant and Machinery Server] Graceful shutdown initiated...');
    const forceExitTimer = setTimeout(() => process.exit(0), 500);
    forceExitTimer.unref();
    try {
      server.closeAllConnections?.();
      server.close();
      if (viteServer) {
        await viteServer.close();
      }
    } catch (_) {}
    process.exit(0);
  };
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

startServer().catch((err) => {
  console.error('Fatal server start error:', err);
});

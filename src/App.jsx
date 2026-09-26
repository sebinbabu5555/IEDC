import { useMemo, useState } from 'react'
import { catalog, components, buildSteps } from './data'

const initialHardware = { project: 'Weather Node Demo', mcu: 'STM32U575', sda: 'PB9', scl: 'PB8', componentIds: ['bme280', 'mpu6050', 'ssd1306'] }
const icons = {
  grid: '▦', chip: '◈', shield: '✓', bolt: 'ϟ', box: '◇', code: '</>', download: '↓', arrow: '→', check: '✓', alert: '!', terminal: '›_', reset: '↻', layer: '⌘', close: '×', clock: '◷'
}

function downloadFile(name, payload) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = name
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(link.href)
}

function StatusDot({ tone = 'teal' }) { return <span className={`status-dot ${tone}`} /> }

function App() {
  const [hardware, setHardware] = useState(initialHardware)
  const [validation, setValidation] = useState(null)
  const [build, setBuild] = useState({ phase: 'idle', lines: [] })
  const [notice, setNotice] = useState(null)

  const selected = useMemo(() => components.filter(item => hardware.componentIds.includes(item.id)), [hardware.componentIds])
  const checks = useMemo(() => [
    { label: 'MCU profile', detail: catalog[hardware.mcu] ? `${hardware.mcu} catalog profile loaded` : 'No MCU profile found', pass: Boolean(catalog[hardware.mcu]) },
    { label: 'I2C pins', detail: hardware.sda === hardware.scl ? `${hardware.sda} is assigned twice` : `${hardware.sda} / ${hardware.scl} are distinct`, pass: hardware.sda !== hardware.scl },
    { label: 'Driver coverage', detail: selected.every(item => item.driver) ? `${selected.length} selected driver${selected.length === 1 ? '' : 's'} resolved` : 'A selected component is missing a driver', pass: selected.every(item => item.driver) },
  ], [hardware, selected])
  const allValid = checks.every(check => check.pass)
  const config = useMemo(() => ({
    project: hardware.project,
    target: hardware.mcu,
    platform: 'Zephyr RTOS (project scaffold)',
    buses: { i2c1: { sda: hardware.sda, scl: hardware.scl }, uart2: selected.some(x => x.id === 'neo6m') ? { enabled: true } : { enabled: false } },
    components: selected.map(({ label, bus, driver, address }) => ({ name: label, bus, driver, address })),
  }), [hardware, selected])

  function patchHardware(patch) {
    setHardware(current => ({ ...current, ...patch }))
    setValidation(null)
    setBuild({ phase: 'idle', lines: [] })
  }
  function toggleComponent(id) {
    patchHardware({ componentIds: hardware.componentIds.includes(id) ? hardware.componentIds.filter(x => x !== id) : [...hardware.componentIds, id] })
  }
  function validate() {
    setBuild({ phase: 'idle', lines: [] })
    setValidation({ passed: allValid, checks })
    setNotice(allValid ? { type: 'success', text: 'Hardware model validated. Ready to generate the project scaffold.' } : { type: 'error', text: 'IoTForge detected an I2C pin conflict before build.' })
  }
  function tryError() {
    patchHardware({ sda: 'PB8', scl: 'PB8' })
    setValidation({ passed: false, checks: [{ label: 'MCU profile', detail: `${hardware.mcu} catalog profile loaded`, pass: true }, { label: 'I2C pins', detail: 'PB8 is assigned to both SDA and SCL', pass: false }, { label: 'Driver coverage', detail: `${selected.length} selected drivers resolved`, pass: true }] })
    setNotice({ type: 'error', text: 'IoTForge detected an I2C pin conflict before build.' })
    document.getElementById('validation')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }
  function resetDemo() {
    setHardware(initialHardware); setValidation(null); setBuild({ phase: 'idle', lines: [] }); setNotice({ type: 'success', text: 'Demo reset to the Weather Node baseline.' })
  }
  function startBuild() {
    if (!validation?.passed) return
    setNotice(null)
    setBuild({ phase: 'running', lines: [] })
    buildSteps.forEach((step, index) => {
      window.setTimeout(() => {
        setBuild(current => ({ phase: index === buildSteps.length - 1 ? 'complete' : 'running', lines: [...current.lines, { step, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) }] }))
      }, 550 * (index + 1))
    })
  }
  const buildReport = { status: build.phase === 'complete' ? 'SIMULATED_BUILD_SUCCESSFUL' : 'NOT_RUN', disclaimer: 'This pitch MVP generates a deterministic project scaffold and simulated build report. It does not produce executable firmware binaries.', input: config, validation: checks.map(({ label, detail, pass }) => ({ check: label, detail, result: pass ? 'passed' : 'failed' })), generatedAt: new Date().toISOString() }

  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand"><div className="brand-mark">{icons.chip}</div><div><strong>IoTForge</strong><span>Hardware → Validated Firmware</span></div></div>
      <nav aria-label="Main navigation">
        <a className="nav-item active" href="#overview"><i>{icons.grid}</i>Overview</a>
        <a className="nav-item" href="#hardware"><i>{icons.chip}</i>Hardware model</a>
        <a className="nav-item" href="#validation"><i>{icons.shield}</i>Validation</a>
        <a className="nav-item" href="#build"><i>{icons.bolt}</i>Build workspace</a>
        <a className="nav-item" href="#roadmap"><i>{icons.layer}</i>Roadmap</a>
      </nav>
      <div className="side-footer"><span className="mvp-pill"><StatusDot /> PITCH MVP</span><p>Simulated build environment<br />No external services connected</p></div>
    </aside>

    <main>
      <header className="topbar"><div className="mobile-brand"><span className="brand-mark">{icons.chip}</span> IoTForge</div><div className="project-selector"><span className="muted">Active project</span><b>{hardware.project}</b><span className="chevron">⌄</span></div><div className="top-actions"><span className="demo-badge">Pitch MVP <span>•</span> simulated build</span><button className="icon-button" onClick={resetDemo} title="Reset demo">{icons.reset}</button><div className="avatar">IF</div></div></header>

      <section className="content" id="overview">
        <div className="hero"><div><div className="eyebrow"><StatusDot /> HARDWARE-TO-FIRMWARE AUTOMATION</div><h1>Describe your hardware.<br /><em>Ship a validated starting point.</em></h1><p>IoTForge turns a structured hardware description into a validated Zephyr project scaffold—before the expensive work of board bring-up begins.</p></div><div className="hero-grid" aria-label="Workflow"><div><i>{icons.chip}</i><span>Hardware</span></div><b>{icons.arrow}</b><div><i>{icons.shield}</i><span>Validate</span></div><b>{icons.arrow}</b><div><i>{icons.code}</i><span>Generate</span></div><b>{icons.arrow}</b><div><i>{icons.box}</i><span>Build</span></div></div></div>

        {notice && <div className={`notice ${notice.type}`} role="status"><span>{notice.type === 'success' ? icons.check : icons.alert}</span><div><b>{notice.type === 'success' ? 'Ready for the next step' : 'Build stopped early'}</b><p>{notice.text}</p></div><button onClick={() => setNotice(null)} aria-label="Dismiss notification">{icons.close}</button></div>}

        <section className="section-heading" id="hardware"><div><div className="section-kicker">01 / INPUT</div><h2>Hardware model</h2><p>Start with explicit, reviewable board details. No AI guessing.</p></div><div className="step-label">Step 1 of 3</div></section>
        <div className="form-card">
          <div className="form-grid top-fields"><label>Project name<input value={hardware.project} onChange={e => patchHardware({ project: e.target.value })} /></label><label>MCU target<select value={hardware.mcu} onChange={e => patchHardware({ mcu: e.target.value })}>{Object.entries(catalog).map(([id, item]) => <option key={id} value={id}>{id} · {item.architecture}</option>)}</select></label><div className="mcu-detail"><span>Catalog profile</span><strong>{catalog[hardware.mcu].family}</strong><small>{catalog[hardware.mcu].flash} flash · {catalog[hardware.mcu].driver}</small></div></div>
          <div className="form-divider" />
          <div className="subheading"><div><h3>Connected components</h3><p>Select known parts from the supported mock driver catalog.</p></div><span className="count-badge">{selected.length} selected</span></div>
          <div className="component-grid">{components.map(item => <button key={item.id} className={`component ${hardware.componentIds.includes(item.id) ? 'selected' : ''}`} onClick={() => toggleComponent(item.id)}><span className="component-check">{hardware.componentIds.includes(item.id) ? icons.check : ''}</span><span className="component-info"><b>{item.label}</b><small>{item.type}</small></span><span className="bus-badge">{item.bus}</span></button>)}</div>
          <div className="pin-panel"><div><span className="pin-label">PRIMARY I²C BUS</span><p>Assign the SDA and SCL pins used by the I²C components.</p></div><label>SDA pin<select value={hardware.sda} onChange={e => patchHardware({ sda: e.target.value })}>{['PB9', 'PB8', 'PA10', 'PC1'].map(pin => <option key={pin}>{pin}</option>)}</select></label><label>SCL pin<select value={hardware.scl} onChange={e => patchHardware({ scl: e.target.value })}>{['PB8', 'PB9', 'PA9', 'PC0'].map(pin => <option key={pin}>{pin}</option>)}</select></label></div>
          <div className="form-actions"><button className="button secondary" onClick={tryError}><span>{icons.alert}</span> Try an error</button><button className="button primary" onClick={validate}>Validate hardware <span>{icons.arrow}</span></button></div>
        </div>

        <section className="section-heading compact" id="validation"><div><div className="section-kicker">02 / CHECK</div><h2>Deterministic validation</h2><p>Rules decide the result. The product does not claim a configuration is correct without a check.</p></div>{validation && <span className={`result-pill ${validation.passed ? 'passed' : 'failed'}`}>{validation.passed ? icons.check + ' ALL CHECKS PASSED' : icons.alert + ' ACTION REQUIRED'}</span>}</section>
        <div className="checks-card">{checks.map(check => <div key={check.label} className={`check-row ${validation ? (check.pass ? 'pass' : 'fail') : ''}`}><span className="check-icon">{validation ? (check.pass ? icons.check : icons.alert) : icons.clock}</span><div><b>{check.label}</b><span>{check.detail}</span></div><small>{validation ? (check.pass ? 'Passed' : 'Blocked') : 'Waiting'}</small></div>)}</div>

        <section className="section-heading compact" id="build"><div><div className="section-kicker">03 / OUTPUT</div><h2>Generate & build workspace</h2><p>Create the project scaffold, inspect the output, and download the transparent demo records.</p></div><div className="step-label">{validation?.passed ? 'Ready to build' : 'Validate first'}</div></section>
          <div className="workspace">
          <div className="console-card"><div className="console-title"><div><span className="terminal-mark">{icons.terminal}</span><b>Build console</b></div><span className={`build-state ${build.phase}`}>{build.phase === 'complete' ? 'BUILD SUCCESSFUL' : build.phase === 'running' ? 'BUILDING' : 'AWAITING INPUT'}</span></div><div className="console"><div className="console-line dim">$ iotforge generate --target {hardware.mcu.toLowerCase()}</div>{build.lines.length === 0 && <div className="console-empty">{validation?.passed ? 'Validation passed. Start a simulated build when ready.' : 'A valid hardware model is required before generation.'}</div>}{build.lines.map((line, index) => <div className="console-line" key={line.step}><span className="line-time">{line.timestamp}</span><span className="line-check">{icons.check}</span>{line.step}<span className="line-done">done</span>{index === buildSteps.length - 1 && <strong className="success-line">BUILD SUCCESSFUL</strong>}</div>)}</div><div className="console-footer"><span><StatusDot tone={build.phase === 'complete' ? 'teal' : 'muted'} /> {build.phase === 'complete' ? 'Project scaffold generated' : 'Local simulation only'}</span><button className="button primary" disabled={!validation?.passed || build.phase === 'running'} onClick={startBuild}>{build.phase === 'running' ? 'Building…' : build.phase === 'complete' ? 'Build again' : 'Generate & Build Firmware'} <span>{icons.bolt}</span></button></div></div>
          <div className="preview-stack"><div className="preview-card"><div className="card-title"><div><span className="file-icon json">{'{ }'}</span><b>hardware.json</b></div><button className="text-button" onClick={() => downloadFile('hardware.json', config)}>{icons.download} Download</button></div><pre>{JSON.stringify(config, null, 2)}</pre></div><div className="preview-card report-card"><div className="card-title"><div><span className="file-icon report">✓</span><b>build-report.json</b></div><button className="text-button" onClick={() => downloadFile('build-report.json', buildReport)}>{icons.download} Download</button></div><p>Includes the validated input, rule results and an explicit simulation disclaimer.</p></div></div>
        </div>

        {build.phase === 'complete' && <section className="artifact-section"><div className="artifact-heading"><div><div className="section-kicker">GENERATED PROJECT</div><h2>Project scaffold artifacts</h2></div><span className="simulated-label">SIMULATED OUTPUT</span></div><p className="artifact-note">These are named project outputs for the pitch demo. No binary firmware files are created or downloadable by this MVP.</p><div className="artifact-grid">{['firmware.bin', 'firmware.hex', 'firmware.elf', 'generated.dts', 'app.conf', 'hardware.json'].map(file => <div className="artifact" key={file}><span className="file-icon">{file.endsWith('.json') ? '{ }' : file.endsWith('.dts') ? 'DT' : file.endsWith('.conf') ? 'CF' : 'FW'}</span><div><b>{file}</b><small>{file.endsWith('.bin') || file.endsWith('.hex') || file.endsWith('.elf') ? 'Build artifact reference' : 'Generated configuration'}</small></div><span className="artifact-check">{icons.check}</span></div>)}</div></section>}

        <section className="roadmap" id="roadmap"><div className="roadmap-head"><div><div className="section-kicker">DELIVERIBLY NARROW</div><h2>Path from pitch MVP to real tooling</h2></div><p>Each stage increases technical scope only after the previous capability is trustworthy.</p></div><div className="roadmap-grid"><article className="current"><span>MVP / NOW</span><h3>Hardware model + validation</h3><p>Structured input, deterministic checks and a generated Zephyr project scaffold.</p></article><article><span>V2</span><h3>Design-file ingestion</h3><p>KiCad schematic/BOM parsing and a broader component-driver database.</p></article><article><span>V3</span><h3>Real build workers</h3><p>Dockerized Zephyr builds that return actual, traceable firmware binaries.</p></article><article><span>V4</span><h3>Device lifecycle</h3><p>Flashing, hardware-in-the-loop tests, signed OTA and device management.</p></article></div></section>
        <footer><span>IoTForge pitch MVP</span><span>Hardware → Validated Firmware</span><span>Built for a clear 2-minute demo</span></footer>
      </section>
    </main>
  </div>
}

export default App

# IoTForge MVP

IoTForge is a pitch-demo frontend for the idea: **"Describe your hardware. IoTForge validates it and generates a firmware project."**

## Run locally

```bash
npm install
npm run dev
```

Use `npm run build` to make the production bundle.

## What this demo does for real

- Captures a deterministic hardware description for the Weather Node Demo.
- Validates that an MCU profile exists, I2C pins differ, and each selected component is represented in the mock driver catalog.
- Shows a deterministic, timed simulated build workflow.
- Generates and downloads a real `hardware.json` and `build-report.json` based on the current state.
- Lets the presenter deliberately introduce an I2C pin conflict before building.

## What is deliberately simulated

This version has no backend, KiCad parser, Zephyr installation, cross compiler, build worker, hardware connection, or executable firmware output. The names `firmware.bin`, `firmware.hex`, and `firmware.elf` are displayed only as expected project artifact references after a successful **simulated** build; the app does not create or download fake binary files.

The interface labels the work as **Pitch MVP / simulated build** throughout. A real next version should generate a Zephyr project, build it inside an isolated worker, retain the logs, and only then expose traceable binaries.

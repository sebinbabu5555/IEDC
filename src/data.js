export const catalog = {
  STM32U575: { family: 'STM32U5', architecture: 'Arm Cortex-M33', flash: '2 MB', driver: 'zephyr,stm32-u5' },
  nRF52840: { family: 'nRF52', architecture: 'Arm Cortex-M4', flash: '1 MB', driver: 'nordic,nrf52840' },
  ESP32S3: { family: 'ESP32-S3', architecture: 'Xtensa LX7', flash: '8 MB', driver: 'espressif,esp32s3' },
}

export const components = [
  { id: 'bme280', label: 'BME280', type: 'Environmental sensor', bus: 'I2C', driver: 'bosch,bme280', address: '0x76', default: true },
  { id: 'mpu6050', label: 'MPU6050', type: 'Motion sensor', bus: 'I2C', driver: 'invensense,mpu6050', address: '0x68', default: true },
  { id: 'ssd1306', label: 'SSD1306 OLED', type: '128 × 64 display', bus: 'I2C', driver: 'solomon,ssd1306fb', address: '0x3C', default: true },
  { id: 'neo6m', label: 'NEO-6M GPS', type: 'Positioning module', bus: 'UART', driver: 'u-blox,neo-6m', address: 'UART2', default: false },
]

export const buildSteps = [
  'Parse hardware model',
  'Validate components & pins',
  'Generate Devicetree overlay',
  'Generate Zephyr configuration',
  'Compile target firmware',
  'Package artifacts',
]

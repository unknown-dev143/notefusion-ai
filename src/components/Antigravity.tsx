import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { 
  Card, 
  Typography, 
  Button, 
  Space, 
  Slider, 
  Switch, 
  Select, 
  InputNumber, 
  Row, 
  Col,
  Progress,
  Statistic,
  Alert,
  Badge,
  Divider,
  Tag,
  Tabs
} from 'antd';
import {
  PlayCircleOutlined,
  PauseCircleOutlined,
  ReloadOutlined,
  RocketOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';

// Error boundary component
class AntigravityErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Antigravity component error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Alert
          message="System Error"
          description="The antigravity control system encountered an error. Please refresh the page."
          type="error"
          showIcon
          action={
            <Button size="small" onClick={() => window.location.reload()}>
              Refresh
            </Button>
          }
        />
      );
    }

    return this.props.children;
  }
}

const { Title, Text } = Typography;
const { Option } = Select;

interface AntigravitySettings {
  power: number;
  frequency: number;
  fieldStrength: number;
  stabilization: boolean;
  autoMode: boolean;
  temperature: number;
  pressure: number;
  resonance: number;
  efficiency: number;
  safetyLevel: 'low' | 'medium' | 'high' | 'maximum';
}

interface AntigravityMetrics {
  liftForce: number;
  energyConsumption: number;
  fieldStability: number;
  temperature: number;
  efficiency: number;
  operationalTime: number;
  status: 'idle' | 'active' | 'warning' | 'critical' | 'offline';
  errorCount: number;
  lastMaintenance: string;
  performanceScore: number;
}

interface AntigravityAlert {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  message: string;
  timestamp: string;
  acknowledged: boolean;
}

// Type guard functions for runtime type checking
const isValidAntigravitySettings = (obj: any): obj is AntigravitySettings => {
  return obj && 
    typeof obj.power === 'number' &&
    typeof obj.frequency === 'number' &&
    typeof obj.fieldStrength === 'number' &&
    typeof obj.stabilization === 'boolean' &&
    typeof obj.autoMode === 'boolean' &&
    typeof obj.temperature === 'number' &&
    typeof obj.pressure === 'number' &&
    typeof obj.resonance === 'number' &&
    typeof obj.efficiency === 'number' &&
    ['low', 'medium', 'high', 'maximum'].includes(obj.safetyLevel);
};

const isValidAntigravityMetrics = (obj: any): obj is AntigravityMetrics => {
  return obj &&
    typeof obj.liftForce === 'number' &&
    typeof obj.energyConsumption === 'number' &&
    typeof obj.fieldStability === 'number' &&
    typeof obj.temperature === 'number' &&
    typeof obj.efficiency === 'number' &&
    typeof obj.operationalTime === 'number' &&
    ['idle', 'active', 'warning', 'critical', 'offline'].includes(obj.status) &&
    typeof obj.errorCount === 'number' &&
    typeof obj.lastMaintenance === 'string' &&
    typeof obj.performanceScore === 'number';
};

const AntigravityComponent: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [settings, setSettings] = useState<AntigravitySettings>({
    power: 50,
    frequency: 1000,
    fieldStrength: 75,
    stabilization: true,
    autoMode: false,
    temperature: 20,
    pressure: 101.3,
    resonance: 85,
    efficiency: 90,
    safetyLevel: 'high'
  });

  const [metrics, setMetrics] = useState<AntigravityMetrics>({
    liftForce: 0,
    energyConsumption: 0,
    fieldStability: 100,
    temperature: 20,
    efficiency: 0,
    operationalTime: 0,
    status: 'idle',
    errorCount: 0,
    lastMaintenance: new Date().toISOString(),
    performanceScore: 100
  });

  const [alerts, setAlerts] = useState<AntigravityAlert[]>([]);
  const [isCalibrating, setIsCalibrating] = useState(false); // Fixed typo: was isCalibrating
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const calibrationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const seedRef = useRef(Date.now());

  // Seeded pseudo-random function for predictable values
  const seededRandom = useCallback((min: number, max: number) => {
    seedRef.current = (seedRef.current * 9301 + 49297) % 233280;
    const rnd = seedRef.current / 233280;
    return min + rnd * (max - min);
  }, []);

  const addAlert = useCallback((type: AntigravityAlert['type'], message: string) => {
    const newAlert: AntigravityAlert = {
      id: Date.now().toString(),
      type,
      message,
      timestamp: new Date().toISOString(),
      acknowledged: false
    };
    setAlerts(prev => [newAlert, ...prev].slice(0, 10));
  }, []);

  const calculateMetrics = useCallback(() => {
    if (!isActive) return;

    try {
      // Add null/undefined checks
      const power = Number(settings.power) || 0;
      const frequency = Number(settings.frequency) || 1000;
      const fieldStrength = Number(settings.fieldStrength) || 0;
      const temperature = Number(settings.temperature) || 20;
      const efficiency = Number(settings.efficiency) || 0;

      const powerEfficiency = efficiency / 100;
      const fieldEfficiency = fieldStrength / 100;
      const temperatureFactor = Math.max(0, 1 - Math.abs(temperature - 20) / 100);
      
      const liftForce = Math.max(0, (power * fieldStrength * powerEfficiency * fieldEfficiency * temperatureFactor) / 10);
      const energyConsumption = Math.max(0, power * (1 + frequency / 1000) * (1 + temperature / 100));
      const fieldStability = settings.stabilization ? 
        Math.max(0, 100 - seededRandom(0, 5)) : 
        Math.max(0, 80 - seededRandom(0, 20));
      const calculatedEfficiency = energyConsumption > 0 ? Math.min(100, (liftForce / energyConsumption) * 100) : 0;

      let status: AntigravityMetrics['status'] = 'active';
      if (calculatedEfficiency < 30) status = 'critical';
      else if (calculatedEfficiency < 50) status = 'warning';
      else if (calculatedEfficiency > 80) status = 'active';

      setMetrics(prev => ({
        ...prev,
        liftForce: Math.round(liftForce * 10) / 10,
        energyConsumption: Math.round(energyConsumption * 100) / 100,
        fieldStability: Math.round(fieldStability * 100) / 100,
        temperature: Math.max(-50, Math.min(100, temperature + (seededRandom(-1, 1) * 2))),
        efficiency: Math.round(calculatedEfficiency * 100) / 100,
        operationalTime: prev.operationalTime + 1,
        status,
        performanceScore: Math.round(Math.min(100, (calculatedEfficiency + fieldStability) / 2))
      }));

      // Add alerts based on conditions
      if (calculatedEfficiency < 30 && seededRandom(0, 1) > 0.7) {
        addAlert('error', 'Critical efficiency drop detected!');
      }
      if (fieldStability < 70 && seededRandom(0, 1) > 0.8) {
        addAlert('warning', 'Field stability compromised');
      }
      if (temperature > 50 && seededRandom(0, 1) > 0.9) {
        addAlert('error', 'Overheating detected!');
      }
    } catch (error) {
      console.error('Error calculating metrics:', error);
      addAlert('error', 'Metrics calculation failed');
    }
  }, [isActive, settings, addAlert]);

  useEffect(() => {
    if (isActive) {
      // Clear any existing interval before setting a new one
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      intervalRef.current = setInterval(calculateMetrics, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isActive, calculateMetrics]);

  // Cleanup effect for component unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (calibrationTimeoutRef.current) {
        clearTimeout(calibrationTimeoutRef.current);
        calibrationTimeoutRef.current = null;
      }
    };
  }, []);

  const handleStart = useCallback(() => {
    try {
      if (settings.safetyLevel === 'maximum' && settings.power > 80) {
        addAlert('warning', 'Power reduced for safety');
        setSettings(validateSettings({ power: 80 }));
      }
      setIsActive(true);
      addAlert('success', 'Antigravity field activated');
    } catch (error) {
      console.error('Error starting antigravity field:', error);
      addAlert('error', 'Failed to activate antigravity field');
    }
  }, [settings.safetyLevel, settings.power, addAlert]);

  const handleStop = useCallback(() => {
    try {
      setIsActive(false);
      setMetrics(prev => ({ 
        ...prev, 
        status: 'idle', 
        liftForce: 0 
      }));
      addAlert('info', 'Antigravity field deactivated');
    } catch (error) {
      console.error('Error stopping antigravity field:', error);
      addAlert('error', 'Failed to deactivate antigravity field');
    }
  }, [addAlert]);

  const handleCalibrate = useCallback(() => {
    if (isCalibrating) return; // Prevent multiple simultaneous calibrations
    
    // Clear any existing calibration timeout
    if (calibrationTimeoutRef.current) {
      clearTimeout(calibrationTimeoutRef.current);
      calibrationTimeoutRef.current = null;
    }
    
    try {
      setIsCalibrating(true);
      addAlert('info', 'Starting calibration sequence...');
      
      calibrationTimeoutRef.current = setTimeout(() => {
        try {
          setSettings(prev => ({
            ...prev,
            resonance: Math.min(100, Math.max(0, 85 + seededRandom(0, 10))),
            efficiency: Math.min(100, prev.efficiency + 5)
          }));
          setIsCalibrating(false);
          calibrationTimeoutRef.current = null;
          addAlert('success', 'Calibration completed successfully');
        } catch (error) {
          console.error('Error during calibration:', error);
          addAlert('error', 'Calibration failed');
          setIsCalibrating(false);
          calibrationTimeoutRef.current = null;
        }
      }, 3000);
    } catch (error) {
      console.error('Error starting calibration:', error);
      addAlert('error', 'Failed to start calibration');
      setIsCalibrating(false);
    }
  }, [isCalibrating, addAlert]);

  const handleEmergencyShutdown = useCallback(() => {
    try {
      setIsActive(false);
      setSettings(validateSettings({ power: 0 }));
      setMetrics(prev => ({ 
        ...prev, 
        status: 'critical', 
        liftForce: 0,
        efficiency: 0,
        errorCount: (prev.errorCount || 0) + 1 
      }));
      addAlert('error', 'Emergency shutdown activated!');
    } catch (error) {
      console.error('Error during emergency shutdown:', error);
      addAlert('error', 'Emergency shutdown failed');
    }
  }, [addAlert]);

  const validateSettings = useCallback((newSettings: Partial<AntigravitySettings>): AntigravitySettings => {
    return {
      power: Math.max(0, Math.min(100, newSettings.power !== undefined ? Number(newSettings.power) : settings.power)),
      frequency: Math.max(100, Math.min(10000, newSettings.frequency !== undefined ? Number(newSettings.frequency) : settings.frequency)),
      fieldStrength: Math.max(0, Math.min(100, newSettings.fieldStrength !== undefined ? Number(newSettings.fieldStrength) : settings.fieldStrength)),
      stabilization: newSettings.stabilization !== undefined ? Boolean(newSettings.stabilization) : settings.stabilization,
      autoMode: newSettings.autoMode !== undefined ? Boolean(newSettings.autoMode) : settings.autoMode,
      temperature: Math.max(-50, Math.min(100, newSettings.temperature !== undefined ? Number(newSettings.temperature) : settings.temperature)),
      pressure: Math.max(0, Math.min(200, newSettings.pressure !== undefined ? Number(newSettings.pressure) : settings.pressure)),
      resonance: Math.max(0, Math.min(100, newSettings.resonance !== undefined ? Number(newSettings.resonance) : settings.resonance)),
      efficiency: Math.max(0, Math.min(100, newSettings.efficiency !== undefined ? Number(newSettings.efficiency) : settings.efficiency)),
      safetyLevel: ['low', 'medium', 'high', 'maximum'].includes(newSettings.safetyLevel as any) 
        ? newSettings.safetyLevel as AntigravitySettings['safetyLevel']
        : settings.safetyLevel
    };
  }, [settings]);

  const getStatusColor = useCallback((status: AntigravityMetrics['status']) => {
    switch (status) {
      case 'active': return 'green';
      case 'warning': return 'orange';
      case 'critical': return 'red';
      case 'idle': return 'blue';
      case 'offline': return 'gray';
      default: return 'default';
    }
  }, []);

  return (
    <div style={{ padding: '24px' }} role="main" aria-label="Antigravity Control System">
      <header>
        <Title level={2}>
          <Space>
            <RocketOutlined aria-hidden="true" />
            Antigravity Control System
            <Badge 
              status={isActive ? 'processing' : 'default'} 
              text={isActive ? 'Active' : 'Inactive'}
              aria-label={`System status: ${isActive ? 'Active' : 'Inactive'}`}
            />
          </Space>
        </Title>
      </header>

      <Tabs 
        defaultActiveKey="control"
        items={[
          {
            key: 'control',
            label: 'Control Panel',
            children: (
              <Row gutter={[16, 16]}>
                <Col xs={24} lg={12}>
                  <Card title="Main Controls" size="small">
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <div>
                        <Space>
                          <Button
                            type="primary"
                            danger={isActive}
                            icon={isActive ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
                            onClick={isActive ? handleStop : handleStart}
                            size="large"
                            aria-label={isActive ? 'Stop antigravity field' : 'Start antigravity field'}
                          >
                            {isActive ? 'Stop Field' : 'Start Field'}
                          </Button>
                          <Button
                            icon={<ReloadOutlined />}
                            onClick={handleCalibrate}
                            loading={isCalibrating}
                            disabled={isActive}
                            aria-label={isCalibrating ? 'Calibrating system' : 'Calibrate system'}
                          >
                            {isCalibrating ? 'Calibrating...' : 'Calibrate'}
                          </Button>
                          <Button
                            danger
                            type="primary"
                            icon={<CloseCircleOutlined />}
                            onClick={handleEmergencyShutdown}
                            aria-label="Emergency shutdown antigravity system"
                          >
                            Emergency Stop
                          </Button>
                        </Space>
                      </div>

                      <Divider />

                      <div>
                        <Text strong>Power Level:</Text>
                        <Slider
                          min={0}
                          max={100}
                          value={settings.power}
                          onChange={(value) => setSettings(validateSettings({ power: value }))}
                          disabled={isActive}
                          style={{ marginTop: '8px' }}
                          aria-label="Power level slider"
                          aria-valuemin={0}
                          aria-valuemax={100}
                          aria-valuenow={settings.power}
                          aria-valuetext={`${settings.power}% power`}
                        />
                        <Text type="secondary" aria-live="polite">{settings.power}%</Text>
                      </div>

                      <div>
                        <Text strong>Frequency (Hz):</Text>
                        <InputNumber
                          min={100}
                          max={10000}
                          value={settings.frequency}
                          onChange={(value) => setSettings(validateSettings({ frequency: value !== null && value !== undefined ? value : settings.frequency }))}
                          disabled={isActive}
                          style={{ width: '100%', marginTop: '8px' }}
                          aria-label="Frequency in Hertz"
                          aria-valuemin={100}
                          aria-valuemax={10000}
                          aria-valuenow={settings.frequency}
                        />
                      </div>

                      <div>
                        <Text strong>Field Strength:</Text>
                        <Slider
                          min={0}
                          max={100}
                          value={settings.fieldStrength}
                          onChange={(value) => setSettings(validateSettings({ fieldStrength: value }))}
                          disabled={isActive}
                          style={{ marginTop: '8px' }}
                          aria-label="Field strength slider"
                          aria-valuemin={0}
                          aria-valuemax={100}
                          aria-valuenow={settings.fieldStrength}
                          aria-valuetext={`${settings.fieldStrength}% field strength`}
                        />
                        <Text type="secondary" aria-live="polite">{settings.fieldStrength}%</Text>
                      </div>

                      <div>
                        <Space>
                          <Switch
                            checked={settings.stabilization}
                            onChange={(checked) => setSettings(validateSettings({ stabilization: checked }))}
                            disabled={isActive}
                            aria-label="Field stabilization toggle"
                            aria-checked={settings.stabilization}
                          />
                          <Text>Field Stabilization</Text>
                        </Space>
                      </div>

                      <div>
                        <Space>
                          <Switch
                            checked={settings.autoMode}
                            onChange={(checked) => setSettings(validateSettings({ autoMode: checked }))}
                            aria-label="Auto mode toggle"
                            aria-checked={settings.autoMode}
                          />
                          <Text>Auto Mode</Text>
                        </Space>
                      </div>

                      <div>
                        <Text strong>Safety Level:</Text>
                        <Select
                          value={settings.safetyLevel}
                          onChange={(value) => setSettings(validateSettings({ safetyLevel: value }))}
                          style={{ width: '100%', marginTop: '8px' }}
                          disabled={isActive}
                          aria-label="Safety level selection"
                        >
                          <Option value="low">Low</Option>
                          <Option value="medium">Medium</Option>
                          <Option value="high">High</Option>
                          <Option value="maximum">Maximum</Option>
                        </Select>
                      </div>
                    </Space>
                  </Card>
                </Col>

                <Col xs={24} lg={12}>
                  <Card title="System Metrics" size="small">
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <Row gutter={16}>
                        <Col span={12}>
                          <Statistic
                            title="Lift Force"
                            value={metrics.liftForce}
                            suffix="kN"
                            precision={1}
                          />
                        </Col>
                        <Col span={12}>
                          <Statistic
                            title="Energy Consumption"
                            value={metrics.energyConsumption}
                            suffix="kW"
                            precision={2}
                          />
                        </Col>
                      </Row>

                      <Row gutter={16}>
                        <Col span={12}>
                          <Statistic
                            title="Field Stability"
                            value={metrics.fieldStability}
                            suffix="%"
                            precision={2}
                          />
                        </Col>
                        <Col span={12}>
                          <Statistic
                            title="Temperature"
                            value={metrics.temperature}
                            suffix="°C"
                            precision={1}
                          />
                        </Col>
                      </Row>

                      <Row gutter={16}>
                        <Col span={12}>
                          <Statistic
                            title="Efficiency"
                            value={metrics.efficiency}
                            suffix="%"
                            precision={2}
                          />
                        </Col>
                        <Col span={12}>
                          <Statistic
                            title="Operational Time"
                            value={metrics.operationalTime}
                            suffix="s"
                          />
                        </Col>
                      </Row>

                      <Divider />

                      <div>
                        <Text strong>System Status:</Text>
                        <Tag color={getStatusColor(metrics.status)}>
                          {metrics.status.toUpperCase()}
                        </Tag>
                        {metrics.errorCount > 0 && (
                          <Tag color="red">{metrics.errorCount} Errors</Tag>
                        )}
                      </div>

                      <div style={{ marginTop: '16px' }}>
                        <Text strong>Performance Score:</Text>
                        <Progress
                          percent={metrics.performanceScore}
                          status={metrics.performanceScore > 70 ? 'success' : metrics.performanceScore > 40 ? 'normal' : 'exception'}
                          strokeColor={getStatusColor(metrics.status)}
                        />
                      </div>

                      <Divider />

                      <div>
                        <Text strong>Last Maintenance:</Text>
                        <Text type="secondary">
                          {new Date(metrics.lastMaintenance).toLocaleString()}
                        </Text>
                      </div>
                    </Space>
                  </Card>
                </Col>

                <Col xs={24} lg={12}>
                  <Card title="Environmental Controls" size="small">
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <div>
                        <Text strong>Temperature (°C):</Text>
                        <Slider
                          min={-50}
                          max={100}
                          value={settings.temperature}
                          onChange={(value) => setSettings(validateSettings({ temperature: value }))}
                          style={{ marginTop: '8px' }}
                        />
                        <Text type="secondary">{settings.temperature}°C</Text>
                      </div>

                      <div>
                        <Text strong>Pressure (kPa):</Text>
                        <InputNumber
                          min={0}
                          max={200}
                          value={settings.pressure}
                          onChange={(value) => setSettings(validateSettings({ pressure: value !== null && value !== undefined ? value : settings.pressure }))}
                          style={{ width: '100%', marginTop: '8px' }}
                        />
                      </div>

                      <div>
                        <Text strong>Resonance Frequency:</Text>
                        <Slider
                          min={0}
                          max={100}
                          value={settings.resonance}
                          onChange={(value) => setSettings(validateSettings({ resonance: value !== null && value !== undefined ? value : settings.resonance }))}
                          style={{ marginTop: '8px' }}
                        />
                        <Text type="secondary">{settings.resonance}%</Text>
                      </div>
                    </Space>
                  </Card>
                </Col>

                <Col xs={24} lg={12}>
                  <Card title="System Information" size="small">
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <div>
                        <Text strong>System Alerts:</Text>
                        {alerts.length === 0 ? (
                          <Text type="secondary">No alerts</Text>
                        ) : (
                          alerts.map(alert => (
                            <Alert
                              key={alert.id}
                              message={alert.message}
                              type={alert.type}
                              showIcon
                              style={{ marginBottom: '8px' }}
                              closable
                              onClose={() => {
                                setAlerts(prev => prev.filter(a => a.id !== alert.id));
                              }}
                            />
                          ))
                        )}
                      </div>

                      <Divider />

                      <div>
                        <Text strong>Advanced Settings:</Text>
                        <Space direction="vertical" style={{ width: '100%' }}>
                          <div>
                            <Text>Resonance: {settings.resonance}%</Text>
                          </div>
                          <div>
                            <Text>Auto Mode: {settings.autoMode ? 'Enabled' : 'Disabled'}</Text>
                          </div>
                          <div>
                            <Text>Field Stabilization: {settings.stabilization ? 'Active' : 'Inactive'}</Text>
                          </div>
                          <div>
                            <Text>Safety Level: {settings.safetyLevel.toUpperCase()}</Text>
                          </div>
                        </Space>
                      </div>
                    </Space>
                  </Card>
                </Col>
              </Row>
            )
          }
        ]}
      />
    </div>
  );
};

// Wrap with React.memo for performance optimization
const Antigravity = React.memo(AntigravityComponent);

// Wrap with error boundary
const AntigravityWithErrorBoundary: React.FC = () => (
  <AntigravityErrorBoundary>
    <Antigravity />
  </AntigravityErrorBoundary>
);

export default AntigravityWithErrorBoundary;

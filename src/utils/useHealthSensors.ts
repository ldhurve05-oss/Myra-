import { useState, useEffect, useRef, useCallback } from 'react';
import { HealthMetrics, EcgSample } from '../types/assistant';
import { loadStoredHealthMetrics, saveHealthMetrics } from './healthTracker';

export function useHealthSensors(triggerHaptic?: (pattern?: number | number[]) => void) {
  const [metrics, setMetrics] = useState<HealthMetrics>(() => loadStoredHealthMetrics());
  const [isScanningHeartRate, setIsScanningHeartRate] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [isSimulatingWalk, setIsSimulatingWalk] = useState(false);

  // References for step detection algorithms
  const lastStepTimeRef = useRef<number>(0);
  const lastAccelRef = useRef<{ x: number; y: number; z: number }>({ x: 0, y: 0, z: 0 });
  const walkIntervalRef = useRef<any>(null);
  const scanIntervalRef = useRef<any>(null);

  // Save metrics on change
  useEffect(() => {
    saveHealthMetrics(metrics);
  }, [metrics]);

  // Method to increment steps
  const addSteps = useCallback((count: number = 1) => {
    setMetrics(prev => {
      const newCurrent = prev.steps.current + count;
      const addedKm = parseFloat((count * 0.00078).toFixed(3));
      const addedKcal = Math.round(count * 0.04);

      // Also add to the current hour in hourly data
      const updatedHourly = [...prev.steps.hourly];
      if (updatedHourly.length > 0) {
        const lastIdx = updatedHourly.length - 1;
        updatedHourly[lastIdx] = {
          ...updatedHourly[lastIdx],
          steps: updatedHourly[lastIdx].steps + count,
          activeMin: updatedHourly[lastIdx].activeMin + Math.max(1, Math.round(count / 100)),
        };
      }

      // Update weekly for today (last item)
      const updatedWeekly = [...prev.steps.weekly];
      if (updatedWeekly.length > 0) {
        const lastIdx = updatedWeekly.length - 1;
        updatedWeekly[lastIdx] = {
          ...updatedWeekly[lastIdx],
          steps: updatedWeekly[lastIdx].steps + count,
        };
      }

      return {
        ...prev,
        steps: {
          ...prev.steps,
          current: newCurrent,
          distanceKm: parseFloat((prev.steps.distanceKm + addedKm).toFixed(2)),
          caloriesKcal: prev.steps.caloriesKcal + addedKcal,
          activeMinutes: prev.steps.activeMinutes + (count >= 10 ? 1 : 0),
          hourly: updatedHourly,
          weekly: updatedWeekly,
        },
      };
    });
  }, []);

  const addStepsRef = useRef(addSteps);
  useEffect(() => {
    addStepsRef.current = addSteps;
  }, [addSteps]);

  const triggerHapticRef = useRef(triggerHaptic);
  useEffect(() => {
    triggerHapticRef.current = triggerHaptic;
  }, [triggerHaptic]);

  // Hardware DeviceMotionEvent listener for mobile physical movement
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleMotion = (event: DeviceMotionEvent) => {
      const acc = event.accelerationIncludingGravity || event.acceleration;
      if (!acc || acc.x === null || acc.y === null || acc.z === null) return;

      const x = acc.x;
      const y = acc.y;
      const z = acc.z;

      // Compute total magnitude
      const magnitude = Math.sqrt(x * x + y * y + z * z);
      const delta = Math.abs(
        magnitude - Math.sqrt(lastAccelRef.current.x ** 2 + lastAccelRef.current.y ** 2 + lastAccelRef.current.z ** 2)
      );

      lastAccelRef.current = { x, y, z };

      const now = Date.now();
      // Step detection threshold: delta > 2.8 m/s² and at least 320ms since last step
      if (delta > 2.8 && now - lastStepTimeRef.current > 320) {
        lastStepTimeRef.current = now;
        addStepsRef.current(1);
        if (triggerHapticRef.current) {
          triggerHapticRef.current(25);
        }
      }
    };

    if ('DeviceMotionEvent' in window) {
      window.addEventListener('devicemotion', handleMotion);
      setMetrics(prev => {
        if (prev.sensors.accelerometerAvailable && prev.sensors.motionListening) return prev;
        return {
          ...prev,
          sensors: {
            ...prev.sensors,
            accelerometerAvailable: true,
            motionListening: true,
            sensorAccuracy: 'Device Accelerometer',
          },
        };
      });
    }

    return () => {
      if ('DeviceMotionEvent' in window) {
        window.removeEventListener('devicemotion', handleMotion);
      }
    };
  }, []);

  // Simulated walking toggle for live testing on desktop or without walking
  const toggleWalkSimulation = useCallback(() => {
    if (isSimulatingWalk) {
      if (walkIntervalRef.current) clearInterval(walkIntervalRef.current);
      setIsSimulatingWalk(false);
    } else {
      setIsSimulatingWalk(true);
      walkIntervalRef.current = setInterval(() => {
        const batch = Math.floor(Math.random() * 3) + 2; // 2-4 steps per tick
        addSteps(batch);
        if (triggerHaptic) triggerHaptic(20);
      }, 700);
    }
  }, [isSimulatingWalk, addSteps, triggerHaptic]);

  useEffect(() => {
    return () => {
      if (walkIntervalRef.current) clearInterval(walkIntervalRef.current);
      if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
    };
  }, []);

  // Measure Heart Rate with optical sensor simulation
  const startHeartRateMeasurement = useCallback(() => {
    if (isScanningHeartRate) return;
    setIsScanningHeartRate(true);
    setScanProgress(0);
    if (triggerHaptic) triggerHaptic([50, 50]);

    let progress = 0;
    scanIntervalRef.current = setInterval(() => {
      progress += 10;
      setScanProgress(progress);

      // Generate dynamic pulse waveform points
      const randomBpm = 68 + Math.floor(Math.random() * 14); // 68 - 82 bpm
      const isPeak = progress % 30 === 0;
      const voltage = isPeak ? 0.95 : (Math.random() * 0.3 - 0.1);

      setMetrics(prev => {
        const nextWave = [...prev.heartRate.ecgWaveform.slice(1), {
          time: `${Math.round(progress / 10)}s`,
          bpm: randomBpm,
          voltage: parseFloat(voltage.toFixed(2)),
        }];
        return {
          ...prev,
          heartRate: {
            ...prev.heartRate,
            currentBpm: randomBpm,
            status: 'measuring',
            ecgWaveform: nextWave,
          },
        };
      });

      if (triggerHaptic && (progress % 20 === 0)) {
        triggerHaptic(40);
      }

      if (progress >= 100) {
        clearInterval(scanIntervalRef.current);
        setIsScanningHeartRate(false);
        const finalBpm = 72 + Math.floor(Math.random() * 8);
        setMetrics(prev => ({
          ...prev,
          heartRate: {
            ...prev.heartRate,
            currentBpm: finalBpm,
            restingBpm: Math.min(prev.heartRate.restingBpm, finalBpm),
            maxBpm: Math.max(prev.heartRate.maxBpm, finalBpm),
            status: finalBpm < 100 ? 'optimal' : 'elevated',
            zone: finalBpm < 90 ? 'Rest' : 'Fat Burn',
          },
        }));
        if (triggerHaptic) triggerHaptic([80, 50, 120]);
      }
    }, 400);
  }, [isScanningHeartRate, triggerHaptic]);

  // Hydration controls
  const logWater = useCallback((amountMl: number) => {
    setMetrics(prev => {
      const nextMl = Math.max(0, Math.min(6000, prev.hydration.currentMl + amountMl));
      return {
        ...prev,
        hydration: {
          ...prev.hydration,
          currentMl: nextMl,
        },
      };
    });
    if (triggerHaptic) triggerHaptic(30);
  }, [triggerHaptic]);

  // Sleep hours quick logging
  const logSleepHours = useCallback((hours: number) => {
    setMetrics(prev => {
      const deep = parseFloat((hours * 0.28).toFixed(1));
      const rem = parseFloat((hours * 0.24).toFixed(1));
      const awake = 0.4;
      const light = parseFloat((hours - deep - rem - awake).toFixed(1));
      const efficiency = Math.min(98, Math.max(65, Math.round((hours / 8) * 94)));

      const updatedWeekly = [...prev.sleep.weekly];
      if (updatedWeekly.length > 0) {
        const lastIdx = updatedWeekly.length - 1;
        updatedWeekly[lastIdx] = {
          ...updatedWeekly[lastIdx],
          total: hours,
          deep,
          rem,
          light,
          efficiency,
        };
      }

      return {
        ...prev,
        sleep: {
          ...prev.sleep,
          lastNightHours: hours,
          qualityScore: efficiency,
          deepHours: deep,
          remHours: rem,
          lightHours: Math.max(0, light),
          weekly: updatedWeekly,
        },
      };
    });
    if (triggerHaptic) triggerHaptic(50);
  }, [triggerHaptic]);

  return {
    metrics,
    addSteps,
    isScanningHeartRate,
    scanProgress,
    startHeartRateMeasurement,
    isSimulatingWalk,
    toggleWalkSimulation,
    logWater,
    logSleepHours,
  };
}

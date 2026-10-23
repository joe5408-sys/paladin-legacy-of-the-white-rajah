import { useFrame, useThree } from '@react-three/fiber';
import { useLayoutEffect, useRef } from 'react';
import * as THREE from 'three';
import {
  CAMERA_DISTANCE,
  CAMERA_FOLLOW_SHARPNESS,
  CAMERA_PITCH_DEG,
  CAMERA_VIEW_HEIGHT,
} from '../core/constants';

interface FollowCameraProps {
  target: React.MutableRefObject<THREE.Vector3>;
}

const pitch = THREE.MathUtils.degToRad(CAMERA_PITCH_DEG);
/** Fixed offset from the look-at point: up and toward the viewer (+Z). */
const OFFSET = new THREE.Vector3(0, Math.sin(pitch), Math.cos(pitch)).multiplyScalar(
  CAMERA_DISTANCE,
);
/** Look slightly above the feet so the character sits near screen centre. */
const LOOK_HEIGHT = 0.6;

/**
 * Fixed-angle orthographic camera that smoothly tracks a target.
 * Uses frame-rate-independent exponential smoothing.
 */
export function FollowCamera({ target }: FollowCameraProps) {
  const camera = useThree((s) => s.camera);
  const size = useThree((s) => s.size);
  const focus = useRef(new THREE.Vector3());

  // Snap to the target immediately on mount so the first frame is not a pan.
  useLayoutEffect(() => {
    focus.current.copy(target.current);
    camera.position.set(focus.current.x, LOOK_HEIGHT, focus.current.z).add(OFFSET);
    camera.lookAt(focus.current.x, LOOK_HEIGHT, focus.current.z);
  }, [camera, target]);

  // Keep a constant number of world units visible vertically at any window size.
  useLayoutEffect(() => {
    if (camera instanceof THREE.OrthographicCamera) {
      camera.zoom = size.height / CAMERA_VIEW_HEIGHT;
      camera.updateProjectionMatrix();
    }
  }, [camera, size.height]);

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.1);
    const t = 1 - Math.exp(-CAMERA_FOLLOW_SHARPNESS * dt);
    focus.current.lerp(target.current, t);
    camera.position.set(
      focus.current.x + OFFSET.x,
      LOOK_HEIGHT + OFFSET.y,
      focus.current.z + OFFSET.z,
    );
    camera.lookAt(focus.current.x, LOOK_HEIGHT, focus.current.z);
  });

  return null;
}

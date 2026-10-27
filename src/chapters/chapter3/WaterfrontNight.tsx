/**
 * Chapter 3 — the Kuching waterfront an hour before dawn (lazy-loaded scene).
 * The Chapter 1 waterfront, darker, with the shophouse shutters down and a
 * wanted poster on every lamp post. Royal Security watch from the ferry pier.
 */
import type { SpawnPoint } from '../../data/scenes';
import { WaterfrontScene } from '../chapter1/Waterfront';
import { WF_BUILDINGS } from '../chapter1/data';
import { POSTER_LAMPS, WATERFRONT_NIGHT_LAYOUT } from './kuchingData';

const SHOPHOUSES = WF_BUILDINGS.filter((b) => b.id.startsWith('shop'));

export default function WaterfrontNight({ spawn }: { spawn: SpawnPoint }) {
  return (
    <WaterfrontScene spawn={spawn} layout={WATERFRONT_NIGHT_LAYOUT} time="night">
      {/* Roller shutters down over every shophouse front */}
      {SHOPHOUSES.map((b) => (
        <group key={b.id} position={[b.x, 0, b.z + b.depth / 2 + 0.02]}>
          <mesh position-y={0.85}>
            <planeGeometry args={[b.width - 0.4, 1.7]} />
            <meshStandardMaterial color="#6e7178" metalness={0.3} roughness={0.6} />
          </mesh>
          {[0.3, 0.6, 0.9, 1.2, 1.5].map((y) => (
            <mesh key={y} position={[0, y, 0.005]}>
              <planeGeometry args={[b.width - 0.4, 0.03]} />
              <meshBasicMaterial color="#4a4d54" />
            </mesh>
          ))}
        </group>
      ))}
      {/* A wanted poster on every lamp post, facing the plaza */}
      {POSTER_LAMPS.map((l, i) => (
        <group key={i} position={[l.x, 1.25, l.z + 0.08]}>
          <mesh>
            <planeGeometry args={[0.34, 0.44]} />
            <meshStandardMaterial color="#f2efe4" />
          </mesh>
          <mesh position={[0, 0.15, 0.002]}>
            <planeGeometry args={[0.26, 0.06]} />
            <meshBasicMaterial color="#b8302e" />
          </mesh>
          <mesh position={[0, -0.04, 0.002]}>
            <planeGeometry args={[0.16, 0.18]} />
            <meshBasicMaterial color="#5a5048" />
          </mesh>
        </group>
      ))}
      {/* The officers' torch on the pier */}
      <pointLight position={[9, 1.6, -4.0]} color="#e8f0ff" intensity={4} distance={4.5} />
    </WaterfrontScene>
  );
}

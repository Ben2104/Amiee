import {
  ROOM_SHELL,
  FLOOR,
  MEZZANINE_FLOOR,
  STAIRS,
  LOUNGE,
  BAR,
  TABLES,
  DELIVERY_BOT,
  DECOR,
  type BoxSpec,
} from "./cafeData";
import { PALETTE, LIGHTING } from "@/lib/diorama";

function Boxes({ specs }: { specs: BoxSpec[] }) {
  return (
    <>
      {specs.map((spec, i) => (
        <mesh key={i} position={spec.position}>
          <boxGeometry args={spec.size} />
          <meshStandardMaterial color={spec.color} roughness={0.9} metalness={0} flatShading />
        </mesh>
      ))}
    </>
  );
}

export function CafeModel() {
  return (
    <group name="cafe-model">
      <group name="room">
        <Boxes specs={ROOM_SHELL} />
      </group>
      <group name="floor">
        <Boxes specs={FLOOR} />
      </group>
      <group name="mezzanine">
        <Boxes specs={MEZZANINE_FLOOR} />
      </group>
      <group name="stairs">
        <Boxes specs={STAIRS} />
      </group>
      <group name="lounge">
        <Boxes specs={LOUNGE} />
      </group>
      <group name="bar">
        <Boxes specs={BAR} />
      </group>
      <group name="tables">
        <Boxes specs={TABLES} />
      </group>
      <group name="deliveryBot">
        <Boxes specs={DELIVERY_BOT} />
      </group>
      <group name="decor">
        <Boxes specs={DECOR} />
      </group>
      <pointLight position={[2.5, 4.8, 1.0]} color={PALETTE.warmLight} intensity={LIGHTING.pointLightIntensity} decay={LIGHTING.pointLightDecay} />
      <pointLight position={[5.0, 4.8, 1.0]} color={PALETTE.warmLight} intensity={LIGHTING.pointLightIntensity} decay={LIGHTING.pointLightDecay} />
      <pointLight position={[2.4, 4.8, 3.2]} color={PALETTE.warmLight} intensity={LIGHTING.pointLightIntensity} decay={LIGHTING.pointLightDecay} />
      <pointLight position={[5.2, 4.8, 3.4]} color={PALETTE.warmLight} intensity={LIGHTING.pointLightIntensity} decay={LIGHTING.pointLightDecay} />
    </group>
  );
}

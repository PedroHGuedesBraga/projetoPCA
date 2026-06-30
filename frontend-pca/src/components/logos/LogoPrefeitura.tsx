export default function LogoPrefeitura({ size = 44 }: { size?: number }) {
  return (
    <img
      src="/brasao-nazarezinho.png"
      alt="Brasão de Nazarezinho"
      width={size}
      height={size}
      style={{ objectFit: "contain", filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.5))" }}
    />
  );
}

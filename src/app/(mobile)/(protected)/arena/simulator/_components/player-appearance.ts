export function playerShirt(away: boolean, goalkeeper: boolean) {
  if (goalkeeper) return away ? 0xfa668f : 0x47c4ef;
  return away ? 0xef642f : 0x88d33b;
}

export function playerSkin(number: number) {
  return [0x995e43, 0xd89b76, 0x724735, 0xe4b492][(number - 1) % 4];
}

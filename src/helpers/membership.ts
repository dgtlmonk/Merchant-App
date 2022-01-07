export function getMembershipDetails(
  programId: string,
  tierLevel: number,
  programs: any[] | null
) {
  if (!programs || !programs.length) return null;

  const currentProgram = programs.filter(
    (program) => program.programId === programId
  )[0];

  // @ts-ignore
  if (currentProgram && currentProgram?.tiers) {
    // @ts-ignore
    const { tiers } = currentProgram;

    if (tiers && tiers.length) {
      const currentMembership = tiers.filter(
        (tier) => tier.level == tierLevel
      )[0];

      return currentMembership;
    }

    return null;
  }

  return null;
}

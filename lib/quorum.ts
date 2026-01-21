export function requiredQuorum(totalTeachers: number): number {
  if (totalTeachers <= 0) {
    return 0;
  }
  return Math.ceil(totalTeachers * 0.7);
}

export function quorumStatus(presentCount: number, totalTeachers: number) {
  const required = requiredQuorum(totalTeachers);
  return {
    required,
    ok: presentCount >= required
  };
}

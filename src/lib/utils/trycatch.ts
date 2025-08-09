export async function trycatch<T>(promise: Promise<T>): Promise<{
  data: T | null;
  error: unknown | null;
}> {
  try {
    const data = await promise;
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

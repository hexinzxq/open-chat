export interface HealthResponse {
  service: string;
  status: "ok";
  version: string;
}

const apiUrl =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

export async function getApiHealth(): Promise<HealthResponse> {
  const response = await fetch(`${apiUrl}/health/live`, {
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`API health check failed with ${response.status}`);
  }

  return response.json() as Promise<HealthResponse>;
}

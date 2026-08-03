export interface ApiError {
  readonly timestamp: string | null;
  readonly status: number;
  readonly code: string;
  readonly message: string;
  readonly path: string | null;
  readonly fieldErrors?: Readonly<Record<string, string>>;
}

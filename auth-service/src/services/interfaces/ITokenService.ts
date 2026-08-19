export interface ITokenService {
  refresh(refreshToken: string): Promise<{ accessToken: string; message: string }>;
}

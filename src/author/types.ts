export interface CreateAuthorsDTO {
  email: string;
  firstname?: string;
  lastname?: string;
  squad?: string;
  tribe?: string;
  chapter?: string;
  provider?: string;
  role?: string;
  /**
   * TODO: check this
   * this shloud be an enum like working, not-working or may
   */
  status?: string;
}
